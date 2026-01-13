import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, redirect, session, url_for, jsonify
from flask_cors import CORS

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler


app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)    # temp random key
CORS(app, supports_credentials=True)

# in .env file:
    # client_id
    # client_secret
    # redirect_uri

scope = 'playlist-read-private user-top-read user-read-recently-played'


cache_handler = FlaskSessionCacheHandler(session)
sp_oauth = SpotifyOAuth(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET'),
    redirect_uri=os.getenv('SPOTIFY_REDIRECT_URI'),
    scope=scope,
    cache_handler=cache_handler,
    show_dialog=True,   # show the login dialog
)

sp = Spotify(auth_manager=sp_oauth)



# root
@app.route('/')
def home():
    # check if user is logged in already  
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)
    # not logged in,redirect to login
    return redirect(url_for('get_playlist'))


# callback endpoint
@app.route('/callback')
def callback():
    sp_oauth.get_access_token(request.args.get('code'))
    return redirect(url_for('get_playlist'))


@app.route('/get_playlist')
def get_playlist():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        auth_url = sp_oauth.get_authorize_url()
        return redirect(auth_url)

    # sp --> spotify client :D
    playlists = sp.current_user_playlists()

    playlists_info = [(pl['name'], pl['external_urls']['spotify']) for pl in playlists['items']]
    playlists_html = '<br>'.join([f'{name}: {url}' for name, url in playlists_info])

    return playlists_html


@app.route('/api/playlists')
def api_playlists():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    playlists = sp.current_user_playlists()
    user = sp.current_user()

    return jsonify({
        'authenticated': True,
        'user': {
            'name': user['display_name'],
            'image': user['images'][0]['url'] if user['images'] else None
        },
        'playlists': [{
            'id': pl['id'],
            'name': pl['name'],
            'url': pl['external_urls']['spotify'],
            'image': pl['images'][0]['url'] if pl['images'] else None,
            'tracks': pl['tracks']['total']
        } for pl in playlists['items']]
    })


@app.route('/api/auth-url')
def api_auth_url():
    return jsonify({'url': sp_oauth.get_authorize_url()})


@app.route('/api/top-artists')
def api_top_artists():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_artists = sp.current_user_top_artists(limit=20, time_range='medium_term')

    return jsonify({
        'authenticated': True,
        'top_artists': [{
            'id': artist['id'],
            'name': artist['name'],
            'genres': artist['genres'],
            'popularity': artist['popularity'],
            'url': artist['external_urls']['spotify'],
            'image': artist['images'][0]['url'] if artist['images'] else None
        } for artist in top_artists['items']]
    })


@app.route('/api/top-tracks')
def api_top_tracks():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_tracks = sp.current_user_top_tracks(limit=20, time_range='medium_term')

    return jsonify({
        'authenticated': True,
        'top_tracks': [{
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'url': track['external_urls']['spotify'],
            'image': track['album']['images'][0]['url'] if track['album']['images'] else None
        } for track in top_tracks['items']]
    })


@app.route('/api/recently-played')
def api_recently_played():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    recently_played = sp.current_user_recently_played(limit=20)

    return jsonify({
        'authenticated': True,
        'recently_played': [{
            'id': item['track']['id'],
            'name': item['track']['name'],
            'artist': item['track']['artists'][0]['name'],
            'album': item['track']['album']['name'],
            'played_at': item['played_at'],
            'url': item['track']['external_urls']['spotify'],
            'image': item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else None
        } for item in recently_played['items']]
    })

# for dashboard ui purposes later i suppose
@app.route('/api/me')
def api_me():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    user = sp.current_user()
    return jsonify({
        'id': user['id'],
        'name': user['display_name'],
        'image': user['images'][0]['url'] if user['images'] else None,
        'followers': user['followers']['total']
    })


@app.route('/api/listening-profile')
def api_listening_profile():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_tracks = sp.current_user_top_tracks(limit=20)
    top_artists = sp.current_user_top_artists(limit=20)

    # ---- Genre aggregation ----
    genre_count = {}
    for artist in top_artists['items']:
        for genre in artist['genres']:
            genre_count[genre] = genre_count.get(genre, 0) + 1

    # ---- Track metadata ----
    tracks = []
    for t in top_tracks['items']:
        tracks.append({
            'name': t['name'],
            'popularity': t['popularity'],
            'duration_ms': t['duration_ms'],
            'explicit': t['explicit'],
            'release_year': t['album']['release_date'][:4]
        })

    avg_popularity = sum(t['popularity'] for t in tracks) / len(tracks)
    avg_duration = sum(t['duration_ms'] for t in tracks) / len(tracks)

    return jsonify({
        'top_genres': sorted(
            genre_count.items(),
            key=lambda x: x[1],
            reverse=True
        )[:10],
        'avg_popularity': round(avg_popularity, 1),
        'avg_duration_min': round(avg_duration / 60000, 2),
        'explicit_ratio': round(
            sum(1 for t in tracks if t['explicit']) / len(tracks),
            2
        ),
        'release_years': [t['release_year'] for t in tracks]
    })


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))



if __name__ == '__main__':
    app.run(debug=True, port=5001)
