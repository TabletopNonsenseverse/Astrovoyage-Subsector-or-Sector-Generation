# Astrovoyage Sector Generator

A browser-based subsector and sector generator for Astrovoyage.

## Current features

- Manual subsector editing: 8 × 10 parsecs.
- Manual sector editing: 24 × 30 parsecs (3 × 3 subsectors).
- One-click dense subsector generation.
- One-click dense sector generation.
- World occurrence using 2d6: odd results create worlds; 10 and 12 create anomalies.
- World generation for type, gravity, atmosphere, population, and biosphere.
- Editable five-character planet codes.
- Hex/world/anomaly notes.
- JSON export/import.
- Shareable map links encoded in the URL.
- Local browser persistence.
- GitHub Pages deployment workflow.

## Generation rules

This implementation follows the supplied rules and intentionally does **not** implement sparse-sector generation.

### World occurrence

Roll 2d6. An odd result creates a world. Results of 10 or 12 create a black hole or similar anomaly. Even results other than 10 and 12 are empty.

### World type

1 = space station, 2 = asteroid, 3–4 = Earth-like, 5 = desert, 6 = waterworld.

### Gravity

Stations are Earth-like and asteroids have negligible gravity. Other worlds roll 1d6: 1–2 low, 3–4 Earth-like, 5–6 high.

### Atmosphere

Stations are breathable and asteroids have no atmosphere. Other worlds roll 1d10: 1 inert, 2–4 acclimatisation, 5–7 breathable, 8 toxic, 9 corrosive, 10 toxic/corrosive.

### Population

Roll 1d6: 1 few, 2 hundreds, 3 thousands, 4 hundreds of thousands, 5 millions, 6 billions. Stations and asteroids halve the roll, rounded up to keep the six-code population scale valid.

### Biosphere

Stations and asteroids have no biosphere. Other worlds roll 1d6: 1 none, 2–5 human-compatible, 6 alien.

## Sharing

The Share Map button puts the complete map into the URL and copies that URL when the browser permits clipboard access. Anyone with the link can open and edit the map in their browser. JSON export provides a portable backup.

This first version is a static application; it does not yet provide server-side authentication, synchronized multiplayer editing, or GM/player permission enforcement. Those can be added with a backend without changing the map data model.
