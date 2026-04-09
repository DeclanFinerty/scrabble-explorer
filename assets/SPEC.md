# Scrabble Explorer - Development Specification

## Project Overview

An interactive word exploration and search tool for Scrabble players. Provides a visual, composable search interface for finding words from the official Scrabble dictionary, exploring word families, and studying high-value plays. Built as a standalone tool that will eventually become a module in the larger Scrabble platform.

**Stack:** FastAPI (backend) + React/Vite (frontend)
**Dependency:** `scrabble-engine` (installed as a local package via path dependency)
**Package manager:** uv (backend), npm (frontend)

---

## Architecture

```
scrabble-explorer/
├── SPEC.md
├── README.md
├── backend/
│   ├── pyproject.toml               # depends on scrabble-engine via path
│   ├── src/explorer_api/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI app, CORS, startup (DAWG load)
│   │   ├── routes/
│   │   │   ├── search.py            # /search endpoint — WordQuery execution
│   │   │   ├── families.py          # /family endpoint — word family lookup
│   │   │   ├── rack.py              # /rack endpoint — rack solver
│   │   │   └── info.py              # /word/{word} — single word info, score, validity
│   │   └── models.py                # Pydantic request/response models
│   └── tests/
│       └── test_routes.py
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── App.tsx
│       ├── main.tsx
│       ├── api/                     # API client functions
│       │   └── client.ts
│       ├── components/
│       │   ├── SearchBar.tsx         # Main search input
│       │   ├── FilterChip.tsx        # Individual filter tag (removable)
│       │   ├── FilterBar.tsx         # Row of active filter chips
│       │   ├── FilterSuggestions.tsx  # Dropdown suggestions as user types
│       │   ├── ResultsList.tsx       # Word results with scores
│       │   ├── WordCard.tsx          # Single word detail (score, family, definition placeholder)
│       │   ├── WordFamilyTree.tsx    # Visual tree of word extensions
│       │   ├── RackInput.tsx         # 7-tile rack entry
│       │   └── ScoreDistribution.tsx # Chart of score distribution in results
│       ├── hooks/
│       │   ├── useSearch.ts          # Search state management
│       │   └── useDebounce.ts        # Debounce for live search
│       └── types/
│           └── index.ts             # TypeScript types matching API models
└── docker-compose.yml               # optional, for running both services
```

---

## Backend API

### Startup

Load the DAWG once at startup and hold it in memory. All endpoints use the same DAWG instance.

```python
from scrabble_engine.dawg import DAWG
from scrabble_engine.query import WordQuery

dawg: DAWG = None

@app.on_event("startup")
def load_dictionary():
    global dawg
    dawg = DAWG.from_file("path/to/twl06.txt")
```

### Endpoints

#### `POST /search`

Execute a chained word query.

**Request:**
```json
{
    "filters": [
        {"type": "containing", "value": "Z"},
        {"type": "not_containing", "value": "U"},
        {"type": "length", "min": 3, "max": 5},
        {"type": "starting_with", "value": "A"},
        {"type": "ending_with", "value": "E"},
        {"type": "letter_at", "position": 2, "letter": "Z"},
        {"type": "matching_pattern", "value": "A.Z.E"},
        {"type": "min_score", "value": 15}
    ],
    "sort": "score",
    "limit": 100
}
```

**Response:**
```json
{
    "words": [
        {"word": "AZOTE", "score": 14, "length": 5},
        {"word": "AMAZE", "score": 16, "length": 5}
    ],
    "total_count": 47,
    "filters_applied": 3
}
```

The backend builds a `WordQuery`, applies each filter, executes, and returns results. Invalid filter types return 400.

#### `GET /word/{word}`

Look up a single word.

**Response:**
```json
{
    "word": "BOARD",
    "valid": true,
    "score": 8,
    "length": 5,
    "family": {
        "root": "BOARD",
        "extensions": [
            {"word": "BOARDS", "suffix": "S", "score": 9},
            {"word": "BOARDED", "suffix": "ED", "score": 10},
            {"word": "BOARDING", "suffix": "ING", "score": 12}
        ],
        "prefixes": [
            {"word": "ABOARD", "prefix": "A", "score": 9}
        ]
    }
}
```

If the word is not valid, `valid` is false and `family` is null.

#### `POST /rack`

Find all words from a set of letters.

**Request:**
```json
{
    "letters": ["S", "A", "T", "I", "R", "E", "N"],
    "sort": "score",
    "limit": 50
}
```

**Response:**
```json
{
    "words": [
        {"word": "NASTIER", "score": 7, "length": 7, "bingo": true},
        {"word": "RETINAS", "score": 7, "length": 7, "bingo": true},
        {"word": "STAINER", "score": 7, "length": 7, "bingo": true}
    ],
    "total_count": 283
}
```

#### `GET /family/{word}`

Get the word family tree for a word.

**Response:** Same `family` structure as `/word/{word}`, but can be called for any string (returns empty if word is invalid).

---

## Frontend

### Core UX: Search with Filter Chips

The primary interface is a search bar with a chip/tag system for building queries.

