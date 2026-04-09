const SKILLS_DATA_JSON_URL = document.currentScript
  ? new URL("./skills-data.json", document.currentScript.src).href
  : new URL("./skills-data.json", window.location.href).href;

// ——— WebGL Particle Background ———
(function initWebGL() {
  const canvas = document.getElementById("bgCanvas");
  const gl =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  if (!gl) return;

  function resize() {
    canvas.width = window.innerWidth * devicePixelRatio;
    canvas.height = window.innerHeight * devicePixelRatio;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  resize();
  window.addEventListener("resize", resize);

  const vsSource = `
    attribute vec2 a_position;
    attribute float a_size;
    attribute float a_alpha;
    varying float v_alpha;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      gl_PointSize = a_size;
      v_alpha = a_alpha;
    }
  `;
  const fsSource = `
    precision mediump float;
    varying float v_alpha;
    void main() {
      float d = length(gl_PointCoord - vec2(0.5));
      if (d > 0.5) discard;
      float fade = 1.0 - smoothstep(0.2, 0.5, d);
      gl_FragColor = vec4(0.48, 0.25, 0.89, v_alpha * fade * 0.4);
    }
  `;

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  }
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vsSource));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fsSource));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const COUNT = 120;
  const pos = new Float32Array(COUNT * 2);
  const vel = new Float32Array(COUNT * 2);
  const sizes = new Float32Array(COUNT);
  const alphas = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    pos[i * 2] = Math.random() * 2 - 1;
    pos[i * 2 + 1] = Math.random() * 2 - 1;
    vel[i * 2] = (Math.random() - 0.5) * 0.0004;
    vel[i * 2 + 1] = (Math.random() - 0.5) * 0.0004;
    sizes[i] = Math.random() * 3 + 1;
    alphas[i] = Math.random() * 0.6 + 0.1;
  }

  const posBuf = gl.createBuffer();
  const sizeBuf = gl.createBuffer();
  const alphaBuf = gl.createBuffer();

  const aPos = gl.getAttribLocation(prog, "a_position");
  const aSize = gl.getAttribLocation(prog, "a_size");
  const aAlpha = gl.getAttribLocation(prog, "a_alpha");

  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuf);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aSize);
  gl.vertexAttribPointer(aSize, 1, gl.FLOAT, false, 0, 0);

  gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuf);
  gl.bufferData(gl.ARRAY_BUFFER, alphas, gl.STATIC_DRAW);
  gl.enableVertexAttribArray(aAlpha);
  gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

  function frame() {
    for (let i = 0; i < COUNT; i++) {
      pos[i * 2] += vel[i * 2];
      pos[i * 2 + 1] += vel[i * 2 + 1];
      if (pos[i * 2] < -1 || pos[i * 2] > 1) vel[i * 2] *= -1;
      if (pos[i * 2 + 1] < -1 || pos[i * 2 + 1] > 1) vel[i * 2 + 1] *= -1;
    }
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, pos, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    gl.drawArrays(gl.POINTS, 0, COUNT);
    requestAnimationFrame(frame);
  }
  frame();
})();

