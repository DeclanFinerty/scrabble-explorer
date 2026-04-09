from fastapi import APIRouter, Request
from scrabble_engine import find_words_detailed
from scrabble_engine.tiles import LETTER_VALUES

from explorer_api.models import RackRequest, RackResponse, RackWordResult

router = APIRouter()


def _score_with_blanks(word: str, blank_positions: tuple[int, ...]) -> int:
    return sum(
        0 if i in blank_positions else LETTER_VALUES.get(ch, 0)
        for i, ch in enumerate(word)
    )


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
    detailed = find_words_detailed(letters, dawg)

    # Deduplicate: keep the highest-scoring version of each word
    # (i.e. the one that uses blanks on the lowest-value letters)
    best: dict[str, RackWordResult] = {}
    for wr in detailed:
        score = _score_with_blanks(wr.word, wr.blank_positions)
        if wr.word not in best or score > best[wr.word].score:
            best[wr.word] = RackWordResult(
                word=wr.word,
                score=score,
                length=len(wr.word),
                bingo=len(wr.word) == 7,
                blank_positions=list(wr.blank_positions),
            )

    results = list(best.values())
    results = _sort_rack_results(results, body.sort)
    total_count = len(results)
    limited = results[: body.limit]

    return RackResponse(words=limited, total_count=total_count)
