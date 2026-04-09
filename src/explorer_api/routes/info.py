from fastapi import APIRouter, Request
from scrabble_engine import get_word_family, word_score

from explorer_api.models import (
    FamilyExtension,
    FamilyPrefix,
    WordFamily,
    WordInfoResponse,
)

router = APIRouter()


@router.get("/word/{word}", response_model=WordInfoResponse)
def word_info(word: str, request: Request):
    dawg = request.app.state.dawg
    upper = word.upper()
    valid = dawg.search(upper)
    score = word_score(upper)

    family = None
    if valid:
        raw = get_word_family(dawg, upper)
        family = WordFamily(
            root=raw["root"],
            extensions=[
                FamilyExtension(
                    word=e["word"], suffix=e["suffix"], score=word_score(e["word"])
                )
                for e in raw["extensions"]
            ],
            prefixes=[
                FamilyPrefix(
                    word=p["word"], prefix=p["prefix"], score=word_score(p["word"])
                )
                for p in raw["prefixes"]
            ],
        )

    return WordInfoResponse(
        word=upper,
        valid=valid,
        score=score,
        length=len(upper),
        family=family,
    )
