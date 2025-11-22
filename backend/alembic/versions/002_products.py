"""Add categories and products

Revision ID: 002
Revises: 001
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Categories
    op.create_table(
        'categories',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('tenant_id', 'name', name='uq_category_tenant_name'),
    )

    # Products
    op.create_table(
        'products',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        sa.Column('category_id', sa.Integer(), sa.ForeignKey('categories.id', ondelete='SET NULL')),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('description', sa.Text()),
        sa.Column('sku', sa.String(100)),
        sa.Column('barcode', sa.String(100)),
        sa.Column('price', sa.Numeric(10, 2), nullable=False),
        sa.Column('cost_price', sa.Numeric(10, 2)),
        sa.Column('vat_rate', sa.Numeric(5, 2), server_default='20.00'),
        sa.Column('stock_quantity', sa.Integer(), server_default='0'),
        sa.Column('min_stock_level', sa.Integer(), server_default='0'),
        sa.Column('image_url', sa.String(500)),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint('tenant_id', 'sku', name='uq_product_tenant_sku'),
        sa.UniqueConstraint('tenant_id', 'barcode', name='uq_product_tenant_barcode'),
    )
    op.create_index('idx_products_tenant', 'products', ['tenant_id'])
    op.create_index('idx_products_barcode', 'products', ['barcode'])
    op.create_index('idx_products_sku', 'products', ['sku'])


def downgrade():
    op.drop_table('products')
    op.drop_table('categories')
