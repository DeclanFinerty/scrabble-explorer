from fastapi import APIRouter, Request
from scrabble_engine import find_words, word_score

from explorer_api.models import RackRequest, RackResponse, RackWordResult

router = APIRouter()


def _sort_rack_results(words: list[RackWordResult], sort: str) -> list[RackWordResult]:
    match sort:
        case "score":
            return sorted(words, key=lambda w: w.score, reverse=True)
        case "length":
            return sorted(words, key=lambda w: w.length, reverse=True)
        case "alphabetical":
            return sorted(words, key=lambda w: w.word)
    return words


@router.post("/rack", response_model=RackResponse)
def solve_rack(body: RackRequest, request: Request):
    dawg = request.app.state.dawg
    letters = [l.upper() for l in body.letters]
    all_words = find_words(letters, dawg)

    results = [
        RackWordResult(
            word=w,
            score=word_score(w),
            length=len(w),
            bingo=len(w) == 7,
        )
        for w in all_words
    ]

    results = _sort_rack_results(results, body.sort)
    total_count = len(results)
    limited = results[: body.limit]

    return RackResponse(words=limited, total_count=total_count)
