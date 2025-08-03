# Simple App Connect

## Overview
Simple App Connect is a minimal Flask application that demonstrates a swipe-based interface for browsing user profiles. It exposes a small REST API and tracks profiles you like or dislike as you swipe.

### Features
- Swipe through user profiles in the browser.
- `/profile` endpoint serves sequential profile data.
- `/swipe` endpoint records likes or dislikes.
- `/liked` endpoint lists all liked profiles.

## Setup
1. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
2. Activate the environment:
   ```bash
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

## Running the Server
Start the application using one of the following commands:
```bash
flask run        # Requires FLASK_APP=app.py
# or
python app.py
```

## Testing
Run the test suite with:
```bash
pytest -q
```

## API Documentation
### `GET /profile`
Returns the next user profile to display.
```json
{
  "name": "Alicja",
  "age": 25,
  "bio": "Uwielbia g\u00f3rskie w\u0119dr\u00f3wki",
  "image": "https://via.placeholder.com/300x400?text=Alicja"
}
```

### `POST /swipe`
Records whether a profile was liked or disliked.
Request body:
```json
{
  "name": "Alicja",
  "liked": true
}
```
Returns a confirmation message.

### `GET /liked`
Retrieves a list of all liked profiles.
```json
[
  {"name": "Alicja", "age": 25, "bio": "Uwielbia g\u00f3rskie w\u0119dr\u00f3wki", "image": "https://via.placeholder.com/300x400?text=Alicja"}
]
```
