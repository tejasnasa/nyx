from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.database import engine, Base
from server.routers import auth_router, user_router, thread_router
from server import models

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nyx Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(user_router.router)
app.include_router(thread_router.router)

@app.get("/")
def read_root():
    return {"message": "Nyx API is running"}
