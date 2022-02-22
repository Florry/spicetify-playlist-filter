# Spicetify-playlist-filter

Adds filtering to the playlists panel to quickly find playlists by name without using the search box.

![](./img/playlist-filtering.gif)
![](./img/playlist-filtering2.webp)

# Installation

- Copy `./dist/playlist-filter.js` to `~/.spicetify/plugins`
- run:

```
spicetify config extensions playlist-filter.js
spicetify apply
```

or install through [spicetify marketplace](https://github.com/CharlieS1103/spicetify-marketplace)

# Made with spicetify Creator

Spicetify Creator is a tool to compile modern Typescript/Javascript code to Spicetify extensions and custom apps.

## Features

- Typescript and React syntax
- Import node packages
- CSS/SCSS with PostCSS support
- Extremely fast compile time with esbuild.
- Plugins

## Docs

Check out [Spicetify's docs](https://spicetify.app/docs/development/spicetify-creator/the-basics)!

## Available scripts

- `build`: Compiles the extension to spicetify
- `build-local`: Compiles the extension to ./dist folder
- `watch`: Compiles the extension to spicetify and watches for changes
- `watch-local`: Compiles the extension to ./dist folder and watches for changes
