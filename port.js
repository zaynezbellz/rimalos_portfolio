/* ===== 1. Build the spilled-paint drips ===== */
  (function () {
    const svg = document.getElementById("drips");
    const base = 14;                          // how far the paint sags between drips
    // [x position, width, length]  -> edit these to change the drips
    const drips = [
      [90, 84, 70],  [250, 26, 115], [430, 40, 60], [610, 30, 95],
      [790, 36, 125], [960, 26, 70], [1130, 38, 105], [1300, 70, 80]
    ];

    let d = `M0,0 L0,${base}`;
    drips.forEach(([x, w, len]) => {
      const l = x - w / 2, r = x + w / 2, tip = base + len - w / 2;
      d += ` Q${l - 50},${base + 14} ${l - 18},${base + 4}`;               // soft scallop
      d += ` C${l - 2},${base} ${l},${base + 12} ${l + 1},${base + len * 0.5}`;
      d += ` L${l + 2},${tip}`;
      d += ` A${(w - 4) / 2},${(w - 4) / 2} 0 0 0 ${r - 2},${tip}`;         // round drop tip
      d += ` L${r - 1},${base + len * 0.5} C${r},${base + 12} ${r + 2},${base} ${r + 18},${base + 4}`;
    });
    d += ` Q1440,${base + 10} 1440,${base} L1440,0 Z`;

    // main paint shape (same red as the bar so they join seamlessly)
    svg.innerHTML = `<path d="${d}" fill="#f09a0f"/>`;

    // glossy highlights + staggered drip animation
    const path = svg.firstChild;
    path.classList.add("drop");
    path.style.animationDuration = "1.2s";
    drips.forEach(([x, w, len], i) => {
      const hl = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
      hl.setAttribute("cx", x - w * 0.18);
      hl.setAttribute("cy", base + len * 0.45);
      hl.setAttribute("rx", Math.max(2.5, w * 0.1));
      hl.setAttribute("ry", len * 0.28);
      hl.setAttribute("fill", "#FFF8E0");
      hl.setAttribute("opacity", ".35");
      hl.classList.add("drop");
      hl.style.animationDelay = (0.3 + i * 0.05) + "s";
      svg.appendChild(hl);
    });
  })();

/* ===== 2. "Explore My Work" toggles the 4 buttons (only if they exist) ===== */
const explore = document.getElementById("explore");
const menu = document.getElementById("menu");

if (explore && menu) {
  function setMenu(open) {
    explore.setAttribute("aria-expanded", open);
    menu.hidden = !open;
  }
  explore.addEventListener("click", () => {
    setMenu(explore.getAttribute("aria-expanded") !== "true");
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMenu(false);
  });
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });
}




  /* ===== Headline: gradient letters that paste in one by one ===== */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// your palette: Senga Sengana → Mandarin → Daisy Desi → Kiwi Colada → Tropicana
const stops = ["#B30008", "#F57D44", "#FEE08E", "#C1D653", "#769F13"]
  .map(h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)));

function colorAt(t) {
  const s = t * (stops.length - 1);
  const i = Math.min(Math.floor(s), stops.length - 2);
  const f = s - i;
  return "rgb(" + stops[i].map((c, k) => Math.round(c + (stops[i + 1][k] - c) * f)).join(",") + ")";
}
const rand = (min, max) => Math.random() * (max - min) + min;

const h1 = document.getElementById("headline") || document.querySelector("h1");
const headlineText = h1.textContent.trim().replace(/\s+/g, " ");
const totalLetters = headlineText.replace(/ /g, "").length;
h1.setAttribute("aria-label", headlineText);
h1.textContent = "";

let n = 0;
headlineText.split(" ").forEach((w, wi, words) => {
  const word = document.createElement("span");
  word.className = "word";
  word.setAttribute("aria-hidden", "true");

  [...w].forEach(c => {
    const el = document.createElement("span");
    el.className = "ch";
    el.textContent = c;
    el.style.color = colorAt(n / Math.max(1, totalLetters - 1));  // gradient across the whole headline
    el.style.setProperty("--i", n);
    el.style.setProperty("--x", rand(-90, 90) + "px");            // where it flies in from
    el.style.setProperty("--y", rand(-120, -40) + "px");
    el.style.setProperty("--r", rand(-45, 45) + "deg");
    el.style.setProperty("--rest", rand(-4, 4) + "deg");          // crooked resting angle
    el.style.setProperty("--ry", rand(-3, 3) + "px");
    word.appendChild(el);
    n++;
  });

  h1.appendChild(word);
  if (wi < words.length - 1) h1.appendChild(document.createTextNode(" "));
});

/* ===== Paragraph: typing effect (starts after the headline finishes) ===== */
const intro = document.getElementById("intro") || document.querySelector(".hero p");
const introText = intro.textContent.trim();

