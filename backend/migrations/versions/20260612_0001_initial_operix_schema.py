"""create operix initial procurement schema

Revision ID: 20260612_0001
Revises:
Create Date: 2026-06-12 00:00:00.000000
"""

from typing import Optional, Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "20260612_0001"
down_revision = None
branch_labels = None
depends_on = None


# NOTE:
# Use PostgreSQL-specific ENUM with create_type=False in columns to prevent
# implicit CREATE TYPE during table creation. We create/drop enum types
# explicitly with checkfirst=True in upgrade/downgrade for idempotency.
user_role_enum = postgresql.ENUM(
    "employee",
    "manager",
    "supplier",
    name="user_role",
    create_type=False,
)
purchase_request_status_enum = postgresql.ENUM(
    "pending",
    "approved",
    "rejected",
    "order_created",
    name="purchase_request_status",
    create_type=False,
)
purchase_order_status_enum = postgresql.ENUM(
    "created",
    "confirmed",
    "in_fulfillment",
    "delivered",
    "received",
    name="purchase_order_status",
    create_type=False,
)


def upgrade() -> None:
    bind = op.get_bind()

    postgresql.ENUM(
        "employee",
        "manager",
        "supplier",
        name="user_role",
    ).create(bind, checkfirst=True)
    postgresql.ENUM(
        "pending",
        "approved",
        "rejected",
        "order_created",
        name="purchase_request_status",
    ).create(bind, checkfirst=True)
    postgresql.ENUM(
        "created",
        "confirmed",
        "in_fulfillment",
        "delivered",
        "received",
        name="purchase_order_status",
    ).create(bind, checkfirst=True)

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("full_name", sa.String(length=255), nullable=False),
        sa.Column("role", user_role_enum, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)

    op.create_table(
        "purchase_requests",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("amount", sa.Numeric(12, 2), nullable=False),
        sa.Column("currency", sa.String(length=3), nullable=False),
        sa.Column("status", purchase_request_status_enum, nullable=False),
        sa.Column("requester_id", sa.String(length=36), nullable=False),
        sa.Column("reviewer_id", sa.String(length=36), nullable=True),
        sa.Column("rejection_reason", sa.Text(), nullable=True),
        sa.Column("approved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["requester_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["reviewer_id"], ["users.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_purchase_requests_requester_id", "purchase_requests", ["requester_id"], unique=False)
    op.create_index("ix_purchase_requests_reviewer_id", "purchase_requests", ["reviewer_id"], unique=False)
    op.create_index("ix_purchase_requests_status", "purchase_requests", ["status"], unique=False)

    op.create_table(
        "purchase_orders",
        sa.Column("id", sa.String(length=36), primary_key=True, nullable=False),
        sa.Column("purchase_request_id", sa.String(length=36), nullable=False),
        sa.Column("supplier_id", sa.String(length=36), nullable=False),
        sa.Column("manager_id", sa.String(length=36), nullable=False),
        sa.Column("status", purchase_order_status_enum, nullable=False),
        sa.Column("supplier_note", sa.Text(), nullable=True),
        sa.Column("delivery_note", sa.Text(), nullable=True),
        sa.Column("confirmed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("delivered_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("received_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["manager_id"], ["users.id"], ondelete="RESTRICT"),
        sa.ForeignKeyConstraint(["purchase_request_id"], ["purchase_requests.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["supplier_id"], ["users.id"], ondelete="RESTRICT"),
        sa.UniqueConstraint("purchase_request_id"),
    )
    op.create_index("ix_purchase_orders_manager_id", "purchase_orders", ["manager_id"], unique=False)
    op.create_index(
        "ix_purchase_orders_purchase_request_id",
        "purchase_orders",
        ["purchase_request_id"],
        unique=True,
    )
    op.create_index("ix_purchase_orders_status", "purchase_orders", ["status"], unique=False)
    op.create_index("ix_purchase_orders_supplier_id", "purchase_orders", ["supplier_id"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_purchase_orders_supplier_id", table_name="purchase_orders")
    op.drop_index("ix_purchase_orders_status", table_name="purchase_orders")
    op.drop_index("ix_purchase_orders_purchase_request_id", table_name="purchase_orders")
    op.drop_index("ix_purchase_orders_manager_id", table_name="purchase_orders")
    op.drop_table("purchase_orders")

    op.drop_index("ix_purchase_requests_status", table_name="purchase_requests")
    op.drop_index("ix_purchase_requests_reviewer_id", table_name="purchase_requests")
    op.drop_index("ix_purchase_requests_requester_id", table_name="purchase_requests")
    op.drop_table("purchase_requests")

    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")

    bind = op.get_bind()
    postgresql.ENUM(
        "created",
        "confirmed",
        "in_fulfillment",
        "delivered",
        "received",
        name="purchase_order_status",
    ).drop(bind, checkfirst=True)
    postgresql.ENUM(
        "pending",
        "approved",
        "rejected",
        "order_created",
        name="purchase_request_status",
    ).drop(bind, checkfirst=True)
    postgresql.ENUM(
        "employee",
        "manager",
        "supplier",
        name="user_role",
    ).drop(bind, checkfirst=True)
