# AstraVault ML Service

FastAPI service for mission success prediction, rocket reliability scoring, failure pattern analysis, launch vehicle recommendation, and risk explanation.

## Run Locally

```bash
cd ml-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python train.py
uvicorn main:app --reload --port 8000
```

On macOS/Linux, activate with:

```bash
source venv/bin/activate
```

The service reads `DATABASE_URL` from the project root `.env`. If PostgreSQL is unavailable, `train.py` creates a development model from bundled seed-like mission examples so the API can still boot.

## Endpoints

- `POST /predict-mission-success`
- `GET /rocket-reliability/{rocketId}`
- `POST /recommend-launch-vehicle`
- `GET /failure-patterns`
- `POST /mission-risk-analysis`
- `GET /health`