intro.textContent = introText;
intro.style.minHeight = intro.offsetHeight + "px";   // reserve the space so nothing jumps
intro.textContent = "";

const srCopy = document.createElement("span");
srCopy.className = "sr";
srCopy.textContent = introText;
const typed = document.createElement("span");
typed.setAttribute("aria-hidden", "true");
const caret = document.createElement("span");
caret.className = "caret";
intro.append(srCopy, typed, caret);

if (reduceMotion) {
  typed.textContent = introText;
  caret.remove();
} else {
  const startAfter = 200 + totalLetters * 45 + 650;   // wait for the last letter to land
  setTimeout(() => {
    let k = 0;
    const timer = setInterval(() => {
      typed.textContent = introText.slice(0, ++k);
      if (k >= introText.length) {
        clearInterval(timer);
        setTimeout(() => caret.remove(), 2000);        // caret blinks a bit, then disappears
      }
    }, 28);                                            // typing speed in ms (lower = faster)
  }, startAfter);
}







/* ===== Star divider: fill each row with stars ===== */
document.querySelectorAll(".star-track").forEach(track => {
  const count = parseInt(track.dataset.stars, 10) || 26;
  const group = document.createElement("div");
  group.className = "star-group";
  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.textContent = "✦";
    group.appendChild(s);
  }
  track.appendChild(group);
  track.appendChild(group.cloneNode(true));   // second copy makes the loop seamless
});






/* ===== Navbar: fold the paint drips away once you scroll ===== */
const navbar = document.querySelector(".navbar");
if (navbar) {
  const onScroll = () => navbar.classList.toggle("scrolled", window.scrollY > 40);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}


















/* ===== About Me: scrapbook paste-in on scroll ===== */
(function () {
  const about = document.getElementById("about");
  if (!about) return;

  const rnd = (a, b) => Math.random() * (b - a) + a;
  const colors = ["#B30008", "#F57D44", "#FEE08E", "#C1D653", "#769F13"];
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // random flight path for each piece
  function fly(el, i, sx, ymin, ymax, tilt) {
    el.style.setProperty("--i", i);
    if (!el.style.getPropertyValue("--x")) {
      el.style.setProperty("--x", rnd(-sx, sx) + "px");
      el.style.setProperty("--y", rnd(ymin, ymax) + "px");
    }
    el.style.setProperty("--r", rnd(-45, 45) + "deg");
    el.style.setProperty("--rest", (tilt !== undefined ? tilt : rnd(-3, 3)) + "deg");
  }

  // 1. heading letters
  const title = about.querySelector(".about-title");
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let n = 0;
    text.split(" ").forEach((w, wi, words) => {
      const word = document.createElement("span");
      word.className = "aw";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach(c => {
        const el = document.createElement("span");
        el.className = "al";
        el.textContent = c;
        el.style.color = colors[n % colors.length];
        fly(el, n, 90, -120, -40);
        word.appendChild(el);
        n++;
      });
      title.appendChild(word);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  // 2. letters, photos, film strip, vinyl
  about.querySelectorAll(".scrap").forEach((el, i) => {
    const tilt = el.dataset.tilt !== undefined ? parseFloat(el.dataset.tilt) : undefined;
    fly(el, i, 360, -240, 240, tilt);
  });

  // 3. random float speeds so nothing moves in sync
  about.querySelectorAll(".float").forEach(el => {
    el.style.setProperty("--t", rnd(5.5, 8.5) + "s");
    el.style.setProperty("--dl", -rnd(0, 6) + "s");
  });
  about.querySelectorAll(".deco").forEach(el => {
    el.style.setProperty("--dur", rnd(7, 12) + "s");
    el.style.setProperty("--dl", -rnd(0, 8) + "s");
  });

  // 4. play the paste-in when the section scrolls into view
  about.classList.add("armed");
  if (reduce || !("IntersectionObserver" in window)) {
    about.classList.add("in");
    return;
  }
  const io = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      about.classList.add("in");
      io.disconnect();
    }
  }, { threshold: 0.15 });
  io.observe(about);
})();









/* ===== About Me: paint drips grow while you scroll through the section ===== */
(function () {
  const about = document.getElementById("about");
  const drips = about ? [...about.querySelectorAll(".paint .drip")] : [];
  if (!drips.length) return;

  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let ticking = false;

  function update() {
    ticking = false;
    const r = about.getBoundingClientRect();
    const vh = window.innerHeight;
    if (r.bottom < 0 || r.top > vh) return;           // only works while the About section is on screen

    drips.forEach(d => {
      const k = parseFloat(d.dataset.k);              // how far down the screen this drip reaches
      const max = parseFloat(d.dataset.max);          // longest it can get, as a fraction of the section
      const len = still
        ? r.height * max * 0.4
        : Math.max(0, Math.min((vh * k - r.top) * 0.95, r.height * max));
      d.style.height = len + "px";
      d.style.opacity = len > 4 ? 1 : 0;
    });
  }

  function request() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  window.addEventListener("scroll", request, { passive: true });
  window.addEventListener("resize", request);
  update();
})();









