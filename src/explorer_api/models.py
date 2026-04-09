from typing import Annotated, Literal

from pydantic import BaseModel, Field


# --- Filter types (discriminated union) ---

class HasLettersFilter(BaseModel):
    type: Literal["has_letters"]
    value: str


class HasSubstringFilter(BaseModel):
    type: Literal["has_substring"]
    value: str


class NotContainingFilter(BaseModel):
    type: Literal["not_containing"]
    value: str


class FromLettersOnlyFilter(BaseModel):
    type: Literal["from_letters_only"]
    value: str


class StartingWithFilter(BaseModel):
    type: Literal["starting_with"]
    value: str


class EndingWithFilter(BaseModel):
    type: Literal["ending_with"]
    value: str


class LengthFilter(BaseModel):
    type: Literal["length"]
    min: int | None = None
    max: int | None = None


class LetterAtFilter(BaseModel):
    type: Literal["letter_at"]
    position: int
    letter: str


class MatchingPatternFilter(BaseModel):
    type: Literal["matching_pattern"]
    value: str


class MinScoreFilter(BaseModel):
    type: Literal["min_score"]
    value: int


SearchFilter = Annotated[
    HasLettersFilter
    | HasSubstringFilter
    | NotContainingFilter
    | FromLettersOnlyFilter
    | StartingWithFilter
    | EndingWithFilter
    | LengthFilter
    | LetterAtFilter
    | MatchingPatternFilter
    | MinScoreFilter,
    Field(discriminator="type"),
]


# --- Requests ---

class SearchRequest(BaseModel):
    filters: list[SearchFilter]
    sort: Literal["score", "length", "alphabetical"] = "score"
    limit: int = 100


class RackRequest(BaseModel):
    letters: list[str]
    sort: Literal["score", "length", "alphabetical"] = "score"
    limit: int = 50


# --- Responses ---

class WordResult(BaseModel):
    word: str
    score: int
    length: int


class SearchResponse(BaseModel):
    words: list[WordResult]
    total_count: int
    filters_applied: int


class RackWordResult(BaseModel):
    word: str
    score: int
    length: int
    bingo: bool


class RackResponse(BaseModel):
    words: list[RackWordResult]
    total_count: int


class FamilyExtension(BaseModel):
    word: str
    suffix: str
    score: int


class FamilyPrefix(BaseModel):
    word: str
    prefix: str
    score: int


class WordFamily(BaseModel):
    root: str
    extensions: list[FamilyExtension]
    prefixes: list[FamilyPrefix]


class WordInfoResponse(BaseModel):
    word: str
    valid: bool
    score: int
    length: int
    family: WordFamily | None = None
