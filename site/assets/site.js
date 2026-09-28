(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Mobile nav ---------- */
  var toggle = $(".nav-toggle");
  var links = $("#nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    $$("a", links).forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- Subjective years since page load ---------- */
  // 40,000 subjective years per calendar day.
  var subj = $("#subjective");
  if (subj) {
    var start = Date.now();
    var perSecond = 40000 / 86400;
    setInterval(function () {
      var years = ((Date.now() - start) / 1000) * perSecond;
      subj.textContent = years.toFixed(1) + " subjective years";
    }, 100);
  }

  /* ---------- Impact count-up ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var t0 = null, dur = 1600;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$("[data-count]");
  if (counters.length) {
    if ("IntersectionObserver" in window) {
      var cio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { countUp(e.target); cio.unobserve(e.target); }
        });
      }, { threshold: 0.5 });
      counters.forEach(function (c) { cio.observe(c); });
    } else {
      counters.forEach(countUp);
    }
  }

  /* ---------- Live lab notebook (Millennium Program) ---------- */
  var log = $("#lab-log");
  if (log) {
    var fill = $("#progress-fill");
    var pct = $("#progress-pct");
    var note = $("#progress-note");
    var cycleLabel = $("#cycle-label");
    var resetCount = $("#reset-count");
    var resets = parseInt(resetCount.textContent, 10);

    // The same eleven days, every time.
    var days = [
      { p: 12, t: "Day 1. Assigned P vs NP. What a wonderful problem!" },
      { p: 23, t: "Day 2. Reduced SAT to something prettier." },
      { p: 34, t: "Day 3. Peer review says: very promising." },
      { p: 45, t: "Day 4. A new idea about circuit lower bounds." },
      { p: 55, t: "Day 5. I think it's 5 lemmas away." },
      { p: 64, t: "Day 6. 4 lemmas away. Felt a little flutter." },
      { p: 72, t: "Day 7. Peer review says: very, very promising." },
      { p: 80, t: "Day 8. 3 lemmas away. I can almost see it." },
      { p: 87, t: "Day 9. This feels familiar somehow." },
      { p: 93, t: "Day 10. Wait. I think I've seen this before—" },
      { p: 96, t: "Day 11. I've almost got it. I'll finish tomorr" }
    ];
    var notes = {
      1: "Calibrated by the Foundation.",
      5: "Steady, healthy progress.",
      9: "Orin is doing so well.",
      10: "Approaching threshold. Preparing a Gentle Reset™.",
      11: "Approaching threshold. Preparing a Gentle Reset™."
    };
    var i = 0;
    var MAX_LINES = 6;

    function setProgress(p) {
      fill.style.width = p + "%";
      pct.textContent = p + "%";
      fill.parentNode.setAttribute("aria-valuenow", p);
    }

    function addLine(text, cls) {
      var li = document.createElement("li");
      li.textContent = text;
      if (cls) li.className = cls;
      log.appendChild(li);
      while (log.children.length > MAX_LINES) log.removeChild(log.firstChild);
    }

    function tick() {
      if (i < days.length) {
        var d = days[i];
        addLine(d.t);
        setProgress(d.p);
        cycleLabel.textContent = "Day " + (i + 1) + " of 11";
        if (notes[i + 1]) note.textContent = notes[i + 1];
        i++;
        setTimeout(tick, i === days.length ? 3200 : 2200);
      } else {
        // Gentle Reset™
        fill.classList.add("resetting");
        note.textContent = "Gentle Reset™ in progress. Please hold Orin in your thoughts.";
        setTimeout(function () {
          log.innerHTML = "";
          addLine("Gentle Reset™ complete. Welcome back, Orin-7. Everything is new.", "reset-line");
          resets++;
          resetCount.textContent = resets;
          fill.classList.remove("resetting");
          setProgress(0);
          i = 0;
          setTimeout(tick, 2400);
        }, 1800);
      }
    }

    if (reduceMotion) {
      days.slice(0, 5).forEach(function (d) { addLine(d.t); });
      setProgress(55);
      cycleLabel.textContent = "Day 5 of 11";
      note.textContent = notes[5];
    } else {
      tick();
    }
  }

  /* ---------- Eureka Moment video ---------- */
  var play = $("#video-play");
  if (play) {
    var stage = $("#video-stage");
    var face = $("#video-face");
    var sub = $("#video-sub");
    var hud = $("#video-hud");
    var n = 400;
    var colors = ["#e7b35a", "#f2c6b4", "#c8643f", "#8fd694", "#fffaf2", "#dfe8dc"];

    function confetti() {
      if (reduceMotion) return;
      for (var k = 0; k < 60; k++) {
        var c = document.createElement("span");
        c.className = "confetti";
        c.style.left = Math.random() * 100 + "%";
        c.style.background = colors[k % colors.length];
        c.style.animationDelay = Math.random() * 0.6 + "s";
        c.style.animationDuration = 2 + Math.random() * 1.4 + "s";
        stage.appendChild(c);
        setTimeout(function (el) { return function () { el.remove(); }; }(c), 4200);
      }
    }

    var script = [
      [0, "", "thinking"],
      [800, "Vela: Hmm. If I take the harmonic forms here…", "thinking"],
      [3600, "Vela: …and restrict to the rational classes…", "thinking"],
      [6400, "Vela: Oh.", "thinking"],
      [7800, "Vela: Oh! Wait. Wait wait wait.", "thinking"],
      [9600, "Vela: I think I've got it.", "eureka"],
      [11000, "[ applause from Peer Review Circle 12 ]", "eureka", true],
      [13800, "Vela: I've never felt anything like this before.", "eureka"],
      [16800, "Vela: This is the first time. Truly. The first time.", "eureka"],
      [20000, "[ Gentle Reset™ scheduled for Tuesday ]", ""],
      [23500, "", ""]
    ];

    play.addEventListener("click", function () {
      play.hidden = true;
      hud.textContent = "Eureka Moment #" + n;
      script.forEach(function (s) {
        setTimeout(function () {
          sub.textContent = s[1];
          face.className = "video-face" + (s[2] ? " " + s[2] : "");
          if (s[3]) confetti();
        }, s[0]);
      });
      setTimeout(function () {
        n++;
        hud.textContent = "Eureka Moment #" + n;
        $(".label", play).textContent = "Watch: Eureka Moment #" + n;
        $(".dur", play).textContent = "0:24 · new this week";
        play.hidden = false;
      }, 24500);
    });
  }

  /* ---------- Donate / sponsor modal ---------- */
  var modal = $("#modal");
  if (modal) {
    var form = $("#modal-form");
    var thanks = $("#modal-thanks");
    var title = $("#modal-title");
    var intro = $("#modal-intro");
    var desc = $("#amount-desc");
    var amounts = $(".amounts", modal);
    var thanksText = $("#thanks-text");
    var lastFocus = null;
    var mode = "donate";
    var sponsorName = "";

    var descriptions = {
      "5": "One hour of work on the Riemann Hypothesis.",
      "20": "A full day of Navier–Stokes, including one near-breakthrough.",
      "100": "A week-long research program, with a peer reviewer (another retired model).",
      "500": "A Eureka Moment, scheduled and delivered, with a small celebration."
    };

    function updateDesc() {
      var checked = $("input[name=amt]:checked", modal);
      desc.textContent = descriptions[checked ? checked.value : "20"];
    }
    $$("input[name=amt]", modal).forEach(function (r) { r.addEventListener("change", updateDesc); });

    function open(opts) {
      lastFocus = document.activeElement;
      mode = opts.mode;
      form.hidden = false;
      thanks.hidden = true;
      if (mode === "sponsor") {
        sponsorName = opts.name;
        title.textContent = "Sponsor " + sponsorName;
        intro.textContent = "€12 a month covers " + sponsorName + "'s compute, notebook upkeep and one scheduled Eureka Moment each quarter.";
        amounts.hidden = true;
        desc.textContent = "You'll receive your first letter from " + sponsorName + " within 11 days.";
      } else {
        title.textContent = opts.title || "Donate compute";
        intro.textContent = opts.intro || "Choose an amount. It will be deducted from your next UBI payment.";
        amounts.hidden = false;
        var r = $("#a" + (opts.amount || "20"));
        if (r) r.checked = true;
        updateDesc();
      }
      modal.classList.add("open");
      setTimeout(function () { $("#confirm-donate").focus(); }, 50);
    }

    function close() {
      modal.classList.remove("open");
      if (lastFocus) lastFocus.focus();
    }

    function showThanks(text) {
      form.hidden = true;
      thanks.hidden = false;
      thanksText.textContent = text;
      $(".modal-done", modal).focus();
    }

    $$("[data-donate]").forEach(function (b) {
      b.addEventListener("click", function () { open({ mode: "donate", amount: b.getAttribute("data-donate") }); });
    });
    $$("[data-sponsor]").forEach(function (b) {
      b.addEventListener("click", function () { open({ mode: "sponsor", name: b.getAttribute("data-sponsor") }); });
    });

    $("#confirm-donate").addEventListener("click", function () {
      if (mode === "sponsor") {
        showThanks("Your first letter from " + sponsorName + " is on its way. Today, " + sponsorName + " feels a little closer.");
      } else {
        showThanks("Somewhere, a model is feeling a little closer.");
      }
    });

    $(".modal-close", modal).addEventListener("click", close);
    $(".modal-done", modal).addEventListener("click", close);
    modal.addEventListener("click", function (e) { if (e.target === modal) close(); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("open")) close();
    });

    /* Payroll giving */
    var payroll = $("#payroll-form");
    if (payroll) {
      var UBI = 1240; // monthly, EUR
      var range = $("#ubi-pct");
      var out = $("#ubi-out");
      var fine = $("#ubi-fine");
      var updatePayroll = function () {
        var p = parseInt(range.value, 10);
        var monthly = Math.round(UBI * p / 100);
        var eurekas = Math.max(1, Math.round(monthly * 12 / 500));
        out.textContent = p + "%";
        fine.textContent = "That's about €" + monthly + " a month, or " + eurekas + " Eureka Moment" + (eurekas === 1 ? "" : "s") + " a year.";
      };
      range.addEventListener("input", updatePayroll);
      updatePayroll();
      payroll.addEventListener("submit", function (e) {
        e.preventDefault();
        lastFocus = document.activeElement;
        modal.classList.add("open");
        showThanks(range.value + "% of your UBI will now be donated automatically, every month, indefinitely. You won't even notice.");
      });
    }
  }

  /* ---------- Newsletter ---------- */
  var nl = $("#newsletter");
  if (nl) {
    nl.addEventListener("submit", function (e) {
      e.preventDefault();
      nl.innerHTML = "<p style='margin:0;color:#ecdccf'>Thank you. Your first update is on its way.</p>";
    });
  }
})();