/* ===== About Me: constellations in the background ===== */
(function () {
  const about = document.getElementById("about");
  if (!about) return;
  const NS = "http://www.w3.org/2000/svg";

  // shapes: points on a 0-100 grid, and which points connect
  const shapes = {
    dipper: { p: [[5,30],[22,38],[38,34],[52,44],[56,68],[82,72],[88,46]],
              e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]] },
    w:      { p: [[5,60],[25,25],[50,55],[75,20],[95,50]],
              e: [[0,1],[1,2],[2,3],[3,4]] },
    kite:   { p: [[50,5],[85,40],[60,90],[20,65],[30,30]],
              e: [[0,1],[1,2],[2,3],[3,4],[4,0]] },
    orion:  { p: [[20,10],[75,15],[45,45],[40,52],[50,58],[15,92],[85,88]],
              e: [[0,2],[1,2],[2,3],[3,4],[4,5],[4,6]] },
    fork:   { p: [[10,80],[35,55],[55,60],[80,25],[60,10]],
              e: [[0,1],[1,2],[2,3],[3,4]] }
  };

  // [shape, left %, top %, size in px, rotation in degrees]
  const placements = [
    ["dipper", 3,  3,  240, -8], ["w",     60,  2, 200,  6],
    ["kite",  88, 12,  150, 10], ["orion", 48, 20, 190,  0],
    ["fork",   2, 30,  200,-12], ["dipper", 76, 36, 220, 14],
    ["w",     16, 50,  210,  5], ["kite",  54, 58, 160,-10],
    ["orion", 86, 64,  190,  8], ["fork",   5, 76, 210, 10],
    ["dipper",38, 82,  230, -5], ["w",     74, 86, 200, -8]
  ];
  const colors = ["#B30008", "#769F13", "#F57D44", "#B30008", "#769F13"];
  const rnd = (a, b) => Math.random() * (b - a) + a;

  const wrap = document.createElement("div");
  wrap.className = "cons-bg";
  wrap.setAttribute("aria-hidden", "true");

  placements.forEach(([name, left, top, size, rot], i) => {
    const s = shapes[name];
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 100 100");
    svg.setAttribute("class", "cons");
    svg.style.left = left + "%";
    svg.style.top = top + "%";
    svg.style.setProperty("--s", size);
    svg.style.setProperty("--rot", rot + "deg");
    svg.style.setProperty("--c", colors[i % colors.length]);
    svg.style.setProperty("--dur", rnd(11, 18) + "s");
    svg.style.setProperty("--dl", -rnd(0, 10) + "s");

    s.e.forEach(([a, b], k) => {
      const l = document.createElementNS(NS, "line");
      l.setAttribute("x1", s.p[a][0]); l.setAttribute("y1", s.p[a][1]);
      l.setAttribute("x2", s.p[b][0]); l.setAttribute("y2", s.p[b][1]);
      l.setAttribute("pathLength", "1");
      l.style.setProperty("--ld", (0.2 + k * 0.18).toFixed(2));
      svg.appendChild(l);
    });
    s.p.forEach(([x, y]) => {
      const c = document.createElementNS(NS, "circle");
      c.setAttribute("cx", x); c.setAttribute("cy", y); c.setAttribute("r", 1.7);
      c.style.setProperty("--td", -rnd(0, 3) + "s");
      svg.appendChild(c);
    });
    wrap.appendChild(svg);
  });

  about.prepend(wrap);
})();













