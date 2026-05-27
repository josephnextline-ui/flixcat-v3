// Aggressive ad-blocking JS injected into every WebView page
export const AD_BLOCK_JS = `
(function() {
  'use strict';

  const _noop = function() { return { focus:function(){}, blur:function(){}, close:function(){}, closed:false }; };
  window.open = _noop;
  window.alert = function() {};
  window.confirm = function() { return false; };
  window.prompt = function() { return null; };

  const _origAEL = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, fn, opts) {
    if (type === 'beforeunload' || type === 'unload') return;
    return _origAEL.call(this, type, fn, opts);
  };

  document.write = function() {};
  document.writeln = function() {};

  const _pushState = history.pushState.bind(history);
  history.pushState = function(state, title, url) {
    if (url && typeof url === 'string' && (url.includes('exit') || url.includes('redirect'))) return;
    return _pushState(state, title, url);
  };

  const _realSI = window.setInterval;
  const _realST = window.setTimeout;
  const AD_TIMER_PATTERNS = ['popup','advert','banner','clickunder','popunder','overlay','interstitial'];
  window.setInterval = function(fn, delay) {
    const src = (fn || '').toString();
    if (AD_TIMER_PATTERNS.some(p => src.includes(p))) return -1;
    return _realSI.apply(this, arguments);
  };
  window.setTimeout = function(fn, delay) {
    const src = (fn || '').toString();
    if (AD_TIMER_PATTERNS.some(p => src.includes(p))) return -1;
    return _realST.apply(this, arguments);
  };

  const AD_DOMAINS = [
    'doubleclick','googlesyndication','adnxs','outbrain','taboola',
    'popads','popcash','propellerads','exoclick','adsterra','trafficjunky',
    'adcash','adform','criteo','openx','pubmatic','mgid','revcontent',
    'tapad','bidswitch','lijit','yieldmanager','casalemedia','rubiconproject',
    'adsrvr','serving-sys','adtech','smartadserver','sovrn','tremorhub',
    'appnexus','indexexchange','richpush','pushground','notifyterms',
    'trafmag','bidvertiser','yllix','trafficshop','fuckingfast',
    'trafficforce','ero-advertising','juicyads','plugrush','hilltopads',
    'admaven','popin','zonedge','clickadu','kadam',
  ];

  const AD_CLASSES = [
    'ad-','_ad-','-ad ','_ad ','ads-','_ads','banner','popup','popunder',
    'interstitial','overlay','modal-ad','advertisement','adsense','advert',
    'sponsor','promo','dfp-','gpt-','prebid','adsbygoogle','adunit',
    'ad_container','ad_wrapper','ad_box','ad_slot','ad_frame',
    'floating-ad','sticky-ad','leaderboard','skyscraper',
    'outbrain','taboola','revcontent','mgid','zergnet',
  ];

  const isVideoEl = (el) => {
    if (!el || !el.tagName) return false;
    const tag = el.tagName.toUpperCase();
    if (['VIDEO','SOURCE','TRACK','CANVAS'].includes(tag)) return true;
    const cls = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
    return cls.includes('player') || !!el.querySelector('video');
  };

  const isAdEl = (el) => {
    if (!el || !el.tagName || isVideoEl(el)) return false;
    const src = (el.getAttribute && (el.getAttribute('src') || el.getAttribute('data-src') || el.getAttribute('href'))) || '';
    if (src && AD_DOMAINS.some(d => src.includes(d))) return true;
    const cls = ((el.className || '') + ' ' + (el.id || '')).toLowerCase();
    if (AD_CLASSES.some(c => cls.includes(c))) return true;
    if (el.tagName.toUpperCase() === 'IFRAME') {
      const s = el.src || '';
      if (s && AD_DOMAINS.some(d => s.includes(d))) return true;
    }
    return false;
  };

  const killFixed = () => {
    try {
      const all = document.querySelectorAll('*');
      all.forEach(el => {
        if (isVideoEl(el)) return;
        const cs = window.getComputedStyle(el);
        if ((cs.position === 'fixed' || cs.position === 'sticky') && !isVideoEl(el)) {
          const zIndex = parseInt(cs.zIndex) || 0;
          const rect = el.getBoundingClientRect();
          const isOverlay = zIndex > 1000 || (rect.width > window.innerWidth * 0.5 && rect.height > 100);
          if (isOverlay && !el.querySelector('video')) {
            el.style.setProperty('display', 'none', 'important');
            el.style.setProperty('visibility', 'hidden', 'important');
            el.style.setProperty('opacity', '0', 'important');
            el.style.setProperty('pointer-events', 'none', 'important');
          }
        }
      });
    } catch(e) {}
  };

  const sweep = () => {
    try {
      document.querySelectorAll('*').forEach(el => {
        if (isAdEl(el)) {
          el.style.setProperty('display', 'none', 'important');
          try { el.parentNode && el.parentNode.removeChild(el); } catch(e) {}
        }
      });
      killFixed();
    } catch(e) {}
  };

  sweep();
  try {
    new MutationObserver(mutations => {
      mutations.forEach(m => {
        m.addedNodes && m.addedNodes.forEach(node => {
          if (node.nodeType === 1 && isAdEl(node)) {
            node.style.setProperty('display', 'none', 'important');
            try { node.parentNode && node.parentNode.removeChild(node); } catch(e) {}
          }
        });
      });
      sweep();
    }).observe(document.documentElement, { childList: true, subtree: true });
  } catch(e) {}

  _realSI(sweep, 2000);
  true;
})();
`;

