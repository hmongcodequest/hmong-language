import requests
import os

def test_api():
    base_url = "http://localhost:8000"
    
    # Test Root
    try:
        r = requests.get(f"{base_url}/")
        print(f"Root endpoint: {r.status_code}")
        print(r.json())
    except Exception as e:
        print(f"Failed to connect to root: {e}")
        return

    # Test Transcribe
    audio_file = "Nyob-zoo-os-Koj-hu-li-cas.mp3"
    if not os.path.exists(audio_file):
        print(f"Test audio file {audio_file} not found. Skipping transcribe test.")
        return

    print(f"Transcribing {audio_file}...")
    with open(audio_file, "rb") as f:
        files = {"file": f}
        r = requests.post(f"{base_url}/transcribe", files=files)
    
    print(f"Transcribe status: {r.status_code}")
    if r.status_code == 200:
        print(r.json())
    else:
        print(r.text)

if __name__ == "__main__":
    test_api()
