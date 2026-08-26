import os
from dotenv import load_dotenv

load_dotenv(override=True)  # .env is the source of truth — beat any stale exported SPOTIFY_* shell vars

from flask import Flask, request, redirect, session, url_for, jsonify
from flask_cors import CORS

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler


# Where the frontend lives: 127.0.0.1:3000 in local dev, the public URL in prod.
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://127.0.0.1:3000')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'spotify-dashboard-dev-key')
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
# Behind HTTPS (prod) mark the session cookie Secure; stays False for local http dev.
app.config['SESSION_COOKIE_SECURE'] = os.getenv('SESSION_COOKIE_SECURE', 'false').lower() == 'true'
CORS(app, supports_credentials=True, origins=[FRONTEND_URL])

# Behind nginx/Cloudflare (TLS terminated upstream), trust the forwarded scheme/host.
# Enable ONLY behind the trusted proxy (never expose Flask directly with this on).
if os.getenv('TRUST_PROXY', 'false').lower() == 'true':
    from werkzeug.middleware.proxy_fix import ProxyFix
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)

# in .env file:
    # client_id
    # client_secret
    # redirect_uri

scope = 'playlist-read-private user-top-read user-read-recently-played user-library-read user-follow-read'


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


# ---------------------------------------------------------------------------
# Response normalizers.
#
# Spotify strips fields from its objects without notice (Aug 2026: artists lost
# `genres`/`popularity`/`followers`, tracks lost `popularity`, simplified
# playlists lost `tracks.total`). Reading raw wire JSON inline in every route is
# what let one upstream change break six routes at once, so all field access now
# goes through here. When the next field disappears, fix it in this block only.
#
# Stepping stone toward the `spotify_client.py` extraction in CLAUDE.md.
# ---------------------------------------------------------------------------

TIME_RANGES = {'short_term', 'medium_term', 'long_term'}
DEFAULT_RANGE = 'medium_term'


def requested_range(default=DEFAULT_RANGE):
    """Read ?range= from the query string, falling back to a safe default."""
    tr = request.args.get('range', default)
    return tr if tr in TIME_RANGES else default


def _first_image(obj):
    images = (obj or {}).get('images') or []
    return images[0]['url'] if images else None


def to_artist(raw):
    """Normalize an artist object. `genres`/`popularity`/`followers` are gone."""
    return {
        'id': raw.get('id'),
        'name': raw.get('name'),
        'genres': raw.get('genres', []),          # empty until Last.fm enrichment
        'popularity': raw.get('popularity'),      # None — no longer served
        'followers': (raw.get('followers') or {}).get('total'),
        'url': (raw.get('external_urls') or {}).get('spotify'),
        'image': _first_image(raw),
    }


def to_track(raw):
    """Normalize a full/simplified track object. `popularity` is gone."""
    album = raw.get('album') or {}
    artists = raw.get('artists') or []
    return {
        'id': raw.get('id'),
        'name': raw.get('name'),
        'artist': artists[0]['name'] if artists else 'Unknown',
        'album': album.get('name'),
        'popularity': raw.get('popularity'),      # None — no longer served
        'duration_ms': raw.get('duration_ms'),
        'explicit': raw.get('explicit', False),
        'release_date': album.get('release_date'),
        'url': (raw.get('external_urls') or {}).get('spotify'),
        'image': _first_image(album),
    }


def to_playlist(raw):
    """Normalize a simplified playlist object. `tracks.total` is gone."""
    return {
        'id': raw.get('id'),
        'name': raw.get('name'),
        'url': (raw.get('external_urls') or {}).get('spotify'),
        'image': _first_image(raw),
        'tracks': (raw.get('tracks') or {}).get('total'),   # None — no longer served
    }


def collect_genres(raw_artists):
    """Count genres across artists. Returns ({}, False) while Spotify serves none."""
    counts = {}
    for raw in raw_artists:
        for genre in raw.get('genres') or []:
            counts[genre] = counts.get(genre, 0) + 1
    return counts, bool(counts)


