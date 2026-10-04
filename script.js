/* ============ VIEWPORT HEIGHT FIX (--app-h) ============ */
(function () {
  var root = document.documentElement;
  function setAppHeight() {
    var h = window.innerHeight || root.clientHeight;
    root.style.setProperty('--app-h', Math.round(h) + 'px');
  }
  setAppHeight();
  window.addEventListener('resize', setAppHeight);
  window.addEventListener('orientationchange', function () {
    setTimeout(setAppHeight, 250);
    setTimeout(setAppHeight, 600);
  });
  window.addEventListener('load', setAppHeight);
})();

(function () {
  'use strict';

  /* ================= PAYMENT DETAILS ================= */
  const PAYEE_UPI  = 'indiaupi828@slc';
  const PAYEE_NAME = 'Priydarsh Gupta';
  const PAY_AMOUNT = '99';

  const APP_SCHEMES = {
    phonepe: 'phonepe://pay',
    gpay:    'tez://upi/pay',
    paytm:   'paytmmp://pay',
    bhim:    'upi://pay'
  };
  const GENERIC_UPI = 'upi://pay';

  function buildUpiUrl(base) {
    const q = [
      'pa=' + encodeURIComponent(PAYEE_UPI),
      'pn=' + encodeURIComponent(PAYEE_NAME),
      'am=' + encodeURIComponent(PAY_AMOUNT),
      'cu=INR',
      'tn=' + encodeURIComponent('Payment to Razorpay India')
    ].join('&');
    return base + '?' + q;
  }

  /* last chosen app — used by bottom Continue button */
  let selectedApp = null;

  /* ================= ELEMENTS ================= */
  const screens = {
    name:    document.getElementById('screen-name'),
    email:   document.getElementById('screen-email'),
    payment: document.getElementById('screen-payment')
  };

  const nameInput  = document.getElementById('nameInput');
  const emailInput = document.getElementById('emailInput');
  const nameErr    = document.getElementById('nameErr');
  const emailErr   = document.getElementById('emailErr');
  const hdrName    = document.getElementById('hdrName');
  const loader     = document.getElementById('loader');

  let current = 'name';

  /* ================= NAVIGATION ================= */
  function navigate(to, isBack) {
    if (to === current) return;
    const cur = screens[current];
    const nxt = screens[to];

    if (isBack) {
      cur.classList.remove('active');
      nxt.classList.remove('left');
      nxt.classList.add('active');
    } else {
      cur.classList.remove('active');
      cur.classList.add('left');
      nxt.classList.remove('left');
      nxt.classList.add('active');
    }
    current = to;

    const body = nxt.querySelector('.body');
    if (body) body.scrollTop = 0;
  }

  document.querySelectorAll('[data-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigate(btn.getAttribute('data-back'), true);
    });
  });

  /* ================= SCREEN 1 : NAME ================= */
  document.getElementById('btnNext').addEventListener('click', function () {
    const val = nameInput.value.trim();
    if (val.length < 2) {
      nameErr.classList.remove('show');
      void nameErr.offsetWidth;
      nameErr.classList.add('show');
      nameInput.focus();
      return;
    }
    nameErr.classList.remove('show');
    hdrName.textContent = val;
    navigate('email', false);
  });

  nameInput.addEventListener('input', function () {
    if (nameInput.value.trim().length >= 2) nameErr.classList.remove('show');
  });

  nameInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btnNext').click();
  });

  /* ================= SCREEN 2 : EMAIL ================= */
  document.getElementById('btnContinue').addEventListener('click', function () {
    const val = emailInput.value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    if (!ok) {
      emailErr.classList.remove('show');
      void emailErr.offsetWidth;
      emailErr.classList.add('show');
      emailInput.focus();
      return;
    }
    emailErr.classList.remove('show');

    loader.classList.add('show');
    setTimeout(function () {
      navigate('payment', false);
      loader.classList.remove('show');
    }, 2350);
  });

  emailInput.addEventListener('input', function () {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(emailInput.value.trim())) {
      emailErr.classList.remove('show');
    }
  });

  emailInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') document.getElementById('btnContinue').click();
  });

  /* ================= ACCORDIONS ================= */
  const accUpi = document.getElementById('accUpi');
  const accQr  = document.getElementById('accQr');

  accUpi.querySelector('.acc-head').addEventListener('click', function () {
    accUpi.classList.toggle('open');
    if (accUpi.classList.contains('open')) accQr.classList.remove('open');
  });

  /* ================= QR ================= */
  const QR_IMAGE = 'https://blogger.googleusercontent.com/img/a/AVvXsEh0MfUnxXRLdMYTbzLzpkcENmj9GkhNmpTLFZ9DZc5GZCFOVSdtXhx0903CTa2xpkV17Znmiw03KCQYU7gbvW0_KoOnLHPDiqRFi-L2TT-ms7fIi9qvN0h0rwzq9Wf-OvwHA_nBOhi0-TP7bzyaz6p6wpJ_LIzIqAvI8Pv68EWx7H9ywnvrW7_sqmFmoflh=s1600';

  const qrLoading = document.getElementById('qrLoading');
  const qrContent = document.getElementById('qrContent');
  const qrFrame   = document.getElementById('qrFrame');
  const qrTimerEl = document.getElementById('qrTimer');

  let qrGenerated = false;
  let countdownId = null;
  let remaining   = 300;   // 5 minutes

  function updateTimer() {
    const t = Math.max(remaining, 0);
    const m = String(Math.floor(t / 60)).padStart(2, '0');
    const s = String(t % 60).padStart(2, '0');
    qrTimerEl.textContent = m + ':' + s;
  }

  function startCountdown() {
    if (countdownId) return;
    remaining = 300;
    updateTimer();
    countdownId = setInterval(function () {
      remaining--;
      updateTimer();
      if (remaining <= 0) {
        clearInterval(countdownId);
        countdownId = null;
      }
    }, 1000);
  }

  accQr.querySelector('.acc-head').addEventListener('click', function () {
    const willOpen = !accQr.classList.contains('open');
    accQr.classList.toggle('open');
    if (willOpen) accUpi.classList.remove('open');

    if (willOpen && !qrGenerated) {
      qrGenerated = true;
      qrLoading.style.display = 'flex';
      qrContent.classList.remove('show');

      setTimeout(function () {
        qrFrame.innerHTML = '<img src="' + QR_IMAGE + '" alt="Payment QR Code">';
        qrLoading.style.display = 'none';
        qrContent.classList.add('show');
        startCountdown();
      }, 1700);
    }
  });

  /* ================= UPI APP TAP -> OPEN APP ================= */
  document.querySelectorAll('.upi-item').forEach(function (item) {
    item.addEventListener('click', function () {
      const app  = item.getAttribute('data-app');
      const base = APP_SCHEMES[app] || GENERIC_UPI;
      selectedApp = app;

      item.style.background = '#eef4ff';
      setTimeout(function () { item.style.background = ''; }, 180);

      window.location.href = buildUpiUrl(base);
    });
  });

  /* ================= BOTTOM CONTINUE -> SAME UPI INTENT ================= */
  document.getElementById('btnPay').addEventListener('click', function () {
    const btn = this;
    const base = selectedApp ? (APP_SCHEMES[selectedApp] || GENERIC_UPI) : GENERIC_UPI;

    const original = btn.textContent;
    btn.textContent = 'Opening…';
    btn.disabled = true;

    setTimeout(function () {
      btn.textContent = original;
      btn.disabled = false;
      window.location.href = buildUpiUrl(base);
    }, 450);
  });

})();