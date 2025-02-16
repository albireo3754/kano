가상환경 실행
poetry shell

poetry run python

의존성 추가
poetry add fastapi uvicorn transformers torch


## 파이토치
poetry run pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
poetry add torch torchvision torchaudio --allow-prereleases


# uvicorn 실행
poetry run uvicorn main:app --host 0.0.0.0 --port 8000 --reload