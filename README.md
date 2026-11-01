# Core Music Cast receiver

The web receiver page for Core Music's Chromecast support (Cast Application ID F995C063, custom receiver, audio only).

- `index.html` loads only Google's Cast receiver library (`https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js`). No other script, font or analytics.
- `receiver.css`: layout and colours (white on black, 5% overscan margins, sizes in vh/vw so 1920x1080 and 1280x720 match).
- `receiver.js`: shows the Core logo when idle, and cover, title, artist, album, progress and times while playing.
- `fonts/`: Chakra Petch Regular and Bold (woff2, self-hosted, all receiver text) and `fonts/OFL.txt`, its SIL Open Font License 1.1. Source: google/fonts `ofl/chakrapetch` (copyright 2018 The Chakra Petch Project Authors); the woff2 files are the unmodified TTFs converted to woff2.
- `core-wordmark.svg`: the approved Core wordmark r2 (chevron + "ore"), white, unmodified copy of `core-brand/masters/elements/wordmark/chevron-ore-r2.svg`.

Waveform: if the sender puts `"peaks": [integers 0..100]` (at least 16, Core Music's player uses 64) in the media's `customData`, the progress area draws a waveform (white played, grey unplayed). Without peaks the plain progress bar is shown. Nothing is decoded on the TV.

Hosted with GitHub Pages at https://gotocore.github.io/core-music-receiver/. Outside a Cast device the page shows only the idle splash.
