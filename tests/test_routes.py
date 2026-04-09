import pytest
from fastapi.testclient import TestClient

from explorer_api.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


class TestSearch:
    def test_has_letters(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "has_letters", "value": "Z"}],
            "sort": "score",
            "limit": 10,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["filters_applied"] == 1
        assert data["total_count"] > 0
        for w in data["words"]:
            assert "Z" in w["word"]

    def test_has_letters_multiple(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "has_letters", "value": "QZ"}],
            "sort": "score",
            "limit": 10,
        })
        assert resp.status_code == 200
        for w in resp.json()["words"]:
            assert "Q" in w["word"]
            assert "Z" in w["word"]

    def test_has_substring(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "has_substring", "value": "ING"}],
            "sort": "score",
            "limit": 10,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_count"] > 0
        for w in data["words"]:
            assert "ING" in w["word"]

    def test_from_letters_only(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "from_letters_only", "value": "SATIRE"}],
            "sort": "score",
            "limit": 100,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_count"] > 0
        available = list("SATIRE")
        for w in data["words"]:
            remaining = available.copy()
            for ch in w["word"]:
                assert ch in remaining, f"{w['word']} uses letter {ch} not available"
                remaining.remove(ch)

    def test_multiple_filters(self, client):
        resp = client.post("/api/search", json={
            "filters": [
                {"type": "has_letters", "value": "Z"},
                {"type": "not_containing", "value": "U"},
                {"type": "length", "min": 3, "max": 5},
            ],
            "sort": "score",
            "limit": 100,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["filters_applied"] == 3
        for w in data["words"]:
            assert "Z" in w["word"]
            assert "U" not in w["word"]
            assert 3 <= w["length"] <= 5

    def test_starting_with(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "starting_with", "value": "QU"}],
            "limit": 10,
        })
        assert resp.status_code == 200
        for w in resp.json()["words"]:
            assert w["word"].startswith("QU")

    def test_ending_with(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "ending_with", "value": "ING"}],
            "limit": 10,
        })
        assert resp.status_code == 200
        for w in resp.json()["words"]:
            assert w["word"].endswith("ING")

    def test_matching_pattern(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "matching_pattern", "value": "C.T"}],
            "limit": 100,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_count"] > 0
        for w in data["words"]:
            assert len(w["word"]) == 3
            assert w["word"][0] == "C"
            assert w["word"][2] == "T"

    def test_letter_at(self, client):
        resp = client.post("/api/search", json={
            "filters": [
                {"type": "letter_at", "position": 0, "letter": "X"},
                {"type": "length", "min": 3, "max": 3},
            ],
            "limit": 100,
        })
        assert resp.status_code == 200
        for w in resp.json()["words"]:
            assert w["word"][0] == "X"

    def test_min_score(self, client):
        resp = client.post("/api/search", json={
            "filters": [
                {"type": "min_score", "value": 20},
                {"type": "length", "min": 3, "max": 5},
            ],
            "sort": "score",
            "limit": 10,
        })
        assert resp.status_code == 200
        for w in resp.json()["words"]:
            assert w["score"] >= 20

    def test_sort_alphabetical(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "starting_with", "value": "AB"}],
            "sort": "alphabetical",
            "limit": 10,
        })
        assert resp.status_code == 200
        words = [w["word"] for w in resp.json()["words"]]
        assert words == sorted(words)

    def test_limit_respected(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "has_letters", "value": "E"}],
            "limit": 5,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert len(data["words"]) == 5
        assert data["total_count"] > 5

    def test_invalid_filter_type(self, client):
        resp = client.post("/api/search", json={
            "filters": [{"type": "nonexistent", "value": "X"}],
        })
        assert resp.status_code == 422


class TestWordInfo:
    def test_valid_word(self, client):
        resp = client.get("/api/word/BOARD")
        assert resp.status_code == 200
        data = resp.json()
        assert data["word"] == "BOARD"
        assert data["valid"] is True
        assert data["score"] == 8
        assert data["length"] == 5
        assert data["family"] is not None
        assert data["family"]["root"] == "BOARD"
        assert len(data["family"]["extensions"]) > 0

    def test_invalid_word(self, client):
        resp = client.get("/api/word/XYZZY")
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is False
        assert data["family"] is None

    def test_case_insensitive(self, client):
        resp = client.get("/api/word/board")
        assert resp.status_code == 200
        data = resp.json()
        assert data["valid"] is True
        assert data["word"] == "BOARD"


class TestRack:
    def test_basic_rack(self, client):
        resp = client.post("/api/rack", json={
            "letters": ["C", "A", "T", "S"],
            "sort": "score",
            "limit": 50,
        })
        assert resp.status_code == 200
        data = resp.json()
        assert data["total_count"] > 0
        words = {w["word"] for w in data["words"]}
        assert "CAT" in words
        assert "CATS" in words

    def test_bingo_detection(self, client):
        resp = client.post("/api/rack", json={
            "letters": ["S", "A", "T", "I", "R", "E", "N"],
            "sort": "score",
            "limit": 300,
        })
        assert resp.status_code == 200
        data = resp.json()
        for w in data["words"]:
            if w["length"] == 7:
                assert w["bingo"] is True
            else:
                assert w["bingo"] is False

    def test_sort_score_descending(self, client):
        resp = client.post("/api/rack", json={
            "letters": ["S", "A", "T", "I", "R", "E", "N"],
            "sort": "score",
            "limit": 50,
        })
        assert resp.status_code == 200
        scores = [w["score"] for w in resp.json()["words"]]
        assert scores == sorted(scores, reverse=True)


class TestFamily:
    def test_valid_family(self, client):
        resp = client.get("/api/family/BOARD")
        assert resp.status_code == 200
        data = resp.json()
        assert data["root"] == "BOARD"
        assert len(data["extensions"]) > 0
        assert len(data["prefixes"]) > 0
        ext_words = {e["word"] for e in data["extensions"]}
        assert "BOARDS" in ext_words
        prefix_words = {p["word"] for p in data["prefixes"]}
        assert "ABOARD" in prefix_words

    def test_invalid_word(self, client):
        resp = client.get("/api/family/XYZZY")
        assert resp.status_code == 404
