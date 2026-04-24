"""Add public survey response tables

Revision ID: 001_add_public_survey_tables
Revises:
Create Date: 2026-03-06

"""
from alembic import op
import sqlalchemy as sa

revision = "001_add_public_survey_tables"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public_survey_responses (
            id SERIAL PRIMARY KEY,
            full_name VARCHAR(200) NOT NULL,
            phone VARCHAR(30) NOT NULL,
            carrera VARCHAR(150) NOT NULL,
            cedula VARCHAR(30) NOT NULL,
            template_id INTEGER NOT NULL REFERENCES survey_templates(id),
            completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )

    op.execute(
        """
        CREATE TABLE IF NOT EXISTS public_survey_answers (
            id SERIAL PRIMARY KEY,
            response_id INTEGER NOT NULL REFERENCES public_survey_responses(id),
            question_id INTEGER NOT NULL REFERENCES survey_questions(id),
            score INTEGER NOT NULL
        )
        """
    )


def downgrade() -> None:
    op.drop_table("public_survey_answers")
    op.drop_table("public_survey_responses")