/* ===== Pixel divider: scrolling sprites ===== */
(function () {
  const track = document.getElementById("pxTrack");
  if (!track) return;

  const sprites = {
    star:   [".. # ..", "..#..", ".#####.", "#######", ".#####.", "..#.#..", ".#...#."],
    heart:  [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."],
    folder: ["###.....", "########", "#......#", "#......#", "#......#", "########"]
  };
  sprites.star[0] = "...#...";   // keep every row the same width
  sprites.star[1] = "...#...";

  const makeSprite = (rows, color, extra) => {
    const w = rows[0].length, h = rows.length, u = 4;
    let rects = "";
    rows.forEach((row, y) => [...row].forEach((c, x) => {
      if (c === "#") rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }));
    const el = document.createElement("span");
    el.className = "px-item " + (extra || "");
    el.innerHTML = `<svg viewBox="0 0 ${w} ${h}" width="${w * u}" height="${h * u}" shape-rendering="crispEdges" fill="${color}">${rects}</svg>`;
    return el;
  };

  // [type, colour or text]
  const pattern = [
    ["star", "#FEE08E"], ["text", "PROJECTS"], ["heart", "#F57D44"], ["folder", "#C1D653"],
    ["text", "LEVEL 02"], ["star", "#FFF8E0"], ["folder", "#FEE08E"], ["text", "PRESS START"], ["heart", "#B30008"]
  ];

  const group = document.createElement("div");
  group.className = "px-group";
  for (let rep = 0; rep < 2; rep++) {
    pattern.forEach(([type, v]) => {
      if (type === "text") {
        const t = document.createElement("span");
        t.className = "px-item px-text";
        t.textContent = v;
        group.appendChild(t);
      } else {
        group.appendChild(makeSprite(sprites[type], v, type === "star" ? "px-star" : ""));
      }
    });
  }
  track.appendChild(group);
  track.appendChild(group.cloneNode(true));   // second copy = seamless loop
})();


/* ===== Projects: folders + iOS note ===== */
(function () {
  const section = document.getElementById("projects");
  const list = document.getElementById("folderList");
  if (!section || !list) return;

  /* ---------- EDIT YOUR PROJECTS HERE ----------
     folder : "classic" | "pocket" | "manila" | "retro"   (the folder design)
     colors : optional [back colour, front colour]
     image  : your preview picture
     path   : the "directory" text shown above the button
     url    : where "view here" goes                                   */
  const projects = [
    { title: "Shutterbell", category: "Wix Website", folder: "pocket", colors: ["#F57D44", "#FFD7B8"],
      image: "images/shutterbell.png", path: "~/projects/shutterbell", url: "https://zoebellarimalos7.wixsite.com/shutterbell",
      desc: "An e-commerce website made from Wix for the subject E-TECH" },
    { title: "ANIMATION NC-II Portfolio", category: "UI / UX Design", folder: "classic",
      image: "images/portfolio1.png", path: "~/projects/animation-nc-ii-portfolioo", url: "https://zaynezbellz.github.io/aniportfolio/",
      desc: "My first ever portfolio I made with HTML, CSS, and Javascript" },
    { title: "Whack-My-Heart", category: "Game Website", folder: "retro", colors: ["#C1D653", "#FFF8E0"],
      image: "images/whack.png", path: "~/projects/whack-my-heart", url: "https://zaynezbellz.github.io/valentines/",
      desc: " A fun little game website for valentines day." },
    { title: "Fellow Flock", category: "Collaborative Platform", folder: "manila",
      image: "images/fellow.png", path: "~/projects/fellow-flock", url: "https://zoebellarimalos7.wixsite.com/fellowflock-2",
      desc: " A messaging website made from Wix for the subject E-TECH" },
    { title: "Greeting Xmas Card", category: "Carrd Website", folder: "pocket", colors: ["#769F13", "#E4F0B0"],
      image: "images/xmas.png", path: "~/projects/greeting-xmas-card", url: "https://xmastay.carrd.co/",
      desc: "Personal christmas greeting made with Carrd." },
    { title: "The Summit Bite", category: "Online Food Kiosk", folder: "classic", colors: ["#B30008", "#FF7A7F"],
      image: "images/summit.png", path: "~/projects/the-summit-bite", url: "https://alpacas865.wixsite.com/thesummitbite",
      desc: "Online POS food kiosk mainly for huge restaurants." },
    { title: "Personal Website", category: "Carrd Website", folder: "retro", colors: ["#F57D44", "#FEE08E"],
      image: "images/carrd.png", path: "~/projects/tartar", url: "https://zoestarr.carrd.co/",
      desc: "My first ever Carrd website." },



    { title: "Anniversary Website", category: "Carrd Website", folder: "pocket", colors: ["#F57D44", "#FFD7B8"],
      image: "images/anniv.png", path: "~/projects/anniversary-website", url: "https://fortayandnay.carrd.co",
      desc: "Anniversary Carrd greeting for my parent’s 16th anniversary." },

    { title: "Baybayin Video Comic", category: "Video Edits", folder: "retro", colors: ["#C1D653", "#FFF8E0"],
      image: "images/babayin.png", path: "~/projects/baybayin-video-comic", url: "https://drive.google.com/file/d/1ls_Qsl1L1kcU64DAbZDKsgXzRbBMKakd/view",
      desc: "A fun little animation project in collaboration with my cousin who is an artist." },

    { title: "TV Broadcasting Opening Billboard", category: "Video Edits", folder: "pocket", colors: ["#769F13", "#E4F0B0"],
      image: "images/obb.png", path: "~/projects/tvbroadfiles", url: "https://drive.google.com/file/d/11wgISycPMZxKhSPGnnrguj5yh2v-kOO7/view?usp=sharing",
      desc: "A video edit for a journalism extracurricular ." },

    { title: "Hallway Echoes: May", category: "Video Edits", folder: "retro", colors: ["#F57D44", "#FEE08E"],
      image: "images/may.png", path: "~/projects/hallway-echoes", url: "https://www.facebook.com/share/v/1ACdZhNdPS/",
      desc: " A video edit for a journalism extracurricular." },

    { title: "Doodle Jump", category: "Game Website", folder: "classic",
      image: "images/doodle.png", path: "~/projects/doodlezzz", url: " https://zaynezbellz.github.io/doodlejump/",
      desc: " My first ever website with javascript integration." },

    { title: "Cozy Constellations", category: "Point-Of-Sale Website", folder: "manila",
      image: "images/pos.png", path: "~/projects/cozy-constellations", url: "https://zaynezbellz.github.io/cozyconstellations/",
      desc: "A cute and cozy food POS kiosk." },

    { title: "Rock Paper Scissors!", category: "Game Website", folder: "classic", colors: ["#B30008", "#FF7A7F"],
      image: "images/rock.png", path: "~/projects/rock-paper-scissors", url: "https://zaynezbellz.github.io/rockscissorpaper/",
      desc: "A fun website with javascript integrations." },

    { title: "Starbound Books", category: "Php and Sql Website", folder: "pocket", colors: ["#F57D44", "#FFD7B8"],
      image: "images/starbound.png", path: "~/projects/starbound-books", url: "https://ztar.iceiy.com/index.html",
      desc: "A simple library management system built with PHP and SQL" },

    { title: "Library System", category: "Php and Sql Website", folder: "pocket", colors: ["#769F13", "#E4F0B0"],
      image: "images/lib.png", path: "~/projects/library-system", url: " https://cplibrarysystem.zya.me/",
      desc: "A simple library management system built with PHP and SQL." }
  ];

  list.innerHTML = projects.map((p, i) => `
    <button class="folder f-${p.folder || "classic"}" type="button" data-i="${i}" aria-pressed="false"
      style="--i:${i};${p.colors ? `--c1:${p.colors[0]};--c2:${p.colors[1]}` : ""}">
      <span class="fshape" aria-hidden="true"><i class="back"></i><i class="front"></i></span>
      <span class="fname">${p.title}</span>
    </button>`).join("");

  const folders = [...list.querySelectorAll(".folder")];
  const note = document.getElementById("note");
  const $ = id => document.getElementById(id);
  const img = $("nImg");
  const horizontal = () => window.matchMedia("(max-width: 800px)").matches;
  let current = -1;

  img.addEventListener("error", () => { img.style.visibility = "hidden"; });
  img.addEventListener("load",  () => { img.style.visibility = "visible"; });

  function keepInView(f) {                       // scrolls only the folder list, never the page
    if (horizontal()) {
      if (f.offsetLeft < list.scrollLeft) list.scrollTo({ left: f.offsetLeft - 8, behavior: "smooth" });
      else if (f.offsetLeft + f.offsetWidth > list.scrollLeft + list.clientWidth)
        list.scrollTo({ left: f.offsetLeft + f.offsetWidth - list.clientWidth + 8, behavior: "smooth" });
    } else {
      if (f.offsetTop < list.scrollTop) list.scrollTo({ top: f.offsetTop - 8, behavior: "smooth" });
      else if (f.offsetTop + f.offsetHeight > list.scrollTop + list.clientHeight)
        list.scrollTo({ top: f.offsetTop + f.offsetHeight - list.clientHeight + 8, behavior: "smooth" });
    }
  }

  function select(i, focus) {
    if (i < 0 || i >= projects.length || i === current) return;
    current = i;
    const p = projects[i];

    folders.forEach((f, k) => {
      f.classList.toggle("on", k === i);
      f.setAttribute("aria-pressed", k === i);
    });

    $("nTitle").textContent = p.title;
    $("nCat").textContent = p.category;
    $("nDesc").textContent = p.desc;
    $("nPath").textContent = p.path;
    $("nLink").href = p.url;
    $("nLink").setAttribute("aria-label", "View " + p.title + " (opens in a new tab)");
    img.alt = p.title + " preview";
    img.style.visibility = "visible";
    img.src = p.image;

    note.classList.remove("swap");
    void note.offsetWidth;                       // restart the slide-in
    note.classList.add("swap");

    keepInView(folders[i]);
    if (focus) folders[i].focus({ preventScroll: true });
  }

  folders.forEach((f, i) => f.addEventListener("click", () => select(i)));

  // arrow keys move through the folders
  list.addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") { e.preventDefault(); select(Math.min(current + 1, projects.length - 1), true); }
    if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  { e.preventDefault(); select(Math.max(current - 1, 0), true); }
  });

  // up / down arrow buttons
  const up = $("folderUp"), down = $("folderDown");
  function nudge(dir) {
    const h = horizontal();
    list.scrollBy({ [h ? "left" : "top"]: dir * (h ? list.clientWidth : list.clientHeight) * 0.6, behavior: "smooth" });
  }
  function updateArrows() {
    const h = horizontal();
    const pos = h ? list.scrollLeft : list.scrollTop;
    const max = h ? list.scrollWidth - list.clientWidth : list.scrollHeight - list.clientHeight;
    up.disabled = pos <= 2;
    down.disabled = pos >= max - 2;
  }
  up.addEventListener("click", () => nudge(-1));
  down.addEventListener("click", () => nudge(1));
  list.addEventListener("scroll", updateArrows, { passive: true });
  window.addEventListener("resize", updateArrows);

  select(0);
  updateArrows();

  // folders pop in on scroll
  section.classList.add("armed");
  if (!("IntersectionObserver" in window)) { section.classList.add("in"); return; }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { section.classList.add("in"); io.disconnect(); }
  }, { threshold: 0.15 });
  io.observe(section);
})();