// ——— Scroll Reveal ———
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        observer.unobserve(e.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

// ——— Skills Data ———
const GITHUB_TREE_BASE = "https://github.com/moon-labs-dev/skills/tree/main/";

/** Safe GitHub tree URL for a repo-relative skill path (blocks schemes, traversal, absolute paths). */
function githubSkillTreeUrl(skillPath) {
  if (typeof skillPath !== "string" || skillPath.length === 0)
    return GITHUB_TREE_BASE;
  const normalized = skillPath.replace(/\\/g, "/");
  if (normalized.startsWith("/") || normalized.includes(".."))
    return GITHUB_TREE_BASE;
  if (/^[a-zA-Z][a-zA-Z+.-]*:/.test(normalized)) return GITHUB_TREE_BASE;
  return (
    GITHUB_TREE_BASE + normalized.split("/").map(encodeURIComponent).join("/")
  );
}

let SKILLS_DATA = null;
let activeTag = null;
let searchQuery = "";

async function loadSkills() {
  try {
    const res = await fetch(SKILLS_DATA_JSON_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    SKILLS_DATA = await res.json();
    if (!SKILLS_DATA || !Array.isArray(SKILLS_DATA.plugins)) {
      throw new Error("invalid skills-data.json shape");
    }
  } catch (e) {
    console.warn("Could not load skills-data.json, using empty data:", e);
    SKILLS_DATA = { plugins: [] };
  }
  initStats();
  renderTags();
  render();
  // Re-observe plugin groups for scroll reveal
  document
    .querySelectorAll(".plugin-group")
    .forEach((el) => observer.observe(el));
}

function getAllTags() {
  const tags = new Map();
  SKILLS_DATA.plugins.forEach((p) =>
    p.skills.forEach((s) =>
      (s.tags || []).forEach((t) => tags.set(t, (tags.get(t) || 0) + 1)),
    ),
  );
  // Sort by frequency desc, then alpha
  return [...tags.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map((e) => e[0])
    .slice(0, 20); // Top 20 tags
}

function render() {
  const grid = document.getElementById("pluginsGrid");
  grid.replaceChildren();

  let totalVisible = 0;

  SKILLS_DATA.plugins.forEach((plugin, i) => {
    const filtered = plugin.skills.filter((s) => {
      const matchTag = !activeTag || (s.tags || []).includes(activeTag);
      const matchSearch =
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery) ||
        s.description.toLowerCase().includes(searchQuery) ||
        (s.tags || []).some((t) => t.includes(searchQuery)) ||
        plugin.name.toLowerCase().includes(searchQuery);
      return matchTag && matchSearch;
    });

    if (filtered.length === 0) return;
    totalVisible += filtered.length;

    const group = document.createElement("div");
    group.className = "plugin-group reveal";
    group.style.animationDelay = `${i * 0.05}s`;

    const header = document.createElement("div");
    header.className = "plugin-header";
    const pluginName = document.createElement("span");
    pluginName.className = "plugin-name";
    pluginName.textContent = plugin.name ?? "";
    const pluginCount = document.createElement("span");
    pluginCount.className = "plugin-count";
    pluginCount.textContent = String(filtered.length);
    header.append(pluginName, pluginCount);

    const pluginDesc = document.createElement("div");
    pluginDesc.className = "plugin-desc";
    pluginDesc.textContent = plugin.description ?? "";

    const skillsGrid = document.createElement("div");
    skillsGrid.className = "skills-grid";

    filtered.forEach((s) => {
      const card = document.createElement("a");
      card.className = "skill-card";
      card.href = githubSkillTreeUrl(s.path);
      card.target = "_blank";
      card.rel = "noopener noreferrer";
      card.style.textDecoration = "none";
      card.style.color = "inherit";

      const top = document.createElement("div");
      top.className = "skill-card-top";
      const skillName = document.createElement("div");
      skillName.className = "skill-name";
      skillName.textContent = s.name ?? "";
      const skillIcon = document.createElement("div");
      skillIcon.className = "skill-icon";
      skillIcon.textContent = s.icon ?? "";
      top.append(skillName, skillIcon);

      const skillDesc = document.createElement("div");
      skillDesc.className = "skill-desc";
      skillDesc.textContent = s.description ?? "";

      const tagsWrap = document.createElement("div");
      tagsWrap.className = "skill-tags";
      (s.tags || []).forEach((t) => {
        const tagEl = document.createElement("span");
        tagEl.className = "skill-tag";
        tagEl.textContent = t;
        tagsWrap.appendChild(tagEl);
      });

      card.append(top, skillDesc, tagsWrap);
      skillsGrid.appendChild(card);
    });

    group.append(header, pluginDesc, skillsGrid);
    grid.appendChild(group);
    observer.observe(group);
  });

  document.getElementById("totalSkills").textContent = totalVisible;
}

function renderTags() {
  const container = document.getElementById("tagFilters");
  const tags = getAllTags();
  container.replaceChildren();

  const allBtn = document.createElement("button");
  allBtn.type = "button";
  allBtn.className = `tag-btn${!activeTag ? " active" : ""}`;
  allBtn.dataset.tag = "";
  allBtn.textContent = "all";
  container.appendChild(allBtn);

  tags.forEach((t) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `tag-btn${activeTag === t ? " active" : ""}`;
    btn.dataset.tag = t;
    btn.textContent = t;
    container.appendChild(btn);
  });

  container.querySelectorAll(".tag-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      activeTag = btn.dataset.tag || null;
      renderTags();
      render();
    });
  });
}

function initStats() {
  const total = SKILLS_DATA.plugins.reduce((a, p) => a + p.skills.length, 0);
  const plugins = SKILLS_DATA.plugins.length;
  const partners = SKILLS_DATA.plugins.filter(
    (p) => p.name.toLowerCase() !== "moonpay",
  ).length;

  animateNum("skillCount", total);
  animateNum("pluginCount", plugins);
  animateNum("partnerCount", partners);
  document.getElementById("totalSkills").textContent = total;
  document.getElementById("totalPlugins").textContent = plugins;
}

// Animate numbers counting up
function animateNum(id, target) {
  const el = document.getElementById(id);
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const t = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - t, 3); // ease out cubic
    el.textContent = Math.round(ease * target);
    if (t < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// ——— Copy ———
function copyInstall() {
  const text = document.getElementById("installCmd").textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector(".copy-btn");
    btn.innerHTML =
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>';
    setTimeout(() => {
      btn.innerHTML =
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
    }, 1500);
  });
}

// ——— Search ———
document.getElementById("searchInput").addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  render();
});

// ——— Init ———
loadSkills();
