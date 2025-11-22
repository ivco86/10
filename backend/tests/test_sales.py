def test_create_sale(client, auth_headers):
    # Create product first
    product = client.post("/api/v1/products", json={
        "name": "Test Product",
        "price": 10.00,
        "vat_rate": 20.00,
        "stock_quantity": 50
    }, headers=auth_headers).json()

    # Create sale
    response = client.post("/api/v1/sales", json={
        "items": [{"product_id": product["id"], "quantity": 2}],
        "payment_method": "cash",
        "cash_received": 30.00
    }, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["sale_number"].startswith("INV-")
    assert float(data["total"]) == 24.00  # 20 + 4 VAT


def test_list_sales(client, auth_headers):
    response = client.get("/api/v1/sales", headers=auth_headers)
    assert response.status_code == 200
    assert "items" in response.json()


def test_sale_reduces_stock(client, auth_headers):
    # Create product
    product = client.post("/api/v1/products", json={
        "name": "Stock Test",
        "price": 5.00,
        "stock_quantity": 10
    }, headers=auth_headers).json()

    # Make sale
    client.post("/api/v1/sales", json={
        "items": [{"product_id": product["id"], "quantity": 3}],
        "payment_method": "card"
    }, headers=auth_headers)

    # Check stock reduced
    updated = client.get(f"/api/v1/products/{product['id']}", headers=auth_headers).json()
    assert updated["stock_quantity"] == 7