# Genre-to-mood mapping for mood analysis
GENRE_MOOD_MAPPING = {
    'happy': ['party', 'dance pop', 'disco', 'funk', 'happy', 'tropical', 'summer', 'bubblegum'],
    'sad': ['emo', 'melancholy', 'sad', 'indie', 'singer-songwriter', 'ballad', 'slowcore'],
    'energetic': ['edm', 'techno', 'punk', 'metal', 'rock', 'drum and bass', 'hardstyle', 'hardcore'],
    'chill': ['ambient', 'lo-fi', 'lofi', 'acoustic', 'mellow', 'chill', 'downtempo', 'jazz', 'bossa'],
    'angry': ['death metal', 'thrash', 'industrial', 'grindcore', 'black metal', 'metalcore', 'rage']
}


def classify_genre_mood(genre: str) -> str | None:
    """Classify a genre into a mood category based on keyword matching"""
    genre_lower = genre.lower()
    for mood, keywords in GENRE_MOOD_MAPPING.items():
        for keyword in keywords:
            if keyword in genre_lower:
                return mood
    return None


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
    return redirect(FRONTEND_URL)


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
            'name': user.get('display_name'),
            'image': _first_image(user)
        },
        'playlists': [to_playlist(pl) for pl in playlists['items']]
    })


@app.route('/api/auth-url')
def api_auth_url():
    return jsonify({'url': sp_oauth.get_authorize_url()})


@app.route('/api/top-artists')
def api_top_artists():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_range = requested_range()
    top_artists = sp.current_user_top_artists(limit=20, time_range=time_range)
    artists = [to_artist(a) for a in top_artists['items']]

    return jsonify({
        'authenticated': True,
        'range': time_range,
        'genres_available': any(a['genres'] for a in artists),
        'top_artists': artists
    })


@app.route('/api/top-tracks')
def api_top_tracks():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_range = requested_range()
    top_tracks = sp.current_user_top_tracks(limit=20, time_range=time_range)

    return jsonify({
        'authenticated': True,
        'range': time_range,
        'top_tracks': [to_track(t) for t in top_tracks['items']]
    })


@app.route('/api/recently-played')
def api_recently_played():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    recently_played = sp.current_user_recently_played(limit=20)

    return jsonify({
        'authenticated': True,
        'recently_played': [
            {**to_track(item['track']), 'played_at': item['played_at']}
            for item in recently_played['items']
        ]
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
        'followers': (user.get('followers') or {}).get('total', 0)
    })


@app.route('/api/listening-profile')
def api_listening_profile():
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_range = requested_range()
    top_tracks = sp.current_user_top_tracks(limit=20, time_range=time_range)
    top_artists = sp.current_user_top_artists(limit=20, time_range=time_range)

    # ---- Genre aggregation (empty until Last.fm enrichment lands) ----
    genre_count, genres_available = collect_genres(top_artists['items'])

    # ---- Track metadata ----
    tracks = []
    for raw in top_tracks['items']:
        t = to_track(raw)
        t['release_year'] = (t['release_date'] or '')[:4] or None
        tracks.append(t)

    durations = [t['duration_ms'] for t in tracks if t['duration_ms'] is not None]
    avg_duration_min = round(sum(durations) / len(durations) / 60000, 2) if durations else None
    explicit_ratio = round(sum(1 for t in tracks if t['explicit']) / len(tracks), 2) if tracks else None

    return jsonify({
        'authenticated': True,
        'range': time_range,
        'genres_available': genres_available,
        'top_genres': sorted(genre_count.items(), key=lambda x: x[1], reverse=True)[:10],
        'avg_duration_min': avg_duration_min,
        'explicit_ratio': explicit_ratio,
        'release_years': [t['release_year'] for t in tracks if t['release_year']]
    })


