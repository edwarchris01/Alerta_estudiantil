"""
Módulo de Machine Learning — Fase 2
Predicción de deserción estudiantil usando modelos supervisados.

Modelos soportados:
  - Logistic Regression (baseline)
  - Random Forest
  - XGBoost (requiere instalación adicional)

USO: Este módulo se activa cuando existen suficientes datos históricos
     para entrenar un modelo con precisión aceptable (>= 70% AUC-ROC).
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Optional, Dict, Any, List
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

MODEL_DIR = os.path.join(os.path.dirname(__file__), "trained_models")
os.makedirs(MODEL_DIR, exist_ok=True)


class DropoutPredictor:
    """Predictor de deserción estudiantil."""

    FEATURE_COLUMNS: List[str] = [
        "cumulative_gpa",
        "failed_courses",
        "absences",
        "repeated_courses",
        "semester",
        "is_scholarship",
        "survey_motivation_avg",
        "survey_economic_avg",
        "survey_emotional_avg",
        "survey_adaptation_avg",
        "survey_carga_avg",
    ]

    def __init__(self) -> None:
        self.model = None
        self.scaler = StandardScaler()
        self.model_name: str = "logistic_regression"
        self.is_trained: bool = False

    # ── Preparación ──────────────────────────────────

    def prepare_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Limpia y prepara las features para el modelo."""
        features = df[self.FEATURE_COLUMNS].copy()
        features = features.fillna(features.median())
        features["is_scholarship"] = features["is_scholarship"].astype(int)
        return features

    # ── Entrenamiento ────────────────────────────────

    def train(
        self,
        df: pd.DataFrame,
        target_col: str = "dropped_out",
        model_type: str = "random_forest",
    ) -> Dict[str, Any]:
        """
        Entrena el modelo con datos históricos.

        Args:
            df: DataFrame con features y columna target.
            target_col: Columna objetivo (1 = desertó, 0 = continúa).
            model_type: ``logistic_regression`` | ``random_forest``.

        Returns:
            Diccionario con métricas de evaluación del modelo.
        """
        X = self.prepare_features(df)
        y = df[target_col].astype(int)

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y,
        )

        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)

        if model_type == "logistic_regression":
            self.model = LogisticRegression(
                random_state=42, max_iter=1000, class_weight="balanced",
            )
        elif model_type == "random_forest":
            self.model = RandomForestClassifier(
                n_estimators=100, random_state=42,
                class_weight="balanced", max_depth=10,
            )
        else:
            raise ValueError(f"Modelo no soportado: {model_type}")

        self.model_name = model_type
        self.model.fit(X_train_scaled, y_train)
        self.is_trained = True

        y_pred = self.model.predict(X_test_scaled)
        y_proba = self.model.predict_proba(X_test_scaled)[:, 1]

        # Usar Pipeline para evitar data leakage: el scaler se re-entrena
        # en cada fold de entrenamiento sin ver los datos de test del fold.
        cv_pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("model", self.model),
        ])
        cv_scores = cross_val_score(
            cv_pipeline, X, y, cv=5, scoring="roc_auc",
        )

        metrics: Dict[str, Any] = {
            "model_type": model_type,
            "auc_roc": round(float(roc_auc_score(y_test, y_proba)), 4),
            "cv_auc_mean": round(float(cv_scores.mean()), 4),
            "cv_auc_std": round(float(cv_scores.std()), 4),
            "classification_report": classification_report(y_test, y_pred, output_dict=True),
            "samples_train": len(X_train),
            "samples_test": len(X_test),
        }

        if hasattr(self.model, "feature_importances_"):
            importance = dict(
                zip(self.FEATURE_COLUMNS, self.model.feature_importances_.round(4))
            )
            metrics["feature_importance"] = dict(
                sorted(importance.items(), key=lambda x: x[1], reverse=True)
            )

        return metrics

    # ── Predicción ───────────────────────────────────

    def predict_probability(self, student_data: dict) -> float:
        """Retorna la probabilidad de deserción (0–100) para un estudiante."""
        if not self.is_trained:
            raise RuntimeError("El modelo no ha sido entrenado. Ejecute train() primero.")

        df = pd.DataFrame([student_data])
        X = self.prepare_features(df)
        X_scaled = self.scaler.transform(X)
        proba = self.model.predict_proba(X_scaled)[0][1]
        return round(float(proba) * 100, 2)

    # ── Persistencia ─────────────────────────────────

    def save(self, filename: str = "dropout_model") -> None:
        """Guarda el modelo y el scaler en disco."""
        if not self.is_trained:
            raise RuntimeError("No hay modelo entrenado para guardar.")
        path = os.path.join(MODEL_DIR, f"{filename}.joblib")
        joblib.dump(
            {"model": self.model, "scaler": self.scaler, "name": self.model_name},
            path,
        )

    def load(self, filename: str = "dropout_model") -> bool:
        """Carga un modelo previamente entrenado. Retorna True si tuvo éxito."""
        path = os.path.join(MODEL_DIR, f"{filename}.joblib")
        if not os.path.exists(path):
            return False
        data = joblib.load(path)
        self.model = data["model"]
        self.scaler = data["scaler"]
        self.model_name = data["name"]
        self.is_trained = True
        return True


# ── Singleton ──
predictor = DropoutPredictor()
