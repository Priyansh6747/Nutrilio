import uvicorn
from fastapi import FastAPI
from routes.User import user_router
from routes.LogMeal import LogRouter
from routes.LogWater import WaterRouter
from routes.Chatbot import BotRouter
from dotenv import load_dotenv
import os

# Load environment variables from .env
load_dotenv()

app = FastAPI()

app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
app.include_router(LogRouter, prefix="/api/v1/log", tags=["Log"])
app.include_router(WaterRouter, prefix="/api/v1/water", tags=["Log"])
app.include_router(BotRouter, prefix="/api/v1", tags=["ChatBot"])

@app.get("/")
def read_root():
    return {"message": "Welcome to your FastAPI app!"}

@app.head("/")
def read_root_head():
    return 1

if __name__ == "__main__":
    # Get host and port from environment variables
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))

    uvicorn.run(app, host=host, port=port)
