# IndexedDB Usage In Peakish

## Purpose
This project uses IndexedDB for storing climbs data on the client side (browser), without a backend.

Main benefits:
- async API (does not block UI)
- larger storage compared to `localStorage`
- better fit for structured records and image-heavy entries

## Where It Is Used
- [js/climbs.js](/home/pepuk/repo/peakish/docs/js/climbs.js)

## Data Model
- Database name: `peakishDB`
- Version: `1`
- Object store: `climbs`
- Key path: `id`

Each climb record contains:
- `id`
- `name`
- `picture` (base64 or fallback path)
- `height`
- `date`
- `location`
- `difficulty`
- `distance`
- `peopleCount`
- `notes`

## Runtime Flow
1. Page init opens IndexedDB and creates store on first run (`onupgradeneeded`).
2. All records are loaded via `getAll()` into in-memory array.
3. UI cards are rendered from this array.
4. On create/edit, record is saved with `put()`.
5. On delete, record is removed with `delete()`.
6. UI is re-rendered after each successful write.

## Core Functions
- `openDB()` – opens/initializes database
- `getAllClimbsFromDB()` – reads all climbs
- `putClimbToDB(climb)` – inserts or updates one climb
- `deleteClimbFromDB(id)` – removes one climb
- `initClimbsPage()` – initial data load and first render

## Notes For Report
- Storage is fully client-side; no server is required.
- Persistence works between page reloads in the same browser profile.
- IndexedDB was selected over `localStorage` due to async behavior and better capacity characteristics.
