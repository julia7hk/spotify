import os
from dotenv import load_dotenv

load_dotenv()

from flask import Flask, request, redirect, session, url_for, jsonify
from flask_cors import CORS

from spotipy import Spotify
from spotipy.oauth2 import SpotifyOAuth
from spotipy.cache_handler import FlaskSessionCacheHandler


app = Flask(__name__)
app.config['SECRET_KEY'] = 'spotify-dashboard-dev-key'
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
CORS(app, supports_credentials=True, origins=["http://127.0.0.1:3000"])

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
    return redirect('http://127.0.0.1:3000')


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
    for idx, t in enumerate(top_tracks['items']):
        tracks.append({
            'id': t['id'],
            'name': t['name'],
            'artist': t['artists'][0]['name'],
            'popularity': t['popularity'],
            'duration_ms': t['duration_ms'],
            'explicit': t['explicit'],
            'release_year': t['album']['release_date'][:4],
            'image': t['album']['images'][0]['url'] if t['album']['images'] else None,
            'url': t['external_urls']['spotify'],
            'top_rank': idx + 1
        })

    avg_popularity = sum(t['popularity'] for t in tracks) / len(tracks)
    avg_duration = sum(t['duration_ms'] for t in tracks) / len(tracks)

    # Sort tracks by popularity for most/least popular
    sorted_by_popularity = sorted(tracks, key=lambda x: x['popularity'], reverse=True)

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
        'release_years': [t['release_year'] for t in tracks],
        'tracks_by_popularity': [{
            'id': t['id'],
            'name': t['name'],
            'artist': t['artist'],
            'popularity': t['popularity'],
            'image': t['image'],
            'url': t['url'],
            'top_rank': t['top_rank']
        } for t in sorted_by_popularity]
    })


@app.route('/api/audio-features')
def api_audio_features():
    """Get audio features (danceability, energy, mood, etc.) for user's top tracks"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_tracks = sp.current_user_top_tracks(limit=50, time_range='medium_term')
    track_ids = [t['id'] for t in top_tracks['items']]

    audio_features = sp.audio_features(track_ids)

    # Calculate averages
    features_sum = {
        'danceability': 0, 'energy': 0, 'valence': 0,
        'acousticness': 0, 'instrumentalness': 0, 'speechiness': 0,
        'tempo': 0, 'loudness': 0
    }

    valid_count = 0
    for af in audio_features:
        if af:
            valid_count += 1
            for key in features_sum:
                features_sum[key] += af[key]

    averages = {k: round(v / valid_count, 3) for k, v in features_sum.items()}

    return jsonify({
        'authenticated': True,
        'track_count': valid_count,
        'averages': averages,
        'tracks': [{
            'name': top_tracks['items'][i]['name'],
            'artist': top_tracks['items'][i]['artists'][0]['name'],
            'features': {
                'danceability': af['danceability'],
                'energy': af['energy'],
                'valence': af['valence'],
                'tempo': af['tempo'],
                'acousticness': af['acousticness']
            } if af else None
        } for i, af in enumerate(audio_features)]
    })


@app.route('/api/mood-analysis')
def api_mood_analysis():
    """Analyze the emotional characteristics of user's music taste based on genres"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_artists = sp.current_user_top_artists(limit=50, time_range='medium_term')

    moods = {'happy': 0, 'sad': 0, 'energetic': 0, 'chill': 0, 'angry': 0}
    genre_examples = {'happy': [], 'sad': [], 'energetic': [], 'chill': [], 'angry': []}

    for artist in top_artists['items']:
        for genre in artist['genres']:
            mood = classify_genre_mood(genre)
            if mood:
                moods[mood] += 1
                if genre not in genre_examples[mood] and len(genre_examples[mood]) < 3:
                    genre_examples[mood].append(genre)

    total = sum(moods.values()) or 1
    mood_percentages = {k: round(v / total * 100, 1) for k, v in moods.items()}
    dominant_mood = max(moods, key=moods.get)

    return jsonify({
        'authenticated': True,
        'dominant_mood': dominant_mood,
        'mood_breakdown': mood_percentages,
        'mood_counts': moods,
        'genre_examples': genre_examples
    })


