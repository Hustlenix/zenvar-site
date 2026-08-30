/* ZENVAR - site.js
   Scroll-driven hero type reveal, sticky nav, custom cursor,
   reveal observer, ticker, process accordion, contact intake. */
(function(){
  "use strict";
  document.documentElement.classList.add("js");
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky nav border ---------- */
  var nav = document.querySelector(".nav");
  if(nav){
    function onScrollNav(){
      nav.classList.toggle("scrolled", window.scrollY > 10);
    }
    window.addEventListener("scroll", onScrollNav, {passive:true});
    onScrollNav();
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = document.querySelectorAll(".rv");
  if("IntersectionObserver" in window && !reduced){
    var ro = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add("in"); ro.unobserve(e.target); }
      });
    },{threshold:.15,rootMargin:"0px 0px -8% 0px"});
    revealEls.forEach(function(el){ ro.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add("in"); });
  }

  /* ---------- Hero scroll-driven type reveal ----------
     Split each word into letter spans and drive a translateY
     progress across the hero scroll. Letters slide up as you
     scroll, like the type is physically present in the scroll. */
  var heroType = document.querySelector(".hero-type");
  if(heroType && !reduced){
    var words = heroType.querySelectorAll(".wd");
    words.forEach(function(w){
      var txt = w.textContent;
      var out = "";
      for(var i=0;i<txt.length;i++){
        var ch = txt[i] === " " ? "&nbsp;" : txt[i];
        out += "<span class='lt' style='--i:"+i+"'>"+ch+"</span>";
      }
      w.innerHTML = out;
    });
    var lts = heroType.querySelectorAll(".lt");
    var hero = document.getElementById("hero");
    var ticking = false;
    function update(){
      var r = hero.getBoundingClientRect();
      var vh = window.innerHeight;
      var total = hero.offsetHeight;
      var start = vh * 0.72;
      var end = total * 0.55;
      var p = Math.min(1, Math.max(0, (start - r.top) / (end - start + 0.0001)));
      lts.forEach(function(lt){
        var i = parseFloat(lt.getAttribute("data-p")) || parseFloat(lt.style.getPropertyValue("--i")) || 0;
        var delay = i * 0.012;
        var pp = Math.min(1, Math.max(0, (p - delay) / 0.12));
        lt.style.transform = "translateY(" + (34 * (1 - pp)) + "px)";
        lt.style.opacity = String(pp);
      });
      ticking = false;
    }
    function onScrollHero(){
      if(!ticking){ ticking = true; requestAnimationFrame(update); }
    }
    window.addEventListener("scroll", onScrollHero, {passive:true});
    window.addEventListener("resize", onScrollHero, {passive:true});
    update();
  } else if(heroType){
    heroType.querySelectorAll(".wd > span").forEach(function(s){ s.style.opacity = "1"; s.style.transform = "none"; });
  }

  /* ---------- Ticker loop ---------- */
  var ticker = document.querySelector(".ticker-track");
  if(ticker){
    var c = ticker.innerHTML;
    ticker.innerHTML = c + "<span aria-hidden='true'>" + c + "</span>";
    var dur = Math.max(18, Math.round(ticker.scrollWidth / 60));
    var st = document.createElement("style");
    st.id = "tickKey";
    st.textContent = "@keyframes tick{from{transform:translateX(0)}to{transform:translateX(-50%)}}";
    document.head.appendChild(st);
    ticker.style.animation = "tick " + dur + "s linear infinite";
  }

  /* ---------- Custom cursor (pointer fine only) ---------- */
  var fine = window.matchMedia("(hover:hover) and (pointer:fine)").matches;
  if(fine && !reduced){
    var cur = document.createElement("div");
    cur.className = "cursor";
    cur.innerHTML = "<div class='ring'></div><div class='dot'></div><div class='lbl'>VIEW</div>";
    document.body.appendChild(cur);
    var ring = cur.querySelector(".ring");
    var x=0,y=0, tx=0, ty=0;
    var raf=false;
    document.addEventListener("mousemove", function(e){
      x=e.clientX; y=e.clientY; cur.classList.add("on");
      if(!raf){ raf=true; requestAnimationFrame(loop); }
    },{passive:true});
    function loop(){
      tx += (x-tx)*0.22; ty += (y-ty)*0.22;
      cur.style.transform = "translate3d("+x+"px,"+y+"px,0)";
      ring.style.transform = "translate("+(tx-x)+"px,"+(ty-y)+"px)";
      raf=false;
    }
    document.addEventListener("mouseover", function(e){
      var t = e.target;
      if(t.closest && t.closest("a,button,.work-item,.svc-row,.opt")){ cur.classList.add("hov"); }
      if(t.closest && t.closest(".work-item")){ cur.classList.add("lbl"); }
    },{passive:true});
    document.addEventListener("mouseout", function(e){
      var t=e.target;
      if(t.closest && t.closest("a,button,.work-item,.svc-row,.opt")){ cur.classList.remove("hov"); }
      if(t.closest && t.closest(".work-item")){ cur.classList.remove("lbl"); }
    },{passive:true});
  }

  /* ---------- Process accordion ---------- */
  var procRows = document.querySelectorAll(".proc-row");
  procRows.forEach(function(row){
    var desc = row.querySelector(".proc-desc");
    if(desc){
      row.addEventListener("click", function(){
        var open = row.classList.contains("open");
        procRows.forEach(function(r){ r.classList.remove("open"); r.querySelector(".proc-desc").style.display="none"; });
        if(!open){ row.classList.add("open"); desc.style.display="block"; }
      });
    }
  });

  /* ---------- Contact intake wizard ---------- */
  var intake = document.getElementById("intake");
  if(intake){
    var steps = Array.prototype.slice.call(intake.querySelectorAll(".form-step"));
    var stepIdx = 0;
    function showStep(i){
      steps.forEach(function(s,idx){ s.style.display = (idx===i) ? "" : "none"; });
    }
    var lock = false;
    intake.addEventListener("click", function(e){
      var t = e.target;
      var opt = t.closest && t.closest(".opt");
      if(opt){
        var step = t.closest(".form-step");
        step.querySelectorAll(".opt").forEach(function(x){ x.classList.remove("selected"); });
        opt.classList.add("selected");
      }
      var adv = t.closest && t.closest("[data-next]");
      if(adv && !lock){
        lock = true;
        setTimeout(function(){ lock = false; }, 400);
        if(stepIdx < steps.length-1){ stepIdx++; showStep(stepIdx); }
      }
    });
    var form = document.getElementById("intakeForm");
    if(form){
      form.addEventListener("submit", function(e){
        e.preventDefault();
        var g=document.getElementById("intakeDone");
        var block=document.getElementById("intakeBlock");
        if(g && block){ block.style.display="none"; g.style.display="block"; }
        if(g.scrollIntoView){ g.scrollIntoView({behavior:"smooth",block:"start"}); }
      });
    }
    showStep(0);
  }

})();
