"""
Script: train_cornea.py
Purpose: Train a RandomForestRegressor for cornea donor–patient match scoring.
Author: Your Name
Date: 2025-12-19

- Loads cornea.csv
- Splits into train/test
- Trains RandomForestRegressor
- Evaluates with MAE
- Saves model to ../models/cornea_model.joblib
"""

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import joblib
from sklearn.metrics import r2_score, accuracy_score, f1_score, precision_score, recall_score


import os
# Use absolute paths
data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../data'))
model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '../models'))
os.makedirs(model_dir, exist_ok=True)

# Use only 100,000 rows to avoid memory issues
df = pd.read_csv(os.path.join(data_dir, 'cornea.csv')).sample(n=100_000, random_state=42)

# 2. Features and target
features = [
    'infection_score', 'eye_health_score', 'serology_score',
    'distance_km', 'urgency_level'
]
X = df[features]
y = df['match_score']

# 3. Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 4. Train model
model = RandomForestRegressor(n_estimators=50, random_state=42, n_jobs=-1)
model.fit(X_train, y_train)


# 5. Evaluate (regression)
preds = model.predict(X_test)
mae = mean_absolute_error(y_test, preds)
r2 = r2_score(y_test, preds)
print(f"Test MAE: {mae:.4f}")
print(f"Test R^2: {r2:.4f}")

# 6. Evaluate (classification: threshold 0.7)
threshold = 0.7
y_true_cls = (y_test >= threshold).astype(int)
y_pred_cls = (preds >= threshold).astype(int)
acc = accuracy_score(y_true_cls, y_pred_cls)
f1 = f1_score(y_true_cls, y_pred_cls)
prec = precision_score(y_true_cls, y_pred_cls)
rec = recall_score(y_true_cls, y_pred_cls)
print(f"Classification metrics (threshold={threshold}):")
print(f"  Accuracy:  {acc:.4f}")
print(f"  F1 score:  {f1:.4f}")
print(f"  Precision: {prec:.4f}")
print(f"  Recall:    {rec:.4f}")

# 6. Save model
model_path = os.path.join(model_dir, 'cornea_model.joblib')
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
os.makedirs(model_dir, exist_ok=True)
model_path = os.path.join(model_dir, 'cornea_model.joblib')
joblib.dump(model, model_path)
print(f"Model saved to {model_path}")
