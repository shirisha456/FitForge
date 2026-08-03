"""Expand the seeded exercise library with more common exercises.

Revision ID: 007_expand_exercise_seed
Revises: 006_profile
Create Date: 2026-08-02
"""

from collections.abc import Sequence

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

revision: str = "007_expand_exercise_seed"
down_revision: str | None = "006_profile"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None

exercise_category = postgresql.ENUM(
    "strength", "cardio", "mobility", "other", name="exercise_category", create_type=False
)

NEW_EXERCISES = [
    ("Incline Bench Press", "strength", "chest", "barbell"),
    ("Dumbbell Bench Press", "strength", "chest", "dumbbell"),
    ("Dumbbell Shoulder Press", "strength", "shoulders", "dumbbell"),
    ("Lateral Raise", "strength", "shoulders", "dumbbell"),
    ("Bicep Curl", "strength", "arms", "dumbbell"),
    ("Tricep Pushdown", "strength", "arms", "cable"),
    ("Lat Pulldown", "strength", "back", "cable"),
    ("Seated Cable Row", "strength", "back", "cable"),
    ("Leg Press", "strength", "legs", "machine"),
    ("Leg Curl", "strength", "legs", "machine"),
    ("Leg Extension", "strength", "legs", "machine"),
    ("Lunge", "strength", "legs", "dumbbell"),
    ("Hip Thrust", "strength", "legs", "barbell"),
    ("Romanian Deadlift", "strength", "back", "barbell"),
    ("Dip", "strength", "chest", "bodyweight"),
    ("Chin-up", "strength", "back", "bodyweight"),
    ("Sit-up", "strength", "core", "bodyweight"),
    ("Crunch", "strength", "core", "bodyweight"),
    ("Russian Twist", "strength", "core", "bodyweight"),
    ("Farmer's Carry", "strength", "full_body", "dumbbell"),
    ("Kettlebell Swing", "strength", "full_body", "kettlebell"),
    ("Rowing Machine", "cardio", "full_body", "machine"),
    ("Elliptical", "cardio", "full_body", "machine"),
    ("Jump Rope", "cardio", "full_body", "bodyweight"),
    ("Stair Climber", "cardio", "legs", "machine"),
    ("Swimming", "cardio", "full_body", None),
    ("Yoga", "mobility", "full_body", None),
    ("Stretching", "mobility", "full_body", None),
    ("Foam Rolling", "mobility", "full_body", "foam_roller"),
]


def upgrade() -> None:
    exercises_table = sa.table(
        "exercises",
        sa.column("name", sa.String),
        sa.column("category", exercise_category),
        sa.column("muscle_group", sa.String),
        sa.column("equipment", sa.String),
    )
    op.bulk_insert(
        exercises_table,
        [
            {
                "name": name,
                "category": category,
                "muscle_group": muscle_group,
                "equipment": equipment,
            }
            for name, category, muscle_group, equipment in NEW_EXERCISES
        ],
    )


def downgrade() -> None:
    names = [name for name, *_ in NEW_EXERCISES]
    op.execute(
        sa.text("DELETE FROM exercises WHERE name IN :names").bindparams(
            sa.bindparam("names", expanding=True)
        ),
        {"names": names},
    )
