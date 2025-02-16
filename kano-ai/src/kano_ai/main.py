from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline

# FastAPI 앱 생성
app = FastAPI()

# Hugging Face 모델 로드
generator = pipeline("text-generation", model="gpt2")

# 요청 모델 정의
class GenerateRequest(BaseModel):
    prompt: str
    max_length: int = 50

# API 엔드포인트 정의
@app.post("/generate")
async def generate_text(request: GenerateRequest):
    output = generator(request.prompt, max_length=request.max_length)
    return {"generated_text": output[0]["generated_text"]}

# 서버 실행을 위한 코드 (FastAPI 실행 시 필요)
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
