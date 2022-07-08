# built-environment

A Typescript/Next/Semantic-UI/Mapbox/Three.js project to play around with the built environment.

## Prerequisites

You need Node installed locally and a Mapbox API key.

## Setup

To run locally:

1. `yarn`
2. `NEXT_PUBLIC_MAPBOX_GL_ACCESS_TOKEN=... yarn dev`
 
## Features

* Saved progress (options, location, theme, etc) in `localStorage`.
* Loaded objects (`.obj` files) saved in `IndexedDB` and their location saved in state.
* TODO: Display loaded `.obj` on map (with ability to move them around)
* TODO: Add pinning/weather integration.
* TODO: Fix layering with extrusion/satellite (a bit buggy)
