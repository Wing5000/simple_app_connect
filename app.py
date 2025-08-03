from flask import Flask, jsonify, render_template

app = Flask(__name__)

# Sample profile data
profiles = [
    {
        "name": "Alicja",
        "age": 25,
        "bio": "Uwielbia górskie wędrówki",
        "image": "https://via.placeholder.com/300x400?text=Alicja"
    },
    {
        "name": "Bartek",
        "age": 30,
        "bio": "Miłośnik kawy i podróży",
        "image": "https://via.placeholder.com/300x400?text=Bartek"
    },
    {
        "name": "Celina",
        "age": 28,
        "bio": "Programistka i fanatyczka kotów",
        "image": "https://via.placeholder.com/300x400?text=Celina"
    }
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

if __name__ == '__main__':
    app.run(debug=True)
