from fastapi import FastAPI
from pydantic import BaseModel
import pandas as pd
import joblib
import os

app = FastAPI()

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.abspath(os.path.join(BASE_DIR, '../data'))
MODEL_DIR = os.path.abspath(os.path.join(BASE_DIR, '../models'))

FEATURES = {
    'Kidney': [
        'hla_score', 'renal_score', 'imaging_score', 'cardiac_score',
        'distance_km', 'urgency_level'
    ],
    'Heart': [
        'blood_compat_score', 'echo_score', 'angiography_score', 'viral_score', 'cardiac_risk_score',
        'distance_km', 'urgency_level'
    ],
    'Liver': [
        'blood_compat_score', 'liver_function_score', 'imaging_score', 'viral_score', 'coagulation_score',
        'distance_km', 'urgency_level'
    ],
    'Cornea': [
        'infection_score', 'eye_health_score', 'serology_score',
        'distance_km', 'urgency_level'
    ]
}

MODEL_PATHS = {
    'Kidney': os.path.join(MODEL_DIR, 'kidney_model.joblib'),
    'Heart': os.path.join(MODEL_DIR, 'heart_model.joblib'),
    'Liver': os.path.join(MODEL_DIR, 'liver_model.joblib'),
    'Cornea': os.path.join(MODEL_DIR, 'cornea_model.joblib')
}

class MatchRequest(BaseModel):
    organ: str
    donor_patient_data: list  # List of dicts, each dict = donor–patient features

@app.post('/predict_and_rank')
def predict_and_rank_api(req: MatchRequest):
    organ = req.organ.title()  # Normalize to title case (e.g., 'kidney' -> 'Kidney')
    data = req.donor_patient_data
    features = FEATURES[organ]
    model = joblib.load(MODEL_PATHS[organ])
    df = pd.DataFrame(data)
    X = df[features]
    df['predicted_match_score'] = model.predict(X)
    ranked = df.sort_values('predicted_match_score', ascending=False)
    return ranked.head(5).to_dict(orient='records')