/* ===== Projects: scrapbook title + fade-in ===== */
(function () {
  const section = document.getElementById("projects");
  if (!section) return;

  const rnd = (a, b) => Math.random() * (b - a) + a;
  const colors = ["#B30008", "#F57D44", "#FEE08E", "#C1D653", "#769F13"];

  // 1. title letters
  const title = section.querySelector(".proj-title");
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let n = 0;
    text.split(" ").forEach((w, wi, words) => {
      const word = document.createElement("span");
      word.className = "aw";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach(c => {
        const el = document.createElement("span");
        el.className = "al";
        el.textContent = c;
        el.style.color = colors[n % colors.length];
        el.style.setProperty("--i", n);
        el.style.setProperty("--x", rnd(-90, 90) + "px");
        el.style.setProperty("--y", rnd(-120, -40) + "px");
        el.style.setProperty("--r", rnd(-45, 45) + "deg");
        el.style.setProperty("--rest", rnd(-3, 3) + "deg");
        word.appendChild(el);
        n++;
      });
      title.appendChild(word);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  // 2. fade-in order (delay in milliseconds)
  [
    [".proj-sub", 650],
    [".arrow",    800],
    [".walk-v",   750],
    [".note",     950]
  ].forEach(([selector, delay]) => {
    section.querySelectorAll(selector).forEach(el => {
      el.classList.add("fade");
      el.style.setProperty("--d", delay);
    });
  });
})();












/* ===== Walking bar follows the FOLDER LIST (not the page) ===== */
(function () {
  const bar  = document.getElementById("walkV");
  const list = document.getElementById("folderList");
  if (!bar || !list) return;

  const sprite = bar.querySelector(".sprite");
  const horizontal = () => window.matchMedia("(max-width: 800px)").matches;
  const pos = () => horizontal() ? list.scrollLeft : list.scrollTop;

  let last = pos(), idle;

  function update() {
    const max = horizontal()
      ? list.scrollWidth - list.clientWidth
      : list.scrollHeight - list.clientHeight;
    const p = max > 2 ? pos() / max : 0;                 // 0 = first folder, 1 = last folder
    bar.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
  }

  function onListScroll() {
    const now = pos();
    if (now !== last) sprite.classList.toggle("back", now < last);   // face the direction of travel
    last = now;

    update();
    bar.classList.add("walking");                        // legs move only while the folders move
    clearTimeout(idle);
    idle = setTimeout(() => bar.classList.remove("walking"), 150);
  }

  list.addEventListener("scroll", onListScroll, { passive: true });
  window.addEventListener("resize", update);
  window.addEventListener("load", update);
  setTimeout(update, 300);                               // after the folders have been created
  update();
})();











/* ===== Lace divider: draws the lace + floats the faces ===== */
(function () {
  const root = document.getElementById("lace");
  if (!root) return;

  // lace colours: change these to restyle the whole divider
  const LINE = "#5B7FD6";   // main blue
  const FILL = "#F4F8FF";   // lace fill
  const SOFT = "#B9CBF5";   // light blue details
  root.style.setProperty("--lace-blue", LINE);

  const svgUrl = (w, h, body) =>
    `url("data:image/svg+xml,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}'>${body}</svg>`
    )}")`;

  const arc = (r, extra) =>
    `<path d='M${60 - r} 0A${r} ${r} 0 0 0 ${60 + r} 0' fill='none' stroke='${LINE}' stroke-width='2' ${extra || ""}/>`;

  // medallion tile (one round crochet flower, repeats)
  const medallion =
    `<path d='M0 1H120' stroke='${LINE}' stroke-width='2'/>` +
    `<path d='M6 0A54 54 0 0 0 114 0Z' fill='${FILL}'/>` +
    `<path d='M60 0V54M60 0L33 47M60 0L87 47M60 0L13 27M60 0L107 27' stroke='${SOFT}' stroke-width='1.6' fill='none'/>` +
    arc(54) + arc(44, "stroke-dasharray='1 5' stroke-linecap='round'") + arc(34) + arc(24) +
    `<path d='M46 0A14 14 0 0 0 74 0Z' fill='${LINE}'/>`;

  // fluffy scallop tile
  const fluff =
    `<path d='M0 0A30 30 0 0 0 60 0Z' fill='${FILL}' stroke='${LINE}' stroke-width='2'/>` +
    `<path d='M9 0A21 21 0 0 0 51 0' fill='none' stroke='${LINE}' stroke-width='2' stroke-dasharray='1 5' stroke-linecap='round'/>` +
    `<circle cx='30' cy='15' r='3' fill='${SOFT}'/>`;

  root.style.setProperty("--lace-med", svgUrl(120, 58, medallion));
  root.style.setProperty("--lace-fluff", svgUrl(60, 34, fluff));

  // floating faces
  const faces = ["•ᴗ•", "ᵔ ᵕ ᵔ", "•⩊•", "•̀ω•́ ✧"];
  const colors = [LINE, "#89CFF0", "#8A9CE8", "#B30008"];
  const box = document.getElementById("laceFaces");
  const rnd = (a, b) => Math.random() * (b - a) + a;
  const count = Math.max(8, Math.min(16, Math.round(window.innerWidth / 85)));

  for (let i = 0; i < count; i++) {
    const s = document.createElement("span");
    s.className = "face";
    s.textContent = faces[i % faces.length];
    s.style.left = ((i + rnd(.1, .9)) / count * 100) + "%";   // spread evenly, with a little randomness
    s.style.top  = rnd(0, 70) + "%";
    s.style.setProperty("--c", colors[i % colors.length]);
    s.style.setProperty("--fs", rnd(1.1, 1.8) + "rem");
    s.style.setProperty("--dx", rnd(-20, 20) + "px");
    s.style.setProperty("--dur", rnd(6, 11) + "s");
    s.style.setProperty("--dl", -rnd(0, 8) + "s");
    box.appendChild(s);
  }
})();















