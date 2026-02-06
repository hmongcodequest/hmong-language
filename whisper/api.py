from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import torch
import shutil
import os
import csv
from pathlib import Path
import time
import warnings
import logging

# Suppress ALL warnings from librosa (including UserWarning from soundfile fallback)
warnings.filterwarnings("ignore", category=UserWarning)
warnings.filterwarnings("ignore", category=FutureWarning)

# Suppress transformers logits_processor warnings (they use logging, not warnings)
logging.getLogger("transformers.generation.utils").setLevel(logging.ERROR)

# Now import librosa after suppression is set
import librosa
from transformers import WhisperProcessor, WhisperForConditionalGeneration

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model globally on startup(
device = "cuda" if torch.cuda.is_available() else "cpu"
model_dir = "whisper-hmong-finetuned"

# Check if model exists
if not os.path.exists(model_dir):
    print(f"WARNING: Model directory '{model_dir}' not found.")
else:
    print(f"Loading model from {model_dir} on {device}...")
    try:
        processor = WhisperProcessor.from_pretrained(model_dir)
        model = WhisperForConditionalGeneration.from_pretrained(model_dir)
        model.to(device)
        print("Model loaded successfully.")
    except Exception as e:
        print(f"Error loading model: {e}")

@app.get("/")
def read_root():
    return {"status": "online", "model": model_dir, "device": device}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    """
    Upload an audio file and transcribe it using the loaded Whisper model.
    """
    filename = file.filename
    temp_filename = f"temp_{filename}"
    
    try:
        # Save uploaded file temporarily
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Load and process audio
        # Whisper expects 16kHz audio
        audio, sr = librosa.load(temp_filename, sr=16000)
        
        # Process audio and get input features
        inputs = processor(
            audio, 
            sampling_rate=16000, 
            return_tensors="pt"
        )
        input_features = inputs.input_features.to(device)
        
        # Create attention mask (all 1s for non-padded input)
        attention_mask = torch.ones(input_features.shape[:-1], dtype=torch.long, device=device)
        
        # Generate transcription with attention mask to avoid warning
        # Suppress logits processor warnings
        with warnings.catch_warnings():
            warnings.filterwarnings("ignore", message=".*logits_processor.*")
            predicted_ids = model.generate(
                input_features,
                attention_mask=attention_mask
            )
        
        # Decode
        transcription = processor.batch_decode(
            predicted_ids, 
            skip_special_tokens=True
        )[0]
        
        return {
            "filename": filename,
            "transcription": transcription
        }
        
    except Exception as e:
        return {"error": str(e)}
        
    finally:
        # Clean up temp file
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

@app.post("/dataset/add")
async def add_to_dataset(
    file: UploadFile = File(...),
    text: str = Form(...)
):
    """
    Add audio and transcript to the Hmong dataset.
    - Saves audio to hmong_dataset/audio/
    - Appends metadata to hmong_dataset/transcripts.csv
    """
    dataset_dir = Path("hmong_dataset")
    audio_dir = dataset_dir / "audio"
    transcript_file = dataset_dir / "transcripts.csv"
    
    # Ensure directories exist
    audio_dir.mkdir(parents=True, exist_ok=True)
    
    # Create unique filename to avoid collisions
    timestamp = int(time.time())
    original_name = Path(file.filename).stem
    extension = Path(file.filename).suffix
    if not extension:
        extension = ".webm" # Default for recorded audio
        
    safe_filename = f"{original_name}_{timestamp}{extension}"
    file_path = audio_dir / safe_filename
    
    try:
        # Save audio file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Append to CSV
        file_exists = transcript_file.exists()
        
        with open(transcript_file, 'a', encoding='utf-8', newline='') as f:
            writer = csv.writer(f)
            # Write header if file is new
            if not file_exists:
                writer.writerow(['audio_path', 'text'])
            
            # Write data (relative path format as expected by create_hmong_dataset.py)
            # create_hmong_dataset.py writes 'audio/filename.mp3'
            writer.writerow([f'audio/{safe_filename}', text])
            
        return {
            "status": "success",
            "filename": safe_filename,
            "text": text
        }
        
    except Exception as e:
        return {"error": str(e)}

@app.get("/dataset/count")
async def get_dataset_count():
    """Get the number of samples in the dataset."""
    try:
        dataset_dir = Path("hmong_dataset")
        transcript_file = dataset_dir / "transcripts.csv"
        
        if not transcript_file.exists():
            return {"count": 0}
            
        with open(transcript_file, 'r', encoding='utf-8') as f:
            # Subtract 1 for header
            count = sum(1 for line in f) - 1
            return {"count": max(0, count)}
    except Exception:
        return {"count": 0}

@app.get("/train/stream")
async def stream_training():
    """
    Stream fine-tuning process logs via Server-Sent Events (SSE).
    Frontend should use EventSource to consume this endpoint.
    """
    import subprocess
    import sys
    import asyncio
    from fastapi.responses import StreamingResponse
    
    script_path = "fine_tune_hmong.py"
    if not os.path.exists(script_path):
        async def error_generator():
            yield f"data: {{'type': 'error', 'message': 'Training script not found'}}\n\n"
        return StreamingResponse(error_generator(), media_type="text/event-stream")
    
    async def generate_logs():
        # Set up environment with UTF-8 encoding for Windows
        env = os.environ.copy()
        env["PYTHONIOENCODING"] = "utf-8"
        
        # Start subprocess with stdout/stderr merged
        process = subprocess.Popen(
            [sys.executable, "-u", script_path],  # -u for unbuffered output
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            cwd=os.getcwd(),
            env=env,
            encoding="utf-8",
            errors="replace"  # Replace any characters that can't be encoded
        )
        
        yield f"data: {{\"type\": \"start\", \"message\": \"Training started...\"}}\n\n"
        
        step = 0
        max_steps = 50  # from fine_tune_hmong.py
        
        try:
            for line in iter(process.stdout.readline, ''):
                if not line:
                    break
                    
                clean_line = line.strip()
                if not clean_line:
                    continue
                
                # Parse progress from logs if possible
                if "Training step" in clean_line or "step" in clean_line.lower():
                    try:
                        # Try to extract step number
                        import re
                        match = re.search(r'(\d+)/(\d+)', clean_line)
                        if match:
                            step = int(match.group(1))
                            max_steps = int(match.group(2))
                    except:
                        pass
                
                progress = min(95, int((step / max_steps) * 100)) if max_steps > 0 else 0
                
                # Escape quotes for JSON
                escaped_line = clean_line.replace('"', '\\"').replace('\n', ' ')
                yield f"data: {{\"type\": \"log\", \"message\": \"{escaped_line}\", \"progress\": {progress}}}\n\n"
                
                await asyncio.sleep(0.01)  # Small delay to prevent overwhelming
            
            process.wait()
            
            if process.returncode == 0:
                yield f"data: {{\"type\": \"complete\", \"message\": \"✅ Training complete!\", \"progress\": 100}}\n\n"
            else:
                yield f"data: {{\"type\": \"error\", \"message\": \"Training failed with code {process.returncode}\"}}\n\n"
                
        except Exception as e:
            yield f"data: {{\"type\": \"error\", \"message\": \"Error: {str(e)}\"}}\n\n"
        finally:
            if process.poll() is None:
                process.terminate()
    
    return StreamingResponse(generate_logs(), media_type="text/event-stream")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
