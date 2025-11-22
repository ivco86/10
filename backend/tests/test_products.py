def test_create_product(client, auth_headers):
    response = client.post("/api/v1/products", json={
        "name": "Test Product",
        "price": 9.99,
        "stock_quantity": 100
    }, headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Test Product"
    assert float(data["price"]) == 9.99


def test_list_products(client, auth_headers):
    # Create product
    client.post("/api/v1/products", json={
        "name": "Product 1",
        "price": 10.00
    }, headers=auth_headers)

    response = client.get("/api/v1/products", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["total"] >= 1


def test_search_products(client, auth_headers):
    client.post("/api/v1/products", json={
        "name": "Apple iPhone",
        "price": 999.00,
        "barcode": "123456789"
    }, headers=auth_headers)

    response = client.get("/api/v1/products/search?q=iPhone", headers=auth_headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_update_product(client, auth_headers):
    # Create
    create = client.post("/api/v1/products", json={
        "name": "Old Name",
        "price": 10.00
    }, headers=auth_headers)
    product_id = create.json()["id"]

    # Update
    response = client.put(f"/api/v1/products/{product_id}", json={
        "name": "New Name"
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["name"] == "New Name"
