from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from scrabble_engine import load_dictionary

from explorer_api.routes import families, info, rack, search


@asynccontextmanager
async def lifespan(app: FastAPI):
    dictionary = load_dictionary()
    app.state.dictionary = dictionary
    app.state.dawg = dictionary.dawg
    yield


app = FastAPI(title="Scrabble Explorer API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(search.router, prefix="/api")
app.include_router(info.router, prefix="/api")
app.include_router(rack.router, prefix="/api")
app.include_router(families.router, prefix="/api")
