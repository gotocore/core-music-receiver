# Core Music Cast receiver

The web receiver page for Core Music's Chromecast support (Cast Application ID F995C063, custom receiver, audio only).

- `index.html` loads only Google's Cast receiver library (`https://www.gstatic.com/cast/sdk/libs/caf_receiver/v3/cast_receiver_framework.js`). No other script, font or analytics.
- `receiver.css`: layout and colours (white on black, system font stack, 8% overscan margins).
- `receiver.js`: shows the Core logo when idle, and cover, title, artist, album, progress and times while playing.
- `core-logo.png`: the Core mark, white on transparent, 512 x 512.

Hosted with GitHub Pages at https://gotocore.github.io/core-music-receiver/. Outside a Cast device the page shows only the idle splash.
