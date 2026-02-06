"""
Test Whisper with forced language settings for Hmong
Since Hmong is not directly supported, we try Vietnamese (vi) 
which is linguistically closer to Hmong than Chinese
"""

import whisper
import sys


def transcribe_hmong_whisper(audio_path: str):
    """Transcribe Hmong using Whisper with different language settings"""
    
    print("Loading Whisper small model...")
    model = whisper.load_model("small")
    
    # Test different approaches
    approaches = [
        {"language": None, "task": "transcribe", "name": "Auto-detect"},
        {"language": "vi", "task": "transcribe", "name": "Vietnamese (closest)"},
        {"language": "zh", "task": "transcribe", "name": "Chinese"},
        {"language": "th", "task": "transcribe", "name": "Thai"},
    ]
    
    print(f"\nAudio file: {audio_path}")
    print("=" * 60)
    
    for approach in approaches:
        print(f"\n🔤 Approach: {approach['name']}")
        print("-" * 40)
        
        try:
            result = model.transcribe(
                audio_path,
                language=approach["language"],
                task=approach["task"],
            )
            
            detected = result.get("language", "N/A")
            text = result.get("text", "").strip()
            
            print(f"   Detected language: {detected}")
            print(f"   Result: {text}")
            
        except Exception as e:
            print(f"   Error: {e}")
    
    print("\n" + "=" * 60)
    print("Note: Hmong is not in Whisper's supported languages.")
    print("Best results may come from Vietnamese or using a fine-tuned model.")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python test_whisper_hmong.py <audio_file>")
        sys.exit(1)
    
    audio_file = sys.argv[1]
    transcribe_hmong_whisper(audio_file)
