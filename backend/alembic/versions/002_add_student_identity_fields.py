"""Add phone and citizen_id to students

Revision ID: 002_add_student_identity_fields
Revises: 001_add_public_survey_tables
Create Date: 2026-03-07
"""

from alembic import op


revision = "002_add_student_identity_fields"
down_revision = "001_add_public_survey_tables"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS citizen_id VARCHAR(30)")
    op.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS phone VARCHAR(30)")
    op.execute("UPDATE students SET citizen_id = COALESCE(citizen_id, student_code), phone = COALESCE(phone, '3000000000')")
    op.execute("ALTER TABLE students ALTER COLUMN citizen_id SET NOT NULL")
    op.execute("ALTER TABLE students ALTER COLUMN phone SET NOT NULL")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS ix_students_citizen_id ON students (citizen_id)")


def downgrade() -> None:
    op.execute("DROP INDEX IF EXISTS ix_students_citizen_id")
    op.execute("ALTER TABLE students DROP COLUMN IF EXISTS phone")
    op.execute("ALTER TABLE students DROP COLUMN IF EXISTS citizen_id")