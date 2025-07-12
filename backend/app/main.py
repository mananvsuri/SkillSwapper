from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api.v1 import admin, auth, users, skills, swaps, swapcoins

app = FastAPI(title="Skill Swap Platform API")

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files for uploaded photos
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Register Routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(skills.router, prefix="/api/v1")
app.include_router(swaps.router, prefix="/api/v1")
app.include_router(swapcoins.router, prefix="/api/v1")
app.include_router(admin.admin_router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "Skill Swap Backend is Running ✅"}
