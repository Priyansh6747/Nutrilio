import uvicorn
from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Welcome to your FastAPI app!"}



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)