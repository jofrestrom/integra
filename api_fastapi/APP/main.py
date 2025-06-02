from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from APP.routers import user

app = FastAPI(
    title="API para usuarios",
    version="1.0.0",
    description="API de crud para usuarios en fast api"
)

origins = ["http://127.0.0.1:5502"]

app.add_middleware(
    CORSMiddleware,
    allow_origins = origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]

)

app.include_router(user.router)