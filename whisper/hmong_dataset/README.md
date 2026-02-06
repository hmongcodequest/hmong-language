# Hmong Dataset

ໂຟລເດີນີ້ໃຊ້ສຳລັບເກັບ audio ແລະ transcript ພາສາມົ້ງ

## ໂຄງສ້າງ

```
hmong_dataset/
├── audio/           # ໃສ່ໄຟລ໌ .mp3, .wav, .flac ຢູ່ນີ້
├── transcripts.csv  # ຕາຕະລາງ audio + ຂໍ້ຄວາມ
└── README.md
```

## ວິທີໃຊ້

1. ໃສ່ໄຟລ໌ audio ໃນໂຟລເດີ `audio/`
2. Run: `python create_hmong_dataset.py`
3. ພິມຄຳບັນຍາຍ (transcript) ສຳລັບແຕ່ລະໄຟລ໌

## ຕົວຢ່າງ transcript

| audio   | text                  |
| ------- | --------------------- |
| 001.wav | Nyob zoo os           |
| 002.wav | Koj hu li cas         |
| 003.wav | Kuv lub npe hu ua Kao |

## ໝາຍເຫດ

- ໃຊ້ RPA (Romanized Popular Alphabet) ສຳລັບ writing
- ຂຽນຕາມສຽງທີ່ເວົ້າແທ້ໆ
- ຍິ່ງມີຫຼາຍໄຟລ໌ ຍິ່ງດີ (ແນະນຳ 50+ ໄຟລ໌)
