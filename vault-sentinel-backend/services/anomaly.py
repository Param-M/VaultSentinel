"""
anomaly.py — ML-based resurrection detection using Isolation Forest.
Detects when a previously dormant API suddenly shows traffic spikes.
"""
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import List, Dict, Any, Optional
import pickle
import os

MODEL_PATH = "/tmp/vault_sentinel_isolation_forest.pkl"


def train_model(traffic_data: List[Dict[str, float]]) -> IsolationForest:
    """
    Train an Isolation Forest on historical traffic data.
    Each record: { request_count, hour_of_day, day_of_week, error_rate, response_time_ms }
    """
    if not traffic_data or len(traffic_data) < 10:
        # Return untrained model with default params if not enough data
        return IsolationForest(contamination=0.1, random_state=42)

    features = np.array([
        [
            r.get("request_count", 0),
            r.get("hour_of_day", 12),
            r.get("day_of_week", 0),
            r.get("error_rate", 0.0),
            r.get("response_time_ms", 200),
        ]
        for r in traffic_data
    ])

    model = IsolationForest(
        contamination=0.05,  # expect 5% anomalies
        n_estimators=100,
        random_state=42,
    )
    model.fit(features)

    # Persist model
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)

    return model


def _load_model() -> Optional[IsolationForest]:
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            return pickle.load(f)
    return None


def detect_resurrection(
    endpoint: str,
    current_request_count: int,
    inactive_days: int,
    hour_of_day: int = 12,
    day_of_week: int = 0,
    error_rate: float = 0.0,
    response_time_ms: float = 200,
) -> Dict[str, Any]:
    """
    Returns resurrection detection result for a single endpoint.
    Resurrection = dormant API (inactive_days > 30) showing new traffic.
    """
    # Heuristic fast-path: if endpoint was inactive for >30 days and now has traffic
    heuristic_resurrection = inactive_days > 30 and current_request_count > 0

    # ML-based anomaly detection
    model = _load_model()
    anomaly_score = 0.0
    is_anomaly = False

    if model and current_request_count > 0:
        features = np.array([[
            current_request_count,
            hour_of_day,
            day_of_week,
            error_rate,
            response_time_ms,
        ]])
        prediction = model.predict(features)  # -1 = anomaly, 1 = normal
        anomaly_score = float(-model.score_samples(features)[0])  # higher = more anomalous
        is_anomaly = prediction[0] == -1

    resurrection_detected = heuristic_resurrection or is_anomaly

    return {
        "endpoint": endpoint,
        "resurrection_detected": resurrection_detected,
        "heuristic_trigger": heuristic_resurrection,
        "ml_anomaly": is_anomaly,
        "anomaly_score": round(anomaly_score, 4),
        "inactive_days": inactive_days,
        "current_request_count": current_request_count,
        "risk_bonus": 25 if resurrection_detected else 0,
        "explanation": (
            f"Traffic resurrection detected: endpoint was inactive for {inactive_days} days "
            f"and now shows {current_request_count} requests. Possible unauthorized reactivation."
        ) if resurrection_detected else "No resurrection detected.",
    }
