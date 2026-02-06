"""
Transcribe Hmong using fine-tuned Whisper model
"""

import torch
from transformers import WhisperProcessor, WhisperForConditionalGeneration
import sys
from pathlib import Path


def transcribe_hmong(audio_path: str, model_dir: str = "whisper-hmong-finetuned"):
    """Transcribe Hmong audio using fine-tuned model"""
    
    model_path = Path(model_dir)
    if not model_path.exists():
        print(f"❌ Model not found: {model_dir}")
        print("   Please run fine_tune_hmong.py first!")
        return
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")
    
    # Load processor and model
    print(f"Loading model from: {model_dir}")
    processor = WhisperProcessor.from_pretrained(model_dir)
    model = WhisperForConditionalGeneration.from_pretrained(model_dir)
    model.to(device)
    
    # Load audio
    import librosa
    audio, sr = librosa.load(audio_path, sr=16000)
    
    # Process
    input_features = processor(
        audio, 
        sampling_rate=16000, 
        return_tensors="pt"
    ).input_features.to(device)
    
    # Generate
    predicted_ids = model.generate(input_features)
    
    # Decode
    transcription = processor.batch_decode(
        predicted_ids, 
        skip_special_tokens=True
    )[0]
    
    print(f"\n🎤 Audio: {audio_path}")
    print(f"📝 Transcription: {transcription}")
    
    return transcription


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python transcribe_hmong.py <audio_file> [model_dir]")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    model_dir = sys.argv[2] if len(sys.argv) > 2 else "whisper-hmong-finetuned"
    
    transcribe_hmong(audio_file, model_dir)
