"""
Test Mnong ASR Model for Hmong Speech Recognition
This script uses the legendary2910/Mnong-ASR-v1-enhanced model
which is fine-tuned from openai/whisper-medium on Mnong language
(a related language in the Hmong-Mien family)
"""

import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline
import sys


def transcribe_hmong(audio_path: str):
    """Transcribe Hmong audio using Mnong ASR model"""
    
    device = "cuda:0" if torch.cuda.is_available() else "cpu"
    torch_dtype = torch.float16 if torch.cuda.is_available() else torch.float32
    
    model_id = "legendary2910/Mnong-ASR-v1-enhanced"
    
    print(f"Loading model: {model_id}")
    print(f"Device: {device}")
    
    # Load model and processor
    model = AutoModelForSpeechSeq2Seq.from_pretrained(
        model_id,
        torch_dtype=torch_dtype,
        low_cpu_mem_usage=True,
        use_safetensors=True
    )
    model.to(device)
    
    processor = AutoProcessor.from_pretrained(model_id)
    
    # Create pipeline
    pipe = pipeline(
        "automatic-speech-recognition",
        model=model,
        tokenizer=processor.tokenizer,
        feature_extractor=processor.feature_extractor,
        torch_dtype=torch_dtype,
        device=device,
    )
    
    print(f"\nTranscribing: {audio_path}")
    print("-" * 50)
    
    # Transcribe
    result = pipe(audio_path)
    
    print(f"Result: {result['text']}")
    return result['text']


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_mnong_asr.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    transcribe_hmong(audio_file)
