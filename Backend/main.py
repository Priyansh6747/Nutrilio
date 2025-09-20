import uvicorn
from fastapi import FastAPI
from routes.User import user_router

app = FastAPI()


app.include_router(user_router, prefix="/api/v1/user", tags=["User"])
@app.get("/")
def read_root():
    return {"message": "Welcome to your FastAPI app!"}
@app.head("/")
def read_root():
    return 1



if __name__ == "__main__":
    uvicorn.run(app, host="10.26.44.145", port=8000)