import os

# main.py builds a SpotifyOAuth at import time, which needs non-empty
# credentials. CI has no .env and no secrets, so seed dummies before import.
# Nothing here talks to Spotify — every test runs against fixtures.
os.environ.setdefault("SPOTIFY_CLIENT_ID", "test_client_id")
os.environ.setdefault("SPOTIFY_CLIENT_SECRET", "test_client_secret")
os.environ.setdefault("SPOTIFY_REDIRECT_URI", "http://127.0.0.1:3000/callback")
