from fastapi import APIRouter

from app.api.v1 import health
from app.modules.auth.routes import router as auth_router
from app.modules.nutrition.routes import meals_router, nutrition_router, water_router
from app.modules.workouts.routes import exercises_router, workouts_router

api_v1_router = APIRouter()
api_v1_router.include_router(health.router, tags=["health"])
api_v1_router.include_router(auth_router)
api_v1_router.include_router(exercises_router)
api_v1_router.include_router(workouts_router)
api_v1_router.include_router(meals_router)
api_v1_router.include_router(water_router)
api_v1_router.include_router(nutrition_router)
