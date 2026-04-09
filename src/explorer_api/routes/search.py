from fastapi import APIRouter, Request
from scrabble_engine import WordQuery, word_score

from explorer_api.models import (
    EndingWithFilter,
    FromLettersOnlyFilter,
    HasLettersFilter,
    HasSubstringFilter,
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


def _apply_filter(query: WordQuery, f) -> tuple[WordQuery, None] | tuple[WordQuery, str]:
    """Apply a filter to the query. Returns (query, substring) where substring
    is non-None only for has_substring filters that need post-filtering."""
    match f:
        case HasLettersFilter():
            return query.containing(f.value), None
        case HasSubstringFilter():
            return query, f.value
        case NotContainingFilter():
            return query.not_containing(f.value), None
        case FromLettersOnlyFilter():
            return query.from_rack(list(f.value)), None
        case StartingWithFilter():
            return query.starting_with(f.value), None
        case EndingWithFilter():
            return query.ending_with(f.value), None
        case LengthFilter():
            return query.length(min=f.min, max=f.max), None
        case LetterAtFilter():
            return query.letter_at(f.position, f.letter), None
        case MatchingPatternFilter():
            return query.matching_pattern(f.value), None
        case MinScoreFilter():
            return query.min_score(f.value), None
    return query, None


def _apply_sort(query: WordQuery, sort: str, descending: bool = True) -> WordQuery:
    match sort:
        case "score":
            return query.sort_by_score(descending=descending)
        case "length":
            return query.sort_by_length(descending=descending)
        case "alphabetical":
            if descending:
                return query.sort_alphabetically()
            return query.sort_alphabetically()
    return query


@router.post("/search", response_model=SearchResponse)
def search_words(body: SearchRequest, request: Request):
    dawg = request.app.state.dawg
    query = WordQuery(dawg)

    substrings: list[str] = []
    for f in body.filters:
        query, substring = _apply_filter(query, f)
        if substring is not None:
            substrings.append(substring)

    query = _apply_sort(query, body.sort, body.descending)
    all_words = query.execute()

    if body.sort == "alphabetical" and not body.descending:
        all_words = list(reversed(all_words))

    if substrings:
        all_words = [
            w for w in all_words if all(s in w for s in substrings)
        ]

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
