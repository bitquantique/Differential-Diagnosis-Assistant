from pydantic import BaseModel, Field
from typing import Literal

class DiagnosisOption(BaseModel):
    diag_name: str = Field(description="Diagnosis Name / Condition (e.g., 'Acute Appendicitis')")
    reason: list[str] = Field(description="Reasons for why you chose this diagnosis")
    supporting_ev: list[str] = Field(description="a list of findings or symptoms that fit the diagnosis you chose")
    contradicting_ev: list[str] = Field(description="a list of findings or symptoms that make this diagnosis less likely or even contradict it")
    symptoms_explained: list[str] = Field(description="a list of symptoms accounted for by the diagnosis")
    symptoms_unexplained: list[str] = Field(description="a list of symptoms that this diagnosis does not account for")
    missing_ev: list[str] = Field(description="list of evidences that would explain things more but are missing")
    confidence: Literal["High", "Medium", "Low"] = Field(description="How confident are you in this diagnosis, write only Low/Medium/High confidence")

class DifferentialReport(BaseModel):
    diag: list[DiagnosisOption] = Field(description="List of all the possible diagnosis you made")
    summary: str = Field(description="Summarize the overall report/status of the patient")
    next_recs: list[str] = Field(description="Recommended next steps or diagnostic tests (e.g., Order CBC, Abdominal Ultrasound etc).")