export const EXTRACTION_JS = `
(function() {
  'use strict';
  var sent = false;
  var sentSubtitles = {};

  function isVideoUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('blob:') || url.startsWith('data:')) return false;
    if (!url.startsWith('http')) return false;
    var lower = url.toLowerCase().split('?')[0];
    var exts = ['.m3u8', '.mp4', '.mkv', '.webm', '.mov', '.ts'];
    var keywords = ['/hls/', '/stream/', '/playlist', '/manifest', 'master.m3u8', 'index.m3u8', '/media/', '/video/'];
    if (exts.some(function(e) { return lower.endsWith(e) || lower.includes(e + '?'); })) return true;
    if (keywords.some(function(k) { return lower.includes(k); })) return true;
    return false;
  }

  function isSubtitleUrl(url) {
    if (!url || typeof url !== 'string') return false;
    if (url.startsWith('blob:') || url.startsWith('data:')) return false;
    if (!url.startsWith('http')) return false;
    var lower = url.toLowerCase().split('?')[0];
    return lower.endsWith('.vtt') || lower.endsWith('.srt') || lower.endsWith('.ass')
      || lower.includes('subtitle') || lower.includes('caption') || lower.includes('/sub/')
      || (lower.includes('track') && (lower.includes('.vtt') || lower.includes('.srt')));
  }

  function guessLang(url, label) {
    var combined = ((url || '') + ' ' + (label || '')).toLowerCase();
    if (combined.includes('english') || combined.includes('/en') || combined.includes('.en.') || combined.includes('_en_') || combined.includes('_en.')) return 'en';
    if (combined.includes('spanish') || combined.includes('/es') || combined.includes('.es.')) return 'es';
    if (combined.includes('french') || combined.includes('/fr') || combined.includes('.fr.')) return 'fr';
    if (combined.includes('german') || combined.includes('/de') || combined.includes('.de.')) return 'de';
    if (combined.includes('portuguese') || combined.includes('/pt') || combined.includes('.pt.')) return 'pt';
    if (combined.includes('arabic') || combined.includes('/ar')) return 'ar';
    if (combined.includes('japanese') || combined.includes('/ja')) return 'ja';
    if (combined.includes('korean') || combined.includes('/ko')) return 'ko';
    if (combined.includes('chinese') || combined.includes('/zh')) return 'zh';
    return 'en';
  }

  function langLabel(code) {
    var map = { en:'English', es:'Spanish', fr:'French', de:'German', pt:'Portuguese', ar:'Arabic', ja:'Japanese', ko:'Korean', zh:'Chinese' };
    return map[code] || code.toUpperCase();
  }

  function sendVideoUrl(url, source) {
    if (sent || !isVideoUrl(url)) return;
    sent = true;
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'VIDEO_URL',
        url: url,
        referer: window.location.href,
        source: source
      }));
    } catch(e) {}
  }

  function sendSubtitleUrl(url, label) {
    if (sentSubtitles[url] || !isSubtitleUrl(url)) return;
    sentSubtitles[url] = true;
    var lang = guessLang(url, label);
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'SUBTITLE_URL',
        url: url,
        language: lang,
        label: label || langLabel(lang),
      }));
    } catch(e) {}
  }

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url) {
    var u = typeof url === 'string' ? url : '';
    sendVideoUrl(u, 'xhr');
    sendSubtitleUrl(u, '');
    return origOpen.apply(this, arguments);
  };

  var origFetch = window.fetch;
  window.fetch = function(input, init) {
    var u = typeof input === 'string' ? input : (input && input.url ? input.url : '');
    sendVideoUrl(u, 'fetch');
    sendSubtitleUrl(u, '');
    return origFetch.apply(this, arguments);
  };

  try {
    var desc = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'src');
    if (desc && desc.set) {
      Object.defineProperty(HTMLMediaElement.prototype, 'src', {
        set: function(v) { sendVideoUrl(v, 'video-src'); return desc.set.call(this, v); },
        get: desc.get,
        configurable: true
      });
    }
  } catch(e) {}

  var origSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function(name, value) {
    var tag = this.tagName && this.tagName.toUpperCase();
    if (name === 'src') {
      if (tag === 'VIDEO' || tag === 'SOURCE') sendVideoUrl(value, 'setAttribute');
      if (tag === 'TRACK') sendSubtitleUrl(value, this.getAttribute('label') || '');
    }
    return origSetAttr.call(this, name, value);
  };

  true;
})();
`;