/* ===== Education: scrapbook title, entrance order, wind gusts ===== */
(function () {
  const sec = document.getElementById("education");
  if (!sec) return;

  const rnd = (a, b) => Math.random() * (b - a) + a;
  const colors = ["#B30008", "#F57D44", "#FEE08E", "#C1D653", "#769F13"];

  // 1. title letters (same paste-in as the other headings)
  const title = sec.querySelector(".edu-title");
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let n = 0;
    text.split(" ").forEach((w, wi, words) => {
      const word = document.createElement("span");
      word.className = "aw";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach(c => {
        const el = document.createElement("span");
        el.className = "al";
        el.textContent = c;
        el.style.color = colors[n % colors.length];
        el.style.setProperty("--i", n);
        el.style.setProperty("--x", rnd(-90, 90) + "px");
        el.style.setProperty("--y", rnd(-120, -40) + "px");
        el.style.setProperty("--r", rnd(-45, 45) + "deg");
        el.style.setProperty("--rest", rnd(-3, 3) + "deg");
        word.appendChild(el);
        n++;
      });
      title.appendChild(word);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  // 2. subtitle fades in after the title
  const sub = sec.querySelector(".edu-sub");
  if (sub) { sub.classList.add("fx-fade"); sub.style.setProperty("--d", 600); }

  // 3. board items appear one after another, after the frame
  const board = sec.querySelector(".edu-board");
  const items = [...sec.querySelectorAll(".edu-board .item")];
  items.forEach((el, i) => el.style.setProperty("--d", 800 + i * 140));

  // 4. the wind: each item's gust starts a little later than the one to its left
  function windDelays() {
    if (!board) return;
    const b = board.getBoundingClientRect();
    items.forEach(el => {
      const r = el.getBoundingClientRect();
      const f = Math.min(1, Math.max(0, (r.left + r.width / 2 - b.left) / b.width));
      const w = el.querySelector(".wind");
      if (w) w.style.setProperty("--gd", (f * 2.4).toFixed(2) + "s");
    });
  }
  windDelays();
  window.addEventListener("load", windDelays);
  let t;
  window.addEventListener("resize", () => { clearTimeout(t); t = setTimeout(windDelays, 200); });

  // 5. start everything when the section scrolls into view
  sec.classList.add("armed");
  if (!("IntersectionObserver" in window)) { sec.classList.add("in"); return; }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { sec.classList.add("in"); io.disconnect(); }
  }, { threshold: 0.15 });
  io.observe(sec);
})();















