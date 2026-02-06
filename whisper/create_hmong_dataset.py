"""
Hmong Dataset Creator Helper
This script helps you create a dataset for fine-tuning Whisper on Hmong language

Usage:
1. Put your Hmong audio files in hmong_dataset/audio/
2. Run this script to add transcripts interactively
3. Or manually edit hmong_dataset/transcripts.csv
"""

import os
import csv
from pathlib import Path

# Configuration
DATASET_DIR = Path("hmong_dataset")
AUDIO_DIR = DATASET_DIR / "audio"
TRANSCRIPT_FILE = DATASET_DIR / "transcripts.csv"


def list_audio_files():
    """List all audio files in the audio directory"""
    extensions = {'.mp3', '.wav', '.flac', '.ogg', '.m4a'}
    files = []
    for f in AUDIO_DIR.iterdir():
        if f.suffix.lower() in extensions:
            files.append(f.name)
    return sorted(files)


def load_existing_transcripts():
    """Load existing transcripts from CSV"""
    transcripts = {}
    if TRANSCRIPT_FILE.exists():
        with open(TRANSCRIPT_FILE, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                audio_path = row['audio_path'].replace('audio/', '')
                transcripts[audio_path] = row['text']
    return transcripts


def save_transcripts(transcripts):
    """Save transcripts to CSV"""
    with open(TRANSCRIPT_FILE, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['audio_path', 'text'])
        for audio, text in sorted(transcripts.items()):
            writer.writerow([f'audio/{audio}', text])


def add_transcript_interactive():
    """Interactive mode to add transcripts"""
    audio_files = list_audio_files()
    if not audio_files:
        print("❌ No audio files found in hmong_dataset/audio/")
        print("   Please add your Hmong audio files (.mp3, .wav, .flac) first!")
        return
    
    transcripts = load_existing_transcripts()
    
    print(f"\n📁 Found {len(audio_files)} audio files")
    print("=" * 50)
    
    for audio in audio_files:
        existing = transcripts.get(audio, '')
        
        print(f"\n🎵 File: {audio}")
        if existing:
            print(f"   Current: {existing}")
            new_text = input("   New transcript (Enter to keep, 'skip' to skip): ").strip()
            if new_text and new_text.lower() != 'skip':
                transcripts[audio] = new_text
        else:
            new_text = input("   Transcript (Hmong text): ").strip()
            if new_text:
                transcripts[audio] = new_text
    
    save_transcripts(transcripts)
    print(f"\n✅ Saved {len(transcripts)} transcripts to {TRANSCRIPT_FILE}")


def show_status():
    """Show current dataset status"""
    audio_files = list_audio_files()
    transcripts = load_existing_transcripts()
    
    print("\n📊 Dataset Status")
    print("=" * 50)
    print(f"Audio files: {len(audio_files)}")
    print(f"Transcripts: {len(transcripts)}")
    
    missing = [f for f in audio_files if f not in transcripts]
    if missing:
        print(f"\n⚠️  Missing transcripts for:")
        for f in missing[:5]:
            print(f"   - {f}")
        if len(missing) > 5:
            print(f"   ... and {len(missing) - 5} more")
    else:
        print("\n✅ All audio files have transcripts!")


def main():
    print("=" * 50)
    print("🎤 Hmong Dataset Creator for Whisper Fine-tuning")
    print("=" * 50)
    
    # Ensure directories exist
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    
    while True:
        print("\n📋 Menu:")
        print("1. Show dataset status")
        print("2. Add/edit transcripts (interactive)")
        print("3. Exit")
        
        choice = input("\nChoice (1-3): ").strip()
        
        if choice == '1':
            show_status()
        elif choice == '2':
            add_transcript_interactive()
        elif choice == '3':
            print("\nBye! 👋")
            break
        else:
            print("Invalid choice")


if __name__ == "__main__":
    main()
