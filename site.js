(function () {
  "use strict";
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- NAV SCROLL STATE ---------- */
  var header = $('header');
  if (header) {
    var navTick = function () { header.classList.toggle('scrolled', scrollY > 10); };
    addEventListener('scroll', navTick, { passive: true });
    navTick();
  }

  /* ---------- REVEAL ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
      });
    }, { threshold: 0.14 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- HERO ENTRANCE ---------- */
  var rises = document.querySelectorAll('.hero .rise, .dial');
  if (rises.length) {
    rises.forEach(function (el, i) {
      requestAnimationFrame(function () {
        setTimeout(function () { el.classList.add('in'); }, 100 + i * 80);
      });
    });
  }

  /* ---------- GROWTH DIAL (home) ---------- */
  var ticksG = $('ticks');
  if (ticksG) {
    var inner = '';
    for (var i = 0; i <= 40; i++) {
      var a = Math.PI * (i / 40) * 1.5 - Math.PI * 0.75;
      var major = (i % 10 === 0);
      var r1 = 128, r2 = major ? 118 : 124;
      var X1 = 160 + r1 * Math.cos(a), Y1 = 160 + r1 * Math.sin(a);
      var X2 = 160 + r2 * Math.cos(a), Y2 = 160 + r2 * Math.sin(a);
      inner += '<line class="tick" x1="' + X1 + '" y1="' + Y1 + '" x2="' + X2 + '" y2="' + Y2 + '"/>';
    }
    ticksG.innerHTML = inner;
  }
  var dialFill = $('dialFill');
  var dialNum = $('dialNum');
  var hero = $('hero');
  if (dialFill && dialNum && hero) {
    var CIRC = 879;
    var lastPct = -1;
    function updateDial() {
      var range = hero.offsetHeight - innerHeight;
      var p = range > 0 ? scrollY / range : 0;
      p = Math.min(1, Math.max(0, p));
      var pct = Math.round(p * 100);
      if (pct !== lastPct) {
        lastPct = pct;
        dialFill.style.strokeDashoffset = (CIRC * (1 - p)).toFixed(1);
        dialNum.textContent = pct;
      }
    }
    addEventListener('scroll', updateDial, { passive: true });
    updateDial();
  }

  /* ---------- INTERACTIVE HOLD (number page) ---------- */
  var hold = $('hold');
  if (hold) {
    var holdNum = $('holdNum');
    var holdBar = $('holdBar');
    var holdNote = $('holdNote');
    var holdVal = 0, holdTarget = 0, raf = null;
    function holdTick() {
      holdVal += (holdTarget - holdVal) * 0.12;
      var n = Math.round(holdVal);
      if (holdNum) holdNum.textContent = n;
      if (holdBar) holdBar.style.width = (holdVal / 200) * 100 + '%';
      if (Math.abs(holdTarget - holdVal) > 0.4) {
        raf = requestAnimationFrame(holdTick);
      } else {
        holdVal = holdTarget; raf = null;
        if (holdNum) holdNum.textContent = Math.round(holdVal);
        if (holdBar) holdBar.style.width = (holdVal / 200) * 100 + '%';
      }
    }
    function startHold(e) {
      if (e && e.preventDefault) e.preventDefault();
      holdTarget = 200;
      if (raf === null) raf = requestAnimationFrame(holdTick);
      if (holdNote) holdNote.textContent = 'Holding... keep the pressure on.';
    }
    function endHold() {
      holdTarget = 0;
      if (raf === null) raf = requestAnimationFrame(holdTick);
      if (holdNote) holdNote.textContent = 'Release, and it eases back. That is the honest way to grow.';
    }
    function setHoldDone() {
      holdTarget = 200; holdVal = 200;
      if (holdNum) holdNum.textContent = '200';
      if (holdBar) holdBar.style.width = '100%';
      if (holdNote) holdNote.textContent = 'Number moved. That is the job.';
    }
    if (reduce) { setHoldDone(); }
    else {
      hold.addEventListener('pointerdown', startHold);
      hold.addEventListener('pointerup', endHold);
      hold.addEventListener('pointercancel', endHold);
      hold.addEventListener('pointerleave', endHold);
      hold.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); startHold(e); }
      });
      hold.addEventListener('keyup', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); endHold(); }
      });
    }
  }

  /* ---------- LEAD FORM (contact page) ---------- */
  var form = $('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('name').value.trim();
      var email = $('email').value.trim();
      var service = $('service').value;
      var msg = $('msg').value.trim();
      var status = $('form-status');
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        status.className = 'err'; status.textContent = 'Please add your name and a valid email.';
        return;
      }
      var subject = encodeURIComponent('Project inquiry from ' + name);
      var body = encodeURIComponent(
        'Name: ' + name + '\nEmail: ' + email + '\nService: ' + service +
        '\n\nWhich number do you want to move?\n' + msg
      );
      window.location.href = 'mailto:hello@zenvar.co?subject=' + subject + '&body=' + body;
      status.className = 'ok';
      status.textContent = 'Opening your email app. Thanks for reaching out.';
    });
  }
})();
