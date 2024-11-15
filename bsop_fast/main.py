from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Add CORS middleware with the frontend container's IP
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://172.28.0.3:3000",  # Frontend container
        "http://localhost:3000",    # Local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/hello")
async def hello():
    return {"message": "hello from the fastapi"}