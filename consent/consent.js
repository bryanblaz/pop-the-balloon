(function () {
  const KEY = 'ptb_consent';

  // Default base state
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

  /* -------------------------------
     Helpers
  --------------------------------*/

  const setVisible = (v) => {
    if (!modal || !backdrop) return;

    if (v) {
      // Show
      modal.removeAttribute('hidden');
      backdrop.style.display = 'block';

      // Force reflow so transitions apply
      void modal.offsetWidth;

      modal.classList.add('ptb-open');
      backdrop.classList.add('ptb-open');
    } else {
      // Hide with transition
      modal.classList.remove('ptb-open');
      backdrop.classList.remove('ptb-open');

      setTimeout(() => {
        backdrop.style.display = 'none';
        modal.setAttribute('hidden', '');
      }, 260); // slightly > CSS 0.25s
    }
  };

  const trackEvent = (action, extra) => {
    if (typeof window.gtag !== 'function') return;
    window.gtag('event', action, Object.assign({
      event_category: 'consent',
      event_label: action
    }, extra || {}));
  };

  function save(consent, source) {
    localStorage.setItem(KEY, JSON.stringify(consent));
    setVisible(false);
    apply(consent, source);
  }

  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY));
    } catch (e) {
      return null;
    }
  }

  /* -------------------------------------------------------
     APPLY CONSENT SETTINGS + GA4 INIT
  --------------------------------------------------------*/
  function apply(consent, source) {

    /* GOOGLE ANALYTICS (GA4) – only if analytics is true */
    if (consent.analytics && !window.__gaLoaded) {
      window.__gaLoaded = true;

      const gtagScript = document.createElement('script');
      gtagScript.async = true;
      gtagScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-S8V4SJ0PV5';
      document.head.appendChild(gtagScript);

      window.dataLayer = window.dataLayer || [];
      function gtag() { dataLayer.push(arguments); }
      window.gtag = gtag;

      gtag('js', new Date());
      gtag('config', 'G-S8V4SJ0PV5', {
        anonymize_ip: true
      });
    }

    // Fire GA event only when this was triggered by a user action
    if (source && typeof window.gtag === 'function' && consent.analytics) {
      trackEvent(source, {
        analytics: consent.analytics ? 1 : 0,
        ads: consent.ads ? 1 : 0,
        crash: consent.crash ? 1 : 0
      });
    }

    /* META PIXEL placeholder (disabled for now) */
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

      // fbq('init', 'YOUR_PIXEL_ID');
      // fbq('track', 'PageView');
    }

    if (!consent.ads && window.fbq) {
      try { fbq('consent', 'revoke'); } catch (e) {}
    }
  }

  /* -------------------------------------------------------
     BUTTON / UI WIRING
  --------------------------------------------------------*/

  if ($('#ptb-accept')) {
    $('#ptb-accept').addEventListener('click', () => {
      let consent;
      let source;

      // If prefs are visible, save granular settings
      if (prefs && prefs.style.display === 'block') {
        consent = {
          strict: true,
          analytics: $('#ptb-analytics').checked,
          crash: $('#ptb-crash').checked,
          ads: $('#ptb-ads').checked,
          timestamp: Date.now(),
          version: 1
        };
        source = 'consent_custom_save';
      } else {
        // Simple "Accept all"
        consent = {
          ...state,
          analytics: true,
          crash: true,
          ads: true,
          timestamp: Date.now(),
          version: 1
        };
        source = 'consent_accept_all';
      }

      save(consent, source);
    });
  }

  if ($('#ptb-reject')) {
    $('#ptb-reject').addEventListener('click', () => {
      const consent = {
        ...state,
        analytics: false,
        crash: false,
        ads: false,
        timestamp: Date.now(),
        version: 1
      };
      // GA will not fire here because analytics=false (privacy-safe)
      save(consent, 'consent_reject_all');
    });
  }

  if ($('#ptb-customize')) {
    $('#ptb-customize').addEventListener('click', () => {
      if (!prefs) return;
      const open = prefs.style.display === 'block';
      prefs.style.display = open ? 'none' : 'block';

      if (!open) {
        // When opening, reflect current state in checkboxes if we have one saved
        const existing = load();
        const effective = existing || state;
        if ($('#ptb-analytics')) $('#ptb-analytics').checked = !!effective.analytics;
        if ($('#ptb-crash')) $('#ptb-crash').checked = !!effective.crash;
        if ($('#ptb-ads')) $('#ptb-ads').checked = !!effective.ads;
      }
    });
  }

  if ($('#ptb-manage-consent')) {
    $('#ptb-manage-consent').addEventListener('click', () => {
      setVisible(true);
    });
  }

  /* -------------------------------------------------------
     INITIALIZE ON PAGE LOAD
  --------------------------------------------------------*/

  const existing = load();
  if (existing) {
    apply(existing);        // No source: no GA event
  } else {
    setVisible(true);       // First-time visit → show banner
  }

})();
