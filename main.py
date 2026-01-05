import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, redirect, session, url_for

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler


app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)    # temp random key

# in .env file
# client_id
# client_secret
# redirect_uri

scope = 'playlist-read-private'

# multiple scopes
# scope = 'playlist-read-private,streaming' 


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


@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('home'))



if __name__ == '__main__':
    app.run(debug=True)