@app.route('/api/recommendations')
def api_recommendations():
    """Get personalized track recommendations based on user's top tracks and artists"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_tracks = sp.current_user_top_tracks(limit=5, time_range='short_term')
    top_artists = sp.current_user_top_artists(limit=5, time_range='short_term')

    seed_tracks = [t['id'] for t in top_tracks['items'][:2]]
    seed_artists = [a['id'] for a in top_artists['items'][:3]]

    recommendations = sp.recommendations(
        seed_tracks=seed_tracks,
        seed_artists=seed_artists,
        limit=20
    )

    return jsonify({
        'authenticated': True,
        'recommendations': [{
            'id': track['id'],
            'name': track['name'],
            'artist': track['artists'][0]['name'],
            'album': track['album']['name'],
            'preview_url': track['preview_url'],
            'url': track['external_urls']['spotify'],
            'image': track['album']['images'][0]['url'] if track['album']['images'] else None
        } for track in recommendations['tracks']]
    })


@app.route('/api/discover-artists')
def api_discover_artists():
    """Discover new artists based on user's top artists using related artists"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    # Get user's top 5 artists as seeds
    top_artists = sp.current_user_top_artists(limit=5, time_range='medium_term')
    known_artist_ids = {a['id'] for a in top_artists['items']}

    discovered_artists = []
    seen_ids = set(known_artist_ids)

    for seed_artist in top_artists['items']:
        if len(discovered_artists) >= 10:
            break

        related = sp.artist_related_artists(seed_artist['id'])

        for artist in related['artists']:
            if artist['id'] in seen_ids:
                continue
            if len(discovered_artists) >= 10:
                break

            seen_ids.add(artist['id'])

            # Get top 3 tracks for this artist
            top_tracks = sp.artist_top_tracks(artist['id'])
            tracks = [{
                'id': t['id'],
                'name': t['name'],
                'preview_url': t['preview_url'],
                'url': t['external_urls']['spotify'],
                'image': t['album']['images'][0]['url'] if t['album']['images'] else None
            } for t in top_tracks['tracks'][:3]]

            discovered_artists.append({
                'id': artist['id'],
                'name': artist['name'],
                'genres': artist['genres'][:3],
                'popularity': artist['popularity'],
                'url': artist['external_urls']['spotify'],
                'image': artist['images'][0]['url'] if artist['images'] else None,
                'similar_to': seed_artist['name'],
                'top_tracks': tracks
            })

    return jsonify({
        'authenticated': True,
        'discovered_artists': discovered_artists
    })


