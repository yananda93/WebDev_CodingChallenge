from flask import Flask, jsonify, abort
from flask_cors import CORS
import json

app = Flask(__name__)
app.json.sort_keys = False
CORS(app)

# Load data from the JSON file
with open('data/soccer_small.json', 'r', encoding="utf8") as file:
    players_data = json.load(file)

# API for getting all players and their attributes
@app.route('/players/', methods=['GET'])
def get_all_players():
    return jsonify(players_data)

# API for getting a specific player and their attributes
@app.route('/players/<string:name>', methods=['GET'])
def get_player(name):
    for player in players_data:
        if player['Name'] == name:
            return jsonify(player) # Found player
   
    abort(404)  # Player not found

# API for getting all clubs with a list of players playing for those clubs
@app.route('/clubs/', methods=['GET'])
def get_clubs():
    clubs = {}
    for player in players_data:
        club = player['Club']
        if club not in clubs:
            clubs[club] = []
        clubs[club].append(player['Name'])

    return jsonify(clubs)

# API for getting a list of all attribute names
@app.route('/attributes/', methods=['GET'])
def get_attributes():
    return jsonify(list(players_data[0].keys()))

if __name__ == '__main__':
    app.run()
