import sys
from pathlib import Path

def load_patient_records()-> str:
    if len(sys.argv[1])>1:
        file_path = Path(sys.argv[1])

        if not file_path.is_file():
            print(f"Error: File not found at {file_path}")

        text = ""
        with open(file_path, "r", encoding="utf-8") as f:
            text = f.read()

        return text

    print("No file provided. Paste patient note below (Press Ctrl+D or Ctrl+Z on Windows + Enter when done):")
    return sys.stdin.read()