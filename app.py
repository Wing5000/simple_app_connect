from flask import Flask, jsonify, render_template, request, session

app = Flask(__name__)
app.secret_key = "dev-secret"

# Sample profile data
profiles = [
    {
        "id": 0,
        "name": "Alicja",
        "age": 25,
        "bio": "Uwielbia górskie wędrówki",
        "image": "https://via.placeholder.com/300x400?text=Alicja",
    },
    {
        "id": 1,
        "name": "Bartek",
        "age": 30,
        "bio": "Miłośnik kawy i podróży",
        "image": "https://via.placeholder.com/300x400?text=Bartek",
    },
    {
        "id": 2,
        "name": "Celina",
        "age": 28,
        "bio": "Programistka i fanatyczka kotów",
        "image": "https://via.placeholder.com/300x400?text=Celina",
    },
]

current = 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/profile')
def get_profile():
    global current
    profile = profiles[current % len(profiles)]
    current += 1
    return jsonify(profile)


@app.post('/swipe')
def swipe():
    data = request.get_json() or {}
    pid = data.get("id")
    action = data.get("action")
    liked = session.setdefault("liked", [])
    disliked = session.setdefault("disliked", [])
    if action == "like" and pid not in liked:
        liked.append(pid)
    elif action == "dislike" and pid not in disliked:
        disliked.append(pid)
    session.modified = True
    return jsonify({"liked_count": len(liked)})


@app.route('/liked')
def liked_profiles():
    liked_ids = session.get("liked", [])
    liked = [p for p in profiles if p["id"] in liked_ids]
    return jsonify(liked)

if __name__ == '__main__':
    app.run(debug=True)
