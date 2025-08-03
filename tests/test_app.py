import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(__file__)))

from app import app

def test_index():
    client = app.test_client()
    response = client.get('/')
    assert response.status_code == 200


def test_profile():
    client = app.test_client()
    response = client.get('/profile')
    assert response.status_code == 200
    data = response.get_json()
    assert 'name' in data
    assert 'bio' in data
    assert 'image' in data