@app.route('/api/mood-analysis')
def api_mood_analysis():
    """Analyze the emotional characteristics of user's music taste based on genres"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_range = requested_range()
    top_artists = sp.current_user_top_artists(limit=50, time_range=time_range)

    moods = {'happy': 0, 'sad': 0, 'energetic': 0, 'chill': 0, 'angry': 0}
    genre_examples = {'happy': [], 'sad': [], 'energetic': [], 'chill': [], 'angry': []}

    for artist in top_artists['items']:
        for genre in artist.get('genres') or []:
            mood = classify_genre_mood(genre)
            if mood:
                moods[mood] += 1
                if genre not in genre_examples[mood] and len(genre_examples[mood]) < 3:
                    genre_examples[mood].append(genre)

    # Spotify no longer serves artist genres, so this classifies nothing. Say so
    # rather than reporting a fabricated dominant mood built from all-zero counts.
    genres_available = sum(moods.values()) > 0
    total = sum(moods.values()) or 1
    mood_percentages = {k: round(v / total * 100, 1) for k, v in moods.items()}
    dominant_mood = max(moods, key=moods.get) if genres_available else None

    return jsonify({
        'authenticated': True,
        'range': time_range,
        'genres_available': genres_available,
        'dominant_mood': dominant_mood,
        'mood_breakdown': mood_percentages,
        'mood_counts': moods,
        'genre_examples': genre_examples
    })


@app.route('/api/genre-profile')
def api_genre_profile():
    """Get user's genre distribution profile"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_range = requested_range()
    top_artists = sp.current_user_top_artists(limit=50, time_range=time_range)

    genre_count, genres_available = collect_genres(top_artists['items'])

    # Sort by count
    sorted_genres = sorted(genre_count.items(), key=lambda x: x[1], reverse=True)
    top_15_genres = sorted_genres[:15]

    # Calculate diversity score (unique genres / total genre mentions)
    total_mentions = sum(genre_count.values())
    unique_genres = len(genre_count)
    diversity_score = round((unique_genres / total_mentions * 100), 1) if total_mentions > 0 else 0

    return jsonify({
        'authenticated': True,
        'range': time_range,
        'genres_available': genres_available,
        'genres': [{'name': g[0], 'count': g[1]} for g in top_15_genres],
        'unique_genres': unique_genres,
        'diversity_score': diversity_score,
        'top_genre': top_15_genres[0][0] if top_15_genres else None
    })


@app.route('/api/saved-tracks')
def api_saved_tracks():
    """Get user's liked/saved songs"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    saved = sp.current_user_saved_tracks(limit=50)

    tracks = [
        {**to_track(item['track']), 'added_at': item['added_at']}
        for item in saved['items']
    ]

    # `added_at` is the only real time-series data left in the API — bucket the
    # page we fetched by month so the frontend can plot library growth.
    by_month = {}
    for t in tracks:
        month = (t['added_at'] or '')[:7]   # YYYY-MM
        if month:
            by_month[month] = by_month.get(month, 0) + 1

    return jsonify({
        'authenticated': True,
        'total': saved['total'],
        'tracks': tracks,
        'added_by_month': [
            {'month': m, 'count': c} for m, c in sorted(by_month.items())
        ]
    })


@app.route('/api/followed-artists')
def api_followed_artists():
    """Get artists the user follows"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    followed = sp.current_user_followed_artists(limit=50)

    return jsonify({
        'authenticated': True,
        'total': followed['artists']['total'],
        'artists': [to_artist(a) for a in followed['artists']['items']]
    })


@app.route('/api/listening-stats')
def api_listening_stats():
    """Get comprehensive listening statistics across different time ranges"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    time_ranges = ['short_term', 'medium_term', 'long_term']
    range_labels = {'short_term': 'Last 4 weeks', 'medium_term': 'Last 6 months', 'long_term': 'All time'}

    stats = {}
    for tr in time_ranges:
        artists = sp.current_user_top_artists(limit=5, time_range=tr)
        tracks = sp.current_user_top_tracks(limit=5, time_range=tr)

        stats[range_labels[tr]] = {
            'range': tr,
            'top_artists': [to_artist(a) for a in artists['items']],
            'top_tracks': [to_track(t) for t in tracks['items']]
        }

    return jsonify({
        'authenticated': True,
        'stats': stats
    })


@app.route('/logout')
def logout():
    session.clear()
    return redirect(FRONTEND_URL)



if __name__ == '__main__':
    app.run(debug=os.getenv('FLASK_DEBUG', 'true').lower() == 'true', port=5001)