@app.route('/api/genre-profile')
def api_genre_profile():
    """Get user's genre distribution profile"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    top_artists = sp.current_user_top_artists(limit=50, time_range='medium_term')

    # Count genres
    genre_count = {}
    for artist in top_artists['items']:
        for genre in artist['genres']:
            genre_count[genre] = genre_count.get(genre, 0) + 1

    # Sort by count
    sorted_genres = sorted(genre_count.items(), key=lambda x: x[1], reverse=True)
    top_15_genres = sorted_genres[:15]

    # Calculate diversity score (unique genres / total genre mentions)
    total_mentions = sum(genre_count.values())
    unique_genres = len(genre_count)
    diversity_score = round((unique_genres / total_mentions * 100), 1) if total_mentions > 0 else 0

    return jsonify({
        'authenticated': True,
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

    return jsonify({
        'authenticated': True,
        'total': saved['total'],
        'tracks': [{
            'id': item['track']['id'],
            'name': item['track']['name'],
            'artist': item['track']['artists'][0]['name'],
            'album': item['track']['album']['name'],
            'added_at': item['added_at'],
            'url': item['track']['external_urls']['spotify'],
            'image': item['track']['album']['images'][0]['url'] if item['track']['album']['images'] else None
        } for item in saved['items']]
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
        'artists': [{
            'id': artist['id'],
            'name': artist['name'],
            'genres': artist['genres'][:3],
            'popularity': artist['popularity'],
            'followers': artist['followers']['total'],
            'url': artist['external_urls']['spotify'],
            'image': artist['images'][0]['url'] if artist['images'] else None
        } for artist in followed['artists']['items']]
    })


@app.route('/api/playlist/<playlist_id>/analysis')
def api_playlist_analysis(playlist_id):
    """Analyze a specific playlist's audio characteristics"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    playlist = sp.playlist(playlist_id)
    tracks = playlist['tracks']['items'][:100]

    track_ids = [t['track']['id'] for t in tracks if t['track']]
    audio_features = sp.audio_features(track_ids)

    features_sum = {
        'danceability': 0, 'energy': 0, 'valence': 0,
        'acousticness': 0, 'tempo': 0
    }
    valid_count = 0

    for af in audio_features:
        if af:
            valid_count += 1
            for key in features_sum:
                features_sum[key] += af[key]

    averages = {k: round(v / valid_count, 3) for k, v in features_sum.items()} if valid_count else {}

    # Calculate duration stats
    durations = [t['track']['duration_ms'] for t in tracks if t['track']]
    total_duration = sum(durations)

    return jsonify({
        'authenticated': True,
        'playlist': {
            'name': playlist['name'],
            'description': playlist['description'],
            'total_tracks': playlist['tracks']['total'],
            'owner': playlist['owner']['display_name'],
            'image': playlist['images'][0]['url'] if playlist['images'] else None
        },
        'audio_profile': averages,
        'duration': {
            'total_ms': total_duration,
            'total_minutes': round(total_duration / 60000, 1),
            'avg_track_minutes': round((total_duration / len(durations)) / 60000, 2) if durations else 0
        }
    })


@app.route('/api/artist/<artist_id>')
def api_artist_details(artist_id):
    """Get detailed info about an artist including top tracks and related artists"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    artist = sp.artist(artist_id)
    top_tracks = sp.artist_top_tracks(artist_id)
    related = sp.artist_related_artists(artist_id)

    return jsonify({
        'authenticated': True,
        'artist': {
            'id': artist['id'],
            'name': artist['name'],
            'genres': artist['genres'],
            'popularity': artist['popularity'],
            'followers': artist['followers']['total'],
            'image': artist['images'][0]['url'] if artist['images'] else None
        },
        'top_tracks': [{
            'id': t['id'],
            'name': t['name'],
            'album': t['album']['name'],
            'popularity': t['popularity'],
            'preview_url': t['preview_url'],
            'image': t['album']['images'][0]['url'] if t['album']['images'] else None
        } for t in top_tracks['tracks'][:10]],
        'related_artists': [{
            'id': a['id'],
            'name': a['name'],
            'genres': a['genres'][:2],
            'image': a['images'][0]['url'] if a['images'] else None
        } for a in related['artists'][:10]]
    })


@app.route('/api/new-releases')
def api_new_releases():
    """Get new album releases"""
    if not sp_oauth.validate_token(cache_handler.get_cached_token()):
        return jsonify({'authenticated': False}), 401

    new_releases = sp.new_releases(limit=20)

    return jsonify({
        'authenticated': True,
        'albums': [{
            'id': album['id'],
            'name': album['name'],
            'artist': album['artists'][0]['name'],
            'release_date': album['release_date'],
            'total_tracks': album['total_tracks'],
            'url': album['external_urls']['spotify'],
            'image': album['images'][0]['url'] if album['images'] else None
        } for album in new_releases['albums']['items']]
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
            'top_artists': [a['name'] for a in artists['items']],
            'top_tracks': [{'name': t['name'], 'artist': t['artists'][0]['name']} for t in tracks['items']]
        }

    return jsonify({
        'authenticated': True,
        'stats': stats
    })


@app.route('/logout')
def logout():
    session.clear()
    return redirect('http://127.0.0.1:3000')



if __name__ == '__main__':
    app.run(debug=True, port=5001)
