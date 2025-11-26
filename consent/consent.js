(function () {
  const KEY = 'ptb_consent';

  // Default consent state
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

  const setVisible = (v) => {
    modal.hidden = !v;
    backdrop.style.display = v ? 'block' : 'none';
  };

  // Save consent + apply tracking rules
  function save(consent) {
    localStorage.setItem(KEY, JSON.stringify(consent));
    setVisible(false);
    apply(consent);
  }

  // Load saved consent
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  /* -------------------------------------------------------
     APPLY CONSENT SETTINGS
     This is where tracking scripts are allowed or blocked.
  --------------------------------------------------------*/
  function apply(consent) {

    /* -------------------------------
       GOOGLE ANALYTICS (GA4)
       Only loads if analytics = true
    --------------------------------*/
    if (consent.analytics && !window.__gaLoaded) {
      window.__gaLoaded = true;

      // Load GA4 script
      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-S8V4SJ0PV5';
      document.head.appendChild(gtagScript);

      // Initialize GA4
      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-S8V4SJ0PV5', {
        anonymize_ip: true
      });
    }

    /* -------------------------------
       META PIXEL (future add-on)
       Only loads when ads = true
       You haven’t activated this yet.
    --------------------------------*/
    if (false && consent.ads && !window.__fbqLoaded) {
      window.__fbqLoaded = true;

      !function (f, b, e, v, n, t, s) {
        if (f.fbq) return;
        n = f.fbq = function () {
          n.callMethod ?
            n.callMethod.apply(n, arguments) : n.queue.push(arguments)
        };
        if (!f._fbq) f._fbq = n;
        n.push = n; n.loaded = !0; n.version = '2.0';
        n.queue = [];
        t = b.createElement(e); t.async = !0;
        t.src = v; s = b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t, s);
      }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

      // fbq('init', 'YOUR_PIXEL_ID');  <-- you'll add later
      // fbq('track', 'PageView');
    }

    // If ads disabled, revoke pixel (when added)
    if (!consent.ads && window.fbq) {
      try { fbq('consent', 'revoke'); } catch (e) { }
    }
  }

  /* -------------------------------------------------------
     BUTTON UI CONTROL
  --------------------------------------------------------*/

  $('#ptb-accept').onclick = () => {
    save({
      ...state,
      analytics: true,
      crash: true,
      ads: true,
      timestamp: Date.now()
    });
  };

  $('#ptb-reject').onclick = () => {
    save({
      ...state,
      analytics: false,
      crash: false,
      ads: false,
      timestamp: Date.now()
    });
  };

  $('#ptb-customize').onclick = () => {
    prefs.style.display = prefs.style.display === 'block' ? 'none' : 'block';

    if (prefs.style.display === 'block') {
      $('#ptb-analytics').checked = state.analytics;
      $('#ptb-crash').checked = state.crash;
      $('#ptb-ads').checked = state.ads;
    }
  };

  $('#ptb-manage-consent').onclick = () => setVisible(true);

  // Accept-all from customize mode
  $('#ptb-accept').addEventListener('click', () => {
    if (prefs.style.display === 'block') {
      save({
        strict: true,
        analytics: $('#ptb-analytics').checked,
        crash: $('#ptb-crash').checked,
        ads: $('#ptb-ads').checked,
        timestamp: Date.now(),
        version: 1
      });
    }
  });

  // Initialize on first load
  const existing = load();
  if (existing) {
    apply(existing);
  } else {
    setVisible(true);
  }

})();
