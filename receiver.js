// Core Music Cast receiver (custom UI, audio only). Loads only Google's CAF receiver library; nothing else is fetched except
// the audio and cover that the sender's own device serves on the local network.
(function () {
  'use strict';
  var LOGO = 'core-logo.png';
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
    album: $('album'), state: $('state'), fill: $('fill'), cur: $('cur'), dur: $('dur')
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
    els.cover.onerror = function () { if (els.cover.getAttribute('src') !== LOGO) { shownCover = LOGO; els.cover.src = LOGO; } };
    els.cover.src = u;
  }

  var data = {};
  var binder = new cast.framework.ui.PlayerDataBinder(data);
  var S = cast.framework.ui.State;

  function render() {
    var idle = !data.state || data.state === S.LAUNCHING || data.state === S.IDLE;
    els.splash.classList.toggle('hidden', !idle);
    els.player.classList.toggle('hidden', idle);
    if (idle) { shownCover = null; return; }
    var md = data.metadata || {};
    els.title.textContent = data.title || md.title || '';
    els.artist.textContent = md.artist || md.albumArtist || data.subtitle || '';
    els.album.textContent = md.albumName || '';
    setCover(data.thumbnailUrl || (md.images && md.images[0] && md.images[0].url));
    var cur = Number(data.currentTime) || 0, dur = Number(data.duration) || 0;
    els.fill.style.width = (dur > 0 ? Math.min(100, (cur / dur) * 100) : 0) + '%';
    els.cur.textContent = fmt(cur);
    els.dur.textContent = dur > 0 ? fmt(dur) : '';
    els.state.textContent = data.state === S.PAUSED ? 'Paused'
      : (data.state === S.BUFFERING || data.state === S.LOADING) ? 'Loading' : '';
  }

  binder.addEventListener(cast.framework.ui.PlayerDataEventType.ANY_CHANGE, render);
  render();
  context.start(options);
})();
