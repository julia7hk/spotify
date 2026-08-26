"""Regression guard for the Spotify response normalizers in main.py.

Spotify removes fields from its response objects without notice. In Aug 2026
artists lost genres/popularity/followers, tracks lost popularity, and simplified
playlists lost tracks.total — which broke six routes at once with KeyError,
silently, because the frontend's Promise.allSettled swallowed the 500s.

These tests pin the contract that made that a one-function fix: a normalizer
must never raise on a missing field, and must return the documented key set no
matter how sparse the input. No network, no credentials — the fixtures below are
real response shapes captured from the live API on 2026-08-24.
"""

import pytest

import main


# --- fixtures: real shapes, captured 2026-08-24 --------------------------------

# Exactly the keys the live API returns today. Note the absences.
ARTIST_TODAY = {
    "external_urls": {"spotify": "https://open.spotify.com/artist/abc"},
    "href": "https://api.spotify.com/v1/artists/abc",
    "id": "abc",
    "images": [{"url": "https://i.scdn.co/image/artist.jpg", "height": 640}],
    "name": "Radiohead",
    "type": "artist",
    "uri": "spotify:artist:abc",
}

# The pre-deprecation shape. Kept so the normalizers still work if Spotify
# ever restores these fields (or for a differently-provisioned app).
ARTIST_LEGACY = {
    **ARTIST_TODAY,
    "genres": ["art rock", "alternative rock"],
    "popularity": 82,
    "followers": {"total": 9_000_000, "href": None},
}

TRACK_TODAY = {
    "album": {
        "id": "alb",
        "name": "Hot Fuss",
        "images": [{"url": "https://i.scdn.co/image/album.jpg"}],
        "release_date": "2004-06-07",
        "release_date_precision": "day",
    },
    "artists": [{"id": "art", "name": "The Killers"}],
    "disc_number": 1,
    "duration_ms": 222_200,
    "explicit": False,
    "external_urls": {"spotify": "https://open.spotify.com/track/xyz"},
    "id": "xyz",
    "name": "Mr. Brightside",
    "track_number": 2,
    "type": "track",
    "uri": "spotify:track:xyz",
}

# `GET /albums/{id}` — key set captured live 2026-08-26. Still serves images,
# release_date, total_tracks and an embedded (paged) tracks list.
ALBUM_TODAY = {
    "album_type": "album",
    "artists": [{"id": "art", "name": "Daft Punk"}],
    "external_urls": {"spotify": "https://open.spotify.com/album/alb"},
    "id": "alb",
    "images": [{"url": "https://i.scdn.co/image/album.jpg", "height": 640}],
    "name": "Discovery",
    "release_date": "2001-03-12",
    "release_date_precision": "day",
    "total_tracks": 2,
    "type": "album",
    "uri": "spotify:album:alb",
    "tracks": {
        "items": [
            {
                "artists": [{"id": "art", "name": "Daft Punk"}],
                "disc_number": 1,
                "duration_ms": 320_357,
                "explicit": False,
                "external_urls": {"spotify": "https://open.spotify.com/track/t1"},
                "id": "t1",
                "name": "One More Time",
                "track_number": 1,
                "type": "track",
            },
            {
                "artists": [{"id": "art", "name": "Daft Punk"}],
                "disc_number": 1,
                "duration_ms": 212_546,
                "explicit": False,
                "external_urls": {"spotify": "https://open.spotify.com/track/t2"},
                "id": "t2",
                "name": "Aerodynamic",
                "track_number": 2,
                "type": "track",
            },
        ],
        "total": 2,
    },
}

PLAYLIST_TODAY = {
    "id": "pl1",
    "name": "focus",
    "external_urls": {"spotify": "https://open.spotify.com/playlist/pl1"},
    "images": [{"url": "https://i.scdn.co/image/pl.jpg"}],
}


# --- to_artist -----------------------------------------------------------------


def test_to_artist_current_shape_does_not_raise():
    a = main.to_artist(ARTIST_TODAY)
    assert a["id"] == "abc"
    assert a["name"] == "Radiohead"
    assert a["image"] == "https://i.scdn.co/image/artist.jpg"
    assert a["url"] == "https://open.spotify.com/artist/abc"
    # Removed upstream — must degrade to empty/None, never KeyError.
    assert a["genres"] == []
    assert a["popularity"] is None
    assert a["followers"] is None


def test_to_artist_still_reads_legacy_fields_if_present():
    a = main.to_artist(ARTIST_LEGACY)
    assert a["genres"] == ["art rock", "alternative rock"]
    assert a["popularity"] == 82
    assert a["followers"] == 9_000_000


def test_to_artist_always_returns_full_key_set():
    expected = {"id", "name", "genres", "popularity", "followers", "url", "image"}
    assert set(main.to_artist({}).keys()) == expected
    assert set(main.to_artist(ARTIST_TODAY).keys()) == expected


# --- to_track ------------------------------------------------------------------


def test_to_track_current_shape():
    t = main.to_track(TRACK_TODAY)
    assert t["name"] == "Mr. Brightside"
    assert t["artist"] == "The Killers"
    assert t["album"] == "Hot Fuss"
    assert t["duration_ms"] == 222_200
    assert t["explicit"] is False
    assert t["release_date"] == "2004-06-07"
    assert t["image"] == "https://i.scdn.co/image/album.jpg"
    assert t["popularity"] is None  # removed upstream


