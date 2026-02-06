# Language Learning App

This is a language learning app that uses AI to help you learn new languages.

## Project Structure

- `frontend/`: React + Vite + TypeScript frontend application
- `whisper/`: Python + FastAPI backend linked to a fine-tuned Whisper model

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Bun

### Installation

The application is split into two parts: Backend and Frontend. You need to set up both.

#### 1. Backend (API)

Navigate to the `whisper` directory and set up the Python environment:

```bash
cd whisper
python -m venv venv
```

Activate the virtual environment:
- **Windows**:
  ```bash
  venv\Scripts\activate
  ```
- **Mac/Linux**:
  ```bash
  source venv/bin/activate
  ```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

#### 2. Frontend (Client)

Navigate to the `frontend` directory and install dependencies:

```bash
cd frontend
bun install
```

### Usage

You need to run both the backend and frontend terminals simultaneously.

#### Terminal 1: Start the Backend

```bash
cd whisper
venv\Scripts\activate
python api.py
```
The API server will start at `http://localhost:8000`.

#### Terminal 2: Start the Frontend

```bash
cd frontend
bun dev
```
The web application will start (usually at `http://localhost:5173`). Open the link shown in your terminal to use the app.
