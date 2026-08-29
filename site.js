(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };

  /* ---------- NAV SCROLL STATE ---------- */
  var header = $('header');
  if (header) {
    var navTick = function () { header.classList.toggle('scrolled', scrollY > 20); };
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
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  /* ---------- ACTIVE NAV LINK (points to viewed section on home) ---------- */
  var navLinks = document.querySelectorAll('.nav-links a[data-scroll]');
  var sections = [];
  navLinks.forEach(function (a) {
    var t = document.querySelector(a.getAttribute('data-scroll'));
    if (t) sections.push({ el: t, link: a });
  });
  if (sections.length && 'IntersectionObserver' in window) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          sections.forEach(function (s) { s.link.classList.toggle('active', s.el === e.target); });
        }
      });
    }, { threshold: 0.3 });
    sections.forEach(function (s) { secIO.observe(s.el); });
  }

  /* ---------- LEAD FORM ---------- */
  var form = $('leadForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('name') ? $('name').value.trim() : '';
      var email = $('email') ? $('email').value.trim() : '';
      var msg = $('msg') ? $('msg').value.trim() : '';
      var status = $('form-status');
      if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        if (status) { status.className = 'form-status err'; status.textContent = 'Add a name and a valid email.'; }
        return;
      }
      var subject = encodeURIComponent('Project inquiry from ' + name);
      var body = encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + msg);
      window.location.href = 'mailto:hello@zenvar.co?subject=' + subject + '&body=' + body;
      if (status) { status.className = 'form-status ok'; status.textContent = 'Opening your email app. Thanks.'; }
    });
  }
})();