**Flow:**
1. User focuses the search bar
2. As they type, suggestions appear below: "Containing Z", "Starting with Z", "Ending with Z", "Words of length 2", etc.
3. User clicks a suggestion or presses Enter — it becomes a **chip** below the search bar
4. The search bar clears, ready for the next filter
5. Results update live as chips are added or removed
6. Each chip has an X to remove it
7. Results show word, score, and length in a clean list

**Suggestion logic:**
- Single letter typed (e.g., "Z") → suggest "Containing Z", "Starting with Z", "Ending with Z", "Not containing Z"
- Number typed (e.g., "3") → suggest "Length = 3", "Length >= 3", "Length <= 3", "Min score 3"
- Multiple letters typed (e.g., "QU") → suggest "Starting with QU", "Ending with QU", "Containing QU"
- Pattern with dots (e.g., "..G") → suggest "Matching pattern ..G"
- Common shortcuts: "no vowels" → not_containing AEIOU, "Q no U" → containing Q + not_containing U

**Chip types and colors:**
Each filter type gets a distinct subtle color so the chain is visually scannable:
- Containing → one color
- Not containing → another color (visually distinct as an exclusion)
- Starting with / Ending with → another color
- Length → another color
- Letter at position → another color
- Min score → another color

### Results List

- Show word, base score, and length for each result
- Click a word to expand its WordCard (inline or side panel)
- WordCard shows: the word, its score, its word family tree, letter-by-letter point breakdown
- Sort toggle: by score, by length, alphabetically
- Result count displayed: "47 words match"

### Word Family Tree

A visual component showing a root word and its extensions. Can be displayed:
- Inside a WordCard when a user clicks a word
- As a standalone view at `/family/BOARD`

Visual style: a tree or branching diagram. Root word at the left/top, branches for each suffix/prefix. Each branch shows the word and its score. Interactive — click a branch to navigate to that word's family.

### Rack Solver View

A separate tab or section:
- 7 tile slots (can be fewer) where user clicks/types letters
- Support for blank tile (shown as ?)
- Results appear sorted by score
- 7-letter words flagged as BINGO (+50)
- Click a result to see its WordCard

### Visualizations

Build these as individual components, add them incrementally:

1. **Score distribution chart** — histogram of scores in the current result set. "Your filtered words mostly score 8-12 points." Helps users understand the value landscape.

2. **Letter frequency bar chart** — for the current result set, how often each letter appears. Useful for seeing patterns ("words with Z heavily favor A and E as companions").

3. **Word length distribution** — simple bar chart of how many words at each length in the result set.

These are lightweight chart components. Use Recharts (already available in the React artifact environment) or a simple SVG-based chart.

---

## Development Phases

### Phase 1: Backend API

Set up the FastAPI project with scrabble-engine as a dependency. Implement all four endpoints. Write route tests. Verify the DAWG loads at startup and all queries return correct results.

**Key detail:** The path dependency to scrabble-engine. In `pyproject.toml`:
```toml
[project]
dependencies = [
    "scrabble-engine @ file:///../scrabble-engine",
    "fastapi",
    "uvicorn",
]
```

Adjust the path based on your directory structure.

### Phase 2: Frontend Shell

Set up React/Vite project. Build the SearchBar, FilterChip, FilterBar, and ResultsList components. Wire up to the backend API. Get the basic search-with-chips flow working end to end. Focus on making it feel responsive — debounce search, show loading states, update results as filters change.

### Phase 3: Word Details

Build the WordCard and WordFamilyTree components. Clicking a word in results shows its card. The family tree is the centerpiece visual — make it look good.

### Phase 4: Rack Solver

Build the RackInput component and wire it to the /rack endpoint. Show results with bingo flagging. Link results to WordCards.

### Phase 5: Visualizations

Add the chart components one at a time. Score distribution first (most useful), then letter frequency, then length distribution. These update reactively based on the current result set.

### Phase 6: Polish & Natural Language Parsing (optional)

Add basic text parsing to the search bar — detect patterns like "Q without U" or "5 letter words with Z" and auto-create the corresponding filter chips. This is a convenience layer on top of the chip system, not a replacement for it. Use simple keyword matching and regex, not an LLM.

---

## Design Principles

- **The search bar is the entry point for everything.** Users should never feel lost about how to start.
- **Chips make the query visible and editable.** The user always knows exactly what filters are active. They can remove any one without losing the others.
- **Results are always visible.** Don't make the user click "search" — results update live as filters change.
- **Every word is a link to more information.** Click any word anywhere in the app and you can see its score, family, and details.
- **Mobile-friendly.** Chips and cards work well on small screens. No hover-dependent interactions.
- **Fast.** The DAWG is in memory, queries should return in under 100ms, the UI should feel instant.

---

## Future Integration Points

- **scrabble-vision:** When vision produces a board grid, the explorer could show "words on this board" or link to the engine's move analysis
- **scrabble-engine move analysis:** Add a board view to the explorer that shows suggested moves (Phase 5 of scrabble-engine's SPEC)
- **Course/learning layer:** The explorer's word families, filter system, and visualizations are the building blocks of structured lessons
- **WASM compilation:** Move the dictionary and query logic to the browser for zero-latency search, eliminating the backend for the explorer features (engine move generation would still need a backend)