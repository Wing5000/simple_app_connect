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
    assert 'id' in data
    assert 'name' in data
    assert 'bio' in data
    assert 'image' in data


def test_swipe_and_liked():
    client = app.test_client()
    profile = client.get('/profile').get_json()
    res = client.post('/swipe', json={'id': profile['id'], 'action': 'like'})
    assert res.status_code == 200
    assert res.get_json()['liked_count'] == 1

    liked = client.get('/liked').get_json()
    assert any(p['id'] == profile['id'] for p in liked)
