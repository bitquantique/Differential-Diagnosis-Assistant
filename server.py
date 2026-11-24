from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from src.analyzer import analyze_patient_record
from src.schemas import DifferentialReport

app = FastAPI(title="Differential Diagnosis Assistant API")

# 1. Define the incoming request payload shape
class AnalysisRequest(BaseModel):
    notes: str

# 2. The API route that the browser will call
@app.post("/api/analyze", response_model=DifferentialReport)
def analyze_notes(request: AnalysisRequest):
    # Reject empty or whitespace-only inputs
    if not request.notes.strip():
        raise HTTPException(
            status_code=400, detail="Clinical notes cannot be empty."
        )

    try:
        # Run local LLM inference via your existing analyzer
        report = analyze_patient_record(request.notes)
        return report
    except Exception as e:
        # Return 500 if Ollama fails or something goes wrong
        raise HTTPException(status_code=500, detail=str(e))

# 3. Serve the frontend files from the "static" folder
# html=True means visiting "/" will automatically load static/index.html
app.mount("/", StaticFiles(directory="static", html=True), name="static")

if __name__ == "__main__":
    import uvicorn

    # Run the ASGI server locally on port 8000
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True)