def test_to_track_falls_back_when_artists_missing():
    assert main.to_track({"name": "x", "artists": []})["artist"] == "Unknown"
    assert main.to_track({"name": "x"})["artist"] == "Unknown"


def test_to_track_tolerates_null_album():
    t = main.to_track({"name": "x", "album": None, "artists": []})
    assert t["album"] is None
    assert t["image"] is None
    assert t["release_date"] is None


# --- to_playlist ---------------------------------------------------------------


def test_to_playlist_without_track_total():
    p = main.to_playlist(PLAYLIST_TODAY)
    assert p["name"] == "focus"
    assert p["tracks"] is None  # tracks.total removed upstream


def test_to_playlist_reads_track_total_if_present():
    p = main.to_playlist({**PLAYLIST_TODAY, "tracks": {"total": 42}})
    assert p["tracks"] == 42


# --- hostile input -------------------------------------------------------------
#
# The whole point of the normalizer layer: whatever Spotify drops next, these
# must not raise. If one of these starts failing, a route is about to 500.


@pytest.mark.parametrize(
    "fn",
    [main.to_artist, main.to_track, main.to_playlist, main.to_album, main.to_album_track],
    ids=lambda f: f.__name__,
)
@pytest.mark.parametrize(
    "raw",
    [{}, {"images": None}, {"external_urls": None}, {"images": [], "external_urls": {}}],
    ids=["empty", "null-images", "null-urls", "empty-collections"],
)
def test_normalizers_never_raise_on_sparse_input(fn, raw):
    assert isinstance(fn(raw), dict)


def test_collect_genres_reports_availability():
    counts, available = main.collect_genres([ARTIST_LEGACY, ARTIST_LEGACY])
    assert counts["art rock"] == 2
    assert available is True

    # The situation today: artists present, but no genres on any of them.
    counts, available = main.collect_genres([ARTIST_TODAY, ARTIST_TODAY])
    assert counts == {}
    assert available is False

    assert main.collect_genres([]) == ({}, False)


# --- to_album / to_album_track -------------------------------------------------


def test_to_album_current_shape():
    a = main.to_album(ALBUM_TODAY)
    assert a["id"] == "alb"
    assert a["name"] == "Discovery"
    assert a["artist"] == "Daft Punk"
    assert a["image"] == "https://i.scdn.co/image/album.jpg"
    assert a["release_date"] == "2001-03-12"
    assert a["total_tracks"] == 2
    assert [t["name"] for t in a["tracks"]] == ["One More Time", "Aerodynamic"]


def test_to_album_tolerates_missing_tracks():
    """The panel must still render a cover if Spotify stops embedding tracks."""
    raw = {k: v for k, v in ALBUM_TODAY.items() if k != "tracks"}
    a = main.to_album(raw)
    assert a["tracks"] == []
    assert a["name"] == "Discovery"

    assert main.to_album({**ALBUM_TODAY, "tracks": None})["tracks"] == []


def test_to_album_track_has_no_album_subobject():
    """Simplified album tracks carry no cover — it comes from the parent album."""
    t = main.to_album_track(ALBUM_TODAY["tracks"]["items"][0])
    assert "image" not in t
    assert t["track_number"] == 1
    assert t["disc_number"] == 1
    assert t["artist"] == "Daft Punk"


def test_to_album_track_falls_back_when_artists_missing():
    t = main.to_album_track({"id": "t9", "name": "Untitled"})
    assert t["artist"] == "Unknown"
    assert t["artists"] == []
    assert t["disc_number"] == 1


def test_to_track_exposes_album_id():
    """The album panel keys off this — without it there is nothing to fetch."""
    assert main.to_track(TRACK_TODAY)["album_id"] == "alb"
    assert main.to_track({"name": "orphan"})["album_id"] is None


# --- ?range= validation --------------------------------------------------------


@pytest.mark.parametrize(
    "query,expected",
    [
        ("?range=short_term", "short_term"),
        ("?range=medium_term", "medium_term"),
        ("?range=long_term", "long_term"),
        ("?range=bogus", "medium_term"),        # unknown value must not reach Spotify
        ("?range=", "medium_term"),
        ("", "medium_term"),
        ("?range=short_term&range=long_term", "short_term"),
    ],
)
def test_requested_range_validates(query, expected):
    with main.app.test_request_context(f"/{query}"):
        assert main.requested_range() == expected


# --- route contract ------------------------------------------------------------


def test_unauthenticated_api_routes_return_401_not_500():
    """Every /api route must fail closed with 401, never leak a stack trace."""
    client = main.app.test_client()
    routes = [
        r.rule
        for r in main.app.url_map.iter_rules()
        if r.rule.startswith("/api/") and "<" not in r.rule
    ]
    assert routes, "no /api routes discovered — did the url_map change?"

    for rule in routes:
        if rule == "/api/auth-url":  # intentionally public
            continue
        resp = client.get(rule)
        assert resp.status_code == 401, f"{rule} returned {resp.status_code}"
        assert resp.get_json() == {"authenticated": False}
