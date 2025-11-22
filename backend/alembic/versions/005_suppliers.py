"""Add suppliers table

Revision ID: 005
Revises: 004
Create Date: 2024-01-01
"""
from alembic import op
import sqlalchemy as sa

revision = '005'
down_revision = '004'
branch_labels = None
depends_on = None


def upgrade():
    # Suppliers
    op.create_table(
        'suppliers',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('tenant_id', sa.Integer(), sa.ForeignKey('tenants.id', ondelete='CASCADE'), nullable=False),
        
        # Basic Information
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('contact_person', sa.String(255)),
        sa.Column('email', sa.String(255)),
        sa.Column('phone', sa.String(50)),
        
        # Address
        sa.Column('address', sa.String(500)),
        sa.Column('city', sa.String(100)),
        sa.Column('postal_code', sa.String(20)),
        sa.Column('country', sa.String(100)),
        
        # Business Information
        sa.Column('tax_number', sa.String(50)),
        sa.Column('registration_number', sa.String(50)),
        
        # Banking
        sa.Column('bank_account', sa.String(100)),
        sa.Column('bank_name', sa.String(255)),
        
        # Business Terms
        sa.Column('payment_terms', sa.Text()),
        sa.Column('min_order_amount', sa.Numeric(10, 2)),
        sa.Column('delivery_days', sa.Integer()),
        
        # Additional
        sa.Column('notes', sa.Text()),
        sa.Column('is_active', sa.Boolean(), server_default='true'),
        
        # Timestamps
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(), server_default=sa.func.now()),
    )
    
    op.create_index('idx_suppliers_tenant', 'suppliers', ['tenant_id'])
    op.create_index('idx_suppliers_name', 'suppliers', ['name'])
    op.create_index('idx_suppliers_email', 'suppliers', ['email'])


def downgrade():
    op.drop_index('idx_suppliers_email', table_name='suppliers')
    op.drop_index('idx_suppliers_name', table_name='suppliers')
    op.drop_index('idx_suppliers_tenant', table_name='suppliers')
    op.drop_table('suppliers')

