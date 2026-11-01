// Core Music Cast receiver (custom UI, audio only; text is self-hosted Chakra Petch). Loads only Google's CAF receiver library; nothing else is fetched except
// the audio and cover that the sender's own device serves on the local network.
(function () {
  'use strict';
  var LOGO = 'core-music-logo.png';
  var context = cast.framework.CastReceiverContext.getInstance();
  var playerManager = context.getPlayerManager();

  // Options: default queue handling (no queue UI), idle timeout stays ON (the receiver closes itself when idle).
  var options = new cast.framework.CastReceiverOptions();
  options.disableIdleTimeout = false;
  var playbackConfig = new cast.framework.PlaybackConfig();
  playbackConfig.autoResumeDuration = 5; // seconds of buffer before an automatic resume after a stall (audio, so short)
  options.playbackConfig = playbackConfig;

  function $(id) { return document.getElementById(id); }
  var els = {
    splash: $('splash'), player: $('player'), cover: $('coverImg'), title: $('title'), artist: $('artist'),
    album: $('album'), state: $('state'), fill: $('fill'), cur: $('cur'), dur: $('dur'),
    bar: $('bar'), wave: $('wave')
  };

  function fmt(s) {
    s = Math.max(0, Math.floor(Number(s) || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
    return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (r < 10 ? '0' : '') + r;
  }

  var shownCover = null;
  function setCover(url) {
    var u = url || LOGO;
    if (u === shownCover) return;
    shownCover = u;
    els.cover.onerror = function () { if (els.cover.getAttribute('src') !== LOGO) { shownCover = LOGO; els.cover.classList.add('logo'); els.cover.src = LOGO; } };
    els.cover.classList.toggle('logo', u === LOGO);
    els.cover.src = u;
  }

  // Waveform (optional). The sender may put precomputed peaks in the media's customData: "peaks": [n integers 0..100]
  // (Core Music's 64 player bars, rounded). Nothing is decoded here. No peaks (or fewer than 16): the plain bar stays.
  var SLOTS = 128, peaks = null, peaksFor = null, lastFrac = -1;
  function readPeaks() {
    var mi = playerManager.getMediaInformation && playerManager.getMediaInformation();
    var id = mi ? (mi.contentId || '') : '';
    if (id === peaksFor) return;
    peaksFor = id; peaks = null; lastFrac = -1;
    var p = mi && mi.customData && mi.customData.peaks;
    if (!p || !p.length || p.length < 16) return;
    var a = [], max = 0, i;
    for (i = 0; i < p.length; i++) { var v = Number(p[i]); v = isFinite(v) && v > 0 ? v : 0; a.push(v); if (v > max) max = v; }
    var div = max <= 1 ? 1 : 100;
    var out = [];
    for (i = 0; i < SLOTS; i++) { // resample to SLOTS bars by linear interpolation
      var x = i * (a.length - 1) / (SLOTS - 1), lo = Math.floor(x), hi = Math.min(a.length - 1, lo + 1);
      out.push(Math.min(1, (a[lo] + (a[hi] - a[lo]) * (x - lo)) / div));
    }
    peaks = out;
  }
  function drawWave(frac) {
    var c = els.wave, w = c.clientWidth, h = c.clientHeight;
    if (!w || !h) return;
    var dpr = window.devicePixelRatio || 1;
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) { c.width = Math.round(w * dpr); c.height = Math.round(h * dpr); lastFrac = -1; }
    if (frac === lastFrac) return;
    lastFrac = frac;
    var g = c.getContext('2d'), W = c.width, H = c.height;
    var slot = W / SLOTS, bw = slot * 0.62;
    g.clearRect(0, 0, W, H);
    function bars(color, x0, x1) {
      g.save(); g.beginPath(); g.rect(x0, 0, x1 - x0, H); g.clip(); g.fillStyle = color;
      for (var i = 0; i < SLOTS; i++) {
        var bh = Math.max(H * 0.06, peaks[i] * H), x = i * slot + (slot - bw) / 2;
        g.fillRect(x, (H - bh) / 2, bw, bh);
      }
      g.restore();
    }
    var px = Math.round(frac * W);
    bars('#6B6B6B', px, W);   // unplayed: grey
    bars('#FFFFFF', 0, px);   // played: white
  }

  var data = {};
  var binder = new cast.framework.ui.PlayerDataBinder(data);
  var S = cast.framework.ui.State;

  function render() {
    var idle = !data.state || data.state === S.LAUNCHING || data.state === S.IDLE;
    els.splash.classList.toggle('hidden', !idle);
    els.player.classList.toggle('hidden', idle);
    if (idle) { shownCover = null; peaksFor = null; peaks = null; return; }
    var md = data.metadata || {};
    els.title.textContent = data.title || md.title || '';
    els.artist.textContent = md.artist || md.albumArtist || data.subtitle || '';
    els.album.textContent = md.albumName || '';
    setCover(data.thumbnailUrl || (md.images && md.images[0] && md.images[0].url));
    var cur = Number(data.currentTime) || 0, dur = Number(data.duration) || 0;
    var frac = dur > 0 ? Math.min(1, cur / dur) : 0;
    readPeaks();
    var useWave = !!peaks;
    els.wave.classList.toggle('hidden', !useWave);
    els.bar.classList.toggle('hidden', useWave);
    if (useWave) drawWave(frac); else els.fill.style.width = (frac * 100) + '%';
    els.cur.textContent = fmt(cur);
    els.dur.textContent = dur > 0 ? fmt(dur) : '';
    els.state.textContent = data.state === S.PAUSED ? 'Paused'
      : (data.state === S.BUFFERING || data.state === S.LOADING) ? 'Loading' : '';
  }

  binder.addEventListener(cast.framework.ui.PlayerDataEventType.ANY_CHANGE, render);
  render();
  context.start(options);
})();
