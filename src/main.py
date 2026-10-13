from schemas import DifferentialReport
from analyzer import analyze_patient_record
from load_records import load_patient_records

def main():
    record = load_patient_records()
    report = analyze_patient_record(record)
    print_report(report)

def print_list(label: str, items: list[str]):
    print(f"\n    {label}:")
    if not items:
        print("      -None Noted")
    else:
        for item in items:
            print(f"      -{item}")

def print_report(report: DifferentialReport):
    if len(report.diag) == 0:
        return "No Diagnosis Made"
    print("======================================================================\nDIFFERENTIAL DIAGNOSIS REPORT\n======================================================================")
    print(f"\nClinical Summary:\n{report.summary}\n")
    print("----------------------------------------------------------------------\nDIFFERENTIAL DIAGNOSES (Sorted by Confidence):\n----------------------------------------------------------------------")
    priority = {"High": 0, "Medium": 1, "Low": 2}
    report.diag.sort(key=lambda d: priority[d.confidence])
    count = 1
    for diag in report.diag:
        print(f"\n[{count}] {diag.diag_name} | Confidence: {diag.confidence}")
        print_list("Rationale", diag.reason)
        print_list("Supporting Evidence", diag.supporting_ev)
        print_list("Contradicting Evidence", diag.contradicting_ev)
        print_list("Symptoms Explained", diag.symptoms_explained)
        print_list("Symptoms Unexplained", diag.symptoms_unexplained)
        print_list("Missing Evidence", diag.missing_ev)
        count += 1
    print("\n----------------------------------------------------------------------\nRECOMMENDED NEXT STEPS / TESTS:\n----------------------------------------------------------------------\n")
    if len(report.next_recs) == 0:
        print("None")
    else:
        for item in report.next_recs:
            print(f" - {item}")
    print("\n======================================================================")
main()