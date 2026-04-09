from fastapi import APIRouter, HTTPException, Request
from scrabble_engine import get_word_family, word_score

from explorer_api.models import FamilyExtension, FamilyPrefix, WordFamily

router = APIRouter()


@router.get("/family/{word}", response_model=WordFamily)
def word_family(word: str, request: Request):
    dawg = request.app.state.dawg
    upper = word.upper()

    try:
        raw = get_word_family(dawg, upper)
    except ValueError:
        raise HTTPException(status_code=404, detail=f"Word '{upper}' not found in dictionary")

    return WordFamily(
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
