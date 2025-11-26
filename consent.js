(function () {
  const KEY = 'ptb_consent';
  const state = {
    strict: true,
    analytics: false,
    crash: false,
    ads: false,
    timestamp: null,
    version: 1
  };

  const $ = s => document.querySelector(s);
  const modal = $('#ptb-consent');
  const backdrop = $('#ptb-consent-backdrop');
  const prefs = $('#ptb-prefs');

  const setVisible = v => {
    modal.hidden = !v;
    backdrop.style.display = v ? 'block' : 'none';
  };

  function save(consent) {
    localStorage.setItem(KEY, JSON.stringify(consent));
    setVisible(false);
    apply(consent);
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  function apply(consent) {
    // Analytics
    if (consent.analytics && !window.__gaLoaded) {
      window.__gaLoaded = true;
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;

      // load Google Analytics script here if you want
      // gtag('js', new Date());
      // gtag('config', 'G-XXXXXXX');
    }

    // Ads / Meta Pixel
    if (consent.ads && !window.__fbqLoaded) {
      window.__fbqLoaded = true;

      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n;
        n.push = n;
        n.loaded = !0;
        n.version = '2.0';
        n.queue = [];
        t = b.createElement(e);
        t.async = !0;
        t.src = v;
        s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s)
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // fbq('init', 'YOUR_PIXEL_ID');
      // fbq('track', 'PageView');
    }
  }

  // Buttons
  $('#ptb-accept').onclick = () =>
    save({ ...state, analytics: true, crash: true, ads: true, timestamp: Date.now() });

  $('#ptb-reject').onclick = () =>
    save({ ...state, analytics: false, crash: false, ads: false, timestamp: Date.now() });

  $('#ptb-customize').onclick = () => {
    prefs.style.display = prefs.style.display === 'block' ? 'none' : 'block';
    if (prefs.style.display === 'block') {
      $('#ptb-analytics').checked = state.analytics;
      $('#ptb-crash').checked = state.crash;
      $('#ptb-ads').checked = state.ads;
    }
  };

  $('#ptb-manage-consent').onclick = () => setVisible(true);

  // First load
  const existing = load();
  if (existing) {
    apply(existing);
  } else {
    setVisible(true);
  }
})();
