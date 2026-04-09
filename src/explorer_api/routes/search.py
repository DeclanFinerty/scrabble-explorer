from fastapi import APIRouter, Request
from scrabble_engine import WordQuery, word_score

from explorer_api.models import (
    ContainingFilter,
    EndingWithFilter,
    LengthFilter,
    LetterAtFilter,
    MatchingPatternFilter,
    MinScoreFilter,
    NotContainingFilter,
    SearchRequest,
    SearchResponse,
    StartingWithFilter,
    WordResult,
)

router = APIRouter()


def _apply_filter(query: WordQuery, f) -> WordQuery:
    match f:
        case ContainingFilter():
            return query.containing(f.value)
        case NotContainingFilter():
            return query.not_containing(f.value)
        case StartingWithFilter():
            return query.starting_with(f.value)
        case EndingWithFilter():
            return query.ending_with(f.value)
        case LengthFilter():
            return query.length(min=f.min, max=f.max)
        case LetterAtFilter():
            return query.letter_at(f.position, f.letter)
        case MatchingPatternFilter():
            return query.matching_pattern(f.value)
        case MinScoreFilter():
            return query.min_score(f.value)


def _apply_sort(query: WordQuery, sort: str) -> WordQuery:
    match sort:
        case "score":
            return query.sort_by_score()
        case "length":
            return query.sort_by_length()
        case "alphabetical":
            return query.sort_alphabetically()
    return query


@router.post("/search", response_model=SearchResponse)
def search_words(body: SearchRequest, request: Request):
    dawg = request.app.state.dawg
    query = WordQuery(dawg)

    for f in body.filters:
        query = _apply_filter(query, f)

    query = _apply_sort(query, body.sort)
    all_words = query.execute()
    total_count = len(all_words)
    limited = all_words[: body.limit]

    words = [
        WordResult(word=w, score=word_score(w), length=len(w)) for w in limited
    ]
    return SearchResponse(
        words=words,
        total_count=total_count,
        filters_applied=len(body.filters),
    )
