"""Add sales and stock movements

Revision ID: 003
Revises: 002
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Sales
    op.create_table(
        'sales',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
        sa.Column('sale_number', sa.String(50), nullable=False),
        sa.Column('subtotal', sa.Numeric(10, 2), nullable=False),
        sa.Column('discount_amount', sa.Numeric(10, 2), server_default='0'),
        sa.Column('vat_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
        sa.Column('payment_method', sa.String(50)),
        sa.Column('cash_received', sa.Numeric(10, 2)),
        sa.Column('change_given', sa.Numeric(10, 2)),
        sa.Column('notes', sa.Text()),
        sa.Column('status', sa.String(50), server_default='completed'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('tenant_id', 'sale_number', name='uq_sale_tenant_number'),
    )
    op.create_index('idx_sales_tenant', 'sales', ['tenant_id'])
    op.create_index('idx_sales_created', 'sales', ['created_at'])

    # Sale Items
    op.create_table(
        'sale_items',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('sale_id', sa.Integer(), sa.ForeignKey('sales.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id')),
        sa.Column('product_name', sa.String(255), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('unit_price', sa.Numeric(10, 2), nullable=False),
        sa.Column('discount_amount', sa.Numeric(10, 2), server_default='0'),
        sa.Column('vat_rate', sa.Numeric(5, 2), nullable=False),
        sa.Column('vat_amount', sa.Numeric(10, 2), nullable=False),
        sa.Column('total', sa.Numeric(10, 2), nullable=False),
    )
    op.create_index('idx_sale_items_sale', 'sale_items', ['sale_id'])

    # Stock Movements
    op.create_table(
        'stock_movements',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('product_id', sa.Integer(), sa.ForeignKey('products.id', ondelete='CASCADE'), nullable=False),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('type', sa.String(50), nullable=False),
        sa.Column('reference_id', sa.Integer()),
        sa.Column('notes', sa.Text()),
        sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id')),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )
    op.create_index('idx_stock_movements_product', 'stock_movements', ['product_id'])


def downgrade():
    op.drop_table('stock_movements')
    op.drop_table('sale_items')
    op.drop_table('sales')
