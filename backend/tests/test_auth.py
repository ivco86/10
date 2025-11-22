def test_register(client):
    response = client.post("/api/v1/auth/register", json={
        "business_name": "My Shop",
        "email": "owner@shop.com",
        "password": "secret123",
        "full_name": "Shop Owner"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "owner@shop.com"
    assert data["user"]["role"] == "owner"


def test_login(client):
    # Register first
    client.post("/api/v1/auth/register", json={
        "business_name": "My Shop",
        "email": "owner@shop.com",
        "password": "secret123"
    })
    # Login
    response = client.post("/api/v1/auth/login", json={
        "email": "owner@shop.com",
        "password": "secret123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_invalid(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "wrong@email.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401


def test_me(client, auth_headers):
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