/* ===== Contact: movie premiere ===== */
(function () {
  const sec = document.getElementById("contact");
  if (!sec) return;
  const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const rnd = (a, b) => Math.random() * (b - a) + a;
  const colors = ["#B30008", "#F57D44", "#FEE08E", "#C1D653", "#769F13"];

  // 1. title letters (same paste-in as your other headings)
  const title = sec.querySelector(".contact-title");
  if (title) {
    const text = title.textContent.trim();
    title.setAttribute("aria-label", text);
    title.textContent = "";
    let n = 0;
    text.split(" ").forEach((w, wi, words) => {
      const word = document.createElement("span");
      word.className = "aw";
      word.setAttribute("aria-hidden", "true");
      [...w].forEach(c => {
        const el = document.createElement("span");
        el.className = "al";
        el.textContent = c;
        el.style.color = colors[n % colors.length];
        el.style.setProperty("--i", n);
        el.style.setProperty("--x", rnd(-90, 90) + "px");
        el.style.setProperty("--y", rnd(-120, -40) + "px");
        el.style.setProperty("--r", rnd(-45, 45) + "deg");
        el.style.setProperty("--rest", rnd(-3, 3) + "deg");
        word.appendChild(el);
        n++;
      });
      title.appendChild(word);
      if (wi < words.length - 1) title.appendChild(document.createTextNode(" "));
    });
  }

  // 2. entrance order: [selector, "fade" or "pop", delay in ms]
  [
    [".contact-sub", "fade", 650],
    [".ticket-wrap", "pop",  850],
    [".clap-intro",  "fade", 1200],
    [".clapper",     "fade", 1350],
    [".credits",     "fade", 1550]
  ].forEach(([sel, kind, d]) => {
    const el = sec.querySelector(sel);
    if (!el) return;
    el.classList.add(kind === "pop" ? "ct-pop" : "ct-fade");
    el.style.setProperty("--d", d);
  });

  // 3. flowing stars + shooting stars (colours chosen to show on cream)
  const sky = document.getElementById("cStars");
  if (sky) {
    const glyphs = ["✦", "✧", "✦", "⋆"];
    const tones = ["#B30008", "#F57D44", "#769F13", "#E6B340"];
    const count = window.innerWidth < 800 ? 24 : 42;
    for (let i = 0; i < count; i++) {
      const s = document.createElement("span");
      s.className = "cstar";
      s.textContent = glyphs[i % glyphs.length];
      s.style.left = rnd(1, 97) + "%";
      s.style.top = rnd(1, 94) + "%";
      s.style.setProperty("--c", tones[i % tones.length]);
      s.style.setProperty("--fs", rnd(.8, 1.9) + "rem");
      s.style.setProperty("--tw", rnd(2.4, 4.4) + "s");
      s.style.setProperty("--dur", rnd(9, 16) + "s");
      s.style.setProperty("--dx", rnd(-18, 18) + "px");
      s.style.setProperty("--dl", -rnd(0, 10) + "s");
      sky.appendChild(s);
    }
    for (let i = 0; i < 2; i++) {
      const s = document.createElement("span");
      s.className = "ct-shoot";
      s.style.top = (8 + i * 30) + "%";
      s.style.left = (8 + i * 34) + "%";
      s.style.animationDelay = (i * 2.8) + "s";
      sky.appendChild(s);
    }
  }

  // 4. clapperboard: clap, then open the email app
  const form = document.getElementById("clapForm");
  if (form) {
    const take = document.getElementById("takeNo");
    const btn = form.querySelector(".action");
    form.addEventListener("submit", e => {
      e.preventDefault();
      const name = form.elements.name.value.trim();
      const msg = form.elements.msg.value.trim();

      btn.textContent = "Rolling… ✦";
      form.classList.remove("clap");
      void form.offsetWidth;                         // restart the animation
      form.classList.add("clap");

      const href = "mailto:" + form.dataset.to +
        "?subject=" + encodeURIComponent("Hello from " + name) +
        "&body=" + encodeURIComponent(msg + "\n\n- " + name);
      setTimeout(() => { window.location.href = href; }, still ? 0 : 750);

      setTimeout(() => {                             // reset for the next take
        form.classList.remove("clap");
        btn.textContent = "Action! ✦";
        if (take) take.textContent = (parseInt(take.textContent, 10) || 1) + 1;
      }, 2200);
    });
  }

  // 5. "Play again" goes back to the top
  const again = document.getElementById("playAgain");
  if (again) again.addEventListener("click", () => window.scrollTo({ top: 0, behavior: still ? "auto" : "smooth" }));

  // 6. start the animations when the section scrolls into view
  sec.classList.add("armed");
  if (!("IntersectionObserver" in window)) { sec.classList.add("in"); return; }
  const io = new IntersectionObserver(([en]) => {
    if (en.isIntersecting) { sec.classList.add("in"); io.disconnect(); }
  }, { threshold: 0.12 });
  io.observe(sec);
})();




const bgMusic = new Audio('bgmusic/music.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.2;

window.addEventListener('DOMContentLoaded', () => {
  // 1. Attempt to play immediately on load
  bgMusic.play().catch(() => {
    // 2. If blocked by the browser, wait for the first user interaction
    const startAudioOnInteraction = () => {
      bgMusic.play();
      // Remove listeners once the music starts
      document.removeEventListener('click', startAudioOnInteraction);
      document.removeEventListener('keydown', startAudioOnInteraction);
    };

    document.addEventListener('click', startAudioOnInteraction);
    document.addEventListener('keydown', startAudioOnInteraction);
  });
});
