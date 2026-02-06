"""
Fine-tune Whisper for Hmong Language (Simplified Version)
Uses librosa directly for audio loading to avoid decoder issues
"""

import os
import csv
import torch
import librosa
import numpy as np
from pathlib import Path
from dataclasses import dataclass
from typing import Any, Dict, List, Union
import warnings

# Suppress librosa future warning for audioread fallback
warnings.filterwarnings("ignore", category=FutureWarning, module="librosa")

from transformers import (
    WhisperFeatureExtractor,
    WhisperTokenizer,
    WhisperProcessor,
    WhisperForConditionalGeneration,
    Seq2SeqTrainingArguments,
    Seq2SeqTrainer,
)
import evaluate


# Configuration
MODEL_NAME = "openai/whisper-small"
DATASET_DIR = Path("hmong_dataset")
OUTPUT_DIR = Path("whisper-hmong-finetuned")
LANGUAGE = "vi"  # Vietnamese as base (Hmong not supported)
TASK = "transcribe"
SAMPLE_RATE = 16000


def load_audio(audio_path: str) -> np.ndarray:
    """Load audio file using librosa"""
    audio, sr = librosa.load(audio_path, sr=SAMPLE_RATE)
    return audio


def load_hmong_dataset():
    """Load dataset from CSV and audio files"""
    transcript_file = DATASET_DIR / "transcripts.csv"
    
    if not transcript_file.exists():
        raise FileNotFoundError(f"No transcripts.csv found in {DATASET_DIR}")
    
    data = []
    
    with open(transcript_file, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            audio_path = DATASET_DIR / row['audio_path']
            if audio_path.exists():
                data.append({
                    "audio_path": str(audio_path),
                    "text": row['text']
                })
            else:
                print(f"Warning: Audio file not found: {audio_path}")
    
    print(f"Loaded {len(data)} samples")
    return data


def prepare_features(samples, feature_extractor, tokenizer):
    """Prepare features for training"""
    prepared_data = {"input_features": [], "labels": []}
    
    for sample in samples:
        # Load audio
        audio = load_audio(sample["audio_path"])
        
        # Extract features
        input_features = feature_extractor(
            audio,
            sampling_rate=SAMPLE_RATE
        ).input_features[0]
        
        # Encode text
        labels = tokenizer(sample["text"]).input_ids
        
        prepared_data["input_features"].append(input_features)
        prepared_data["labels"].append(labels)
    
    return prepared_data


@dataclass
class DataCollatorSpeechSeq2SeqWithPadding:
    """Data collator for speech-to-text tasks"""
    processor: Any
    decoder_start_token_id: int

    def __call__(self, features: List[Dict[str, Union[List[int], torch.Tensor]]]) -> Dict[str, torch.Tensor]:
        input_features = [{"input_features": f["input_features"]} for f in features]
        label_features = [{"input_ids": f["labels"]} for f in features]

        batch = self.processor.feature_extractor.pad(input_features, return_tensors="pt")
        labels_batch = self.processor.tokenizer.pad(label_features, return_tensors="pt")

        labels = labels_batch["input_ids"].masked_fill(
            labels_batch.attention_mask.ne(1), -100
        )

        if (labels[:, 0] == self.decoder_start_token_id).all().cpu().item():
            labels = labels[:, 1:]

        batch["labels"] = labels
        return batch


class SimpleDataset(torch.utils.data.Dataset):
    """Simple PyTorch dataset"""
    def __init__(self, data):
        self.data = data
    
    def __len__(self):
        return len(self.data["input_features"])
    
    def __getitem__(self, idx):
        return {
            "input_features": self.data["input_features"][idx],
            "labels": self.data["labels"][idx]
        }


def compute_metrics(pred, tokenizer, metric):
    """Compute WER metric"""
    pred_ids = pred.predictions
    label_ids = pred.label_ids

    label_ids[label_ids == -100] = tokenizer.pad_token_id

    pred_str = tokenizer.batch_decode(pred_ids, skip_special_tokens=True)
    label_str = tokenizer.batch_decode(label_ids, skip_special_tokens=True)

    wer = 100 * metric.compute(predictions=pred_str, references=label_str)
    return {"wer": wer}


def main():
    print("=" * 60)
    print("🎤 Whisper Fine-tuning for Hmong Language")
    print("=" * 60)
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {device}")
    
    if device == "cpu":
        print("⚠️  Warning: Training on CPU will be slow!")
    
    # Load dataset
    print("\n📂 Loading dataset...")
    raw_data = load_hmong_dataset()
    
    if len(raw_data) < 5:
        print(f"⚠️  Only {len(raw_data)} samples. Recommend at least 50+ for good results.")
    
    # Split dataset (80/20)
    split_idx = int(len(raw_data) * 0.8)
    train_samples = raw_data[:split_idx]
    test_samples = raw_data[split_idx:]
    
    print(f"   Train: {len(train_samples)}, Test: {len(test_samples)}")
    
    # Load model and processor
    print(f"\n🔄 Loading model: {MODEL_NAME}")
    
    feature_extractor = WhisperFeatureExtractor.from_pretrained(MODEL_NAME)
    tokenizer = WhisperTokenizer.from_pretrained(MODEL_NAME, language=LANGUAGE, task=TASK)
    processor = WhisperProcessor.from_pretrained(MODEL_NAME, language=LANGUAGE, task=TASK)
    
    model = WhisperForConditionalGeneration.from_pretrained(MODEL_NAME)
    model.generation_config.language = None
    model.generation_config.task = TASK
    model.generation_config.forced_decoder_ids = None
    
    # Prepare features
    print("\n⚙️  Preparing dataset (loading audio)...")
    train_data = prepare_features(train_samples, feature_extractor, tokenizer)
    test_data = prepare_features(test_samples, feature_extractor, tokenizer)
    
    train_dataset = SimpleDataset(train_data)
    test_dataset = SimpleDataset(test_data)
    
    print(f"   Prepared {len(train_dataset)} train, {len(test_dataset)} test samples")
    
    # Data collator
    data_collator = DataCollatorSpeechSeq2SeqWithPadding(
        processor=processor,
        decoder_start_token_id=model.config.decoder_start_token_id,
    )
    
    # Metric
    metric = evaluate.load("wer")
    
    # Sort out device and pin_memory
    use_cuda = torch.cuda.is_available()
    
    # Training arguments
    training_args = Seq2SeqTrainingArguments(
        output_dir=str(OUTPUT_DIR),
        per_device_train_batch_size=2,
        gradient_accumulation_steps=4,
        learning_rate=1e-5,
        warmup_steps=5,
        max_steps=50,
        gradient_checkpointing=True,
        fp16=use_cuda,
        # Optimize dataloader for CPU vs GPU
        dataloader_pin_memory=use_cuda, 
        eval_strategy="steps",
        per_device_eval_batch_size=2,
        predict_with_generate=True,
        generation_max_length=225,
        save_steps=25,
        eval_steps=25,
        logging_steps=10,
        report_to=[],
        load_best_model_at_end=True,
        metric_for_best_model="wer",
        greater_is_better=False,
        push_to_hub=False,
    )
    
    # Trainer
    trainer = Seq2SeqTrainer(
        args=training_args,
        model=model,
        train_dataset=train_dataset,
        eval_dataset=test_dataset,
        data_collator=data_collator,
        compute_metrics=lambda pred: compute_metrics(pred, tokenizer, metric),
        processing_class=processor.feature_extractor,
    )
    
    # Train!
    print("\n🚀 Starting training...")
    trainer.train()
    
    # Save model
    print(f"\n💾 Saving model to {OUTPUT_DIR}")
    trainer.save_model()
    processor.save_pretrained(OUTPUT_DIR)
    
    print("\n✅ Training complete!")
    print(f"   Model saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
