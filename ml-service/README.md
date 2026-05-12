# AstraVault ML Service

Production-oriented FastAPI service for aerospace mission intelligence.

## Stack

- Anaconda environment: `astravault-ml`
- Python 3.11
- FastAPI + Uvicorn
- Pandas, NumPy
- Scikit-learn RandomForest
- Optional XGBoost classifier when installed
- Joblib model artifacts
- Matplotlib/Seaborn/Jupyter for internal analysis

## Commands

```bash
conda env create -f environment.yml
conda activate astravault-ml
python train.py
uvicorn main:app --reload --port 8000
```

The service runs at `http://localhost:8000`.

## Endpoints

- `GET /`
- `POST /predict-mission-success`
- `POST /rocket-reliability`
- `GET /failure-patterns`
- `POST /recommend-launch-vehicle`
- `POST /mission-risk-analysis`
- `POST /train`
- `GET /model-info`

## Artifacts

- `models/mission_success_model.pkl`
- `models/rocket_reliability_model.pkl`
- `models/model_metadata.json`

Training data lives at `data/missions.csv`. The dataset is synthetic but realistic and can be replaced or expanded with real mission rows.
