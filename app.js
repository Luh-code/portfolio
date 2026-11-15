// Progressive enhancement: the page is complete without this file.
// Adds type/tag filters (state kept in the URL) and highlights the current year in the nav.
(() => {
  const TYPE_LABELS = {
    work: "Work",
    project: "Projects",
    education: "Education",
    award: "Awards",
    certification: "Certs",
  };

  const entries = [...document.querySelectorAll(".entry")];
  const years = [...document.querySelectorAll(".year")];
  const yearLinks = [...document.querySelectorAll(".years a")];
  const filtersEl = document.getElementById("filters");
  const emptyEl = document.getElementById("empty");

  const tagsOf = (el) => (el.dataset.tags || "").split(/\s+/).filter(Boolean);
  const types = Object.keys(TYPE_LABELS).filter((t) => entries.some((e) => e.dataset.type === t));
  const tags = [...new Set(entries.flatMap(tagsOf))].sort();

  const params = new URLSearchParams(location.search);
  const pick = (v, list) => (list.includes(v) ? v : null);
  const state = { type: pick(params.get("type"), types), tag: pick(params.get("tag"), tags) };

  // ---------- build filter UI ----------
  function chipRow(kind, label, values, text) {
    const row = document.createElement("div");
    row.className = "chip-row";
    row.setAttribute("role", "group");
    row.setAttribute("aria-label", `Filter by ${label.toLowerCase()}`);
    const lab = document.createElement("span");
    lab.className = "chip-label";
    lab.textContent = label;
    row.append(lab);
    for (const v of values) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip";
      b.dataset.kind = kind;
      b.dataset.value = v;
      b.textContent = text(v);
      row.append(b);
    }
    return row;
  }

  const status = document.createElement("div");
  status.className = "status";
  status.innerHTML = '<span id="count" aria-live="polite"></span><button type="button" data-clear hidden>Clear filters</button>';

  filtersEl.append(
    chipRow("type", "Type", types, (v) => TYPE_LABELS[v]),
    chipRow("tag", "Tags", tags, (v) => v),
    status
  );
  filtersEl.hidden = false;

  const countEl = status.querySelector("#count");
  const clearBtn = status.querySelector("[data-clear]");
  const chips = [...filtersEl.querySelectorAll(".chip")];

  // ---------- apply ----------
  function apply({ push = false } = {}) {
    let shown = 0;
    for (const e of entries) {
      const ok = (!state.type || e.dataset.type === state.type) && (!state.tag || tagsOf(e).includes(state.tag));
      e.hidden = !ok;
      if (ok) shown++;
    }
    for (const y of years) y.hidden = !y.querySelector(".entry:not([hidden])");
    for (const a of yearLinks) {
      const target = document.querySelector(a.getAttribute("href"));
      a.parentElement.hidden = !!(target && target.hidden);
    }
    for (const c of chips) {
      c.setAttribute("aria-pressed", String(state[c.dataset.kind] === c.dataset.value));
    }

    const filtered = state.type || state.tag;
    countEl.textContent = filtered ? `${shown} of ${entries.length} entries` : `${entries.length} entries`;
    clearBtn.hidden = !filtered;
    emptyEl.hidden = shown > 0;

    const q = new URLSearchParams();
    if (state.type) q.set("type", state.type);
    if (state.tag) q.set("tag", state.tag);
    const url = `${location.pathname}${q.toString() ? "?" + q : ""}${location.hash}`;
    history[push ? "pushState" : "replaceState"](null, "", url);
  }

  function set(kind, value) {
    state[kind] = state[kind] === value ? null : value;
    apply({ push: true });
  }

  function clear() {
    state.type = state.tag = null;
    apply({ push: true });
  }

  filtersEl.addEventListener("click", (ev) => {
    const chip = ev.target.closest(".chip");
    if (chip) set(chip.dataset.kind, chip.dataset.value);
  });
  document.addEventListener("click", (ev) => {
    if (ev.target.closest("[data-clear]")) return clear();
    const tagLink = ev.target.closest(".tags a");
    if (!tagLink) return;
    ev.preventDefault();
    const v = new URL(tagLink.href).searchParams.get("tag");
    state.tag = v;
    state.type = null;
    apply({ push: true });
    document.getElementById("timeline").scrollIntoView();
  });

  window.addEventListener("popstate", () => {
    const p = new URLSearchParams(location.search);
    state.type = pick(p.get("type"), types);
    state.tag = pick(p.get("tag"), tags);
    apply();
  });

  // A deep link to an entry should never land on something the filter hid.
  function revealHashTarget() {
    if (!location.hash) return;
    const t = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (t && t.closest("[hidden]")) {
      state.type = state.tag = null;
      apply();
      t.scrollIntoView();
    }
  }
  window.addEventListener("hashchange", revealHashTarget);

  apply();
  revealHashTarget();

  // ---------- current year in nav ----------
  if ("IntersectionObserver" in window) {
    const byId = new Map(yearLinks.map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver(
      (items) => {
        for (const it of items) {
          if (!it.isIntersecting) continue;
          yearLinks.forEach((a) => a.removeAttribute("aria-current"));
          byId.get(it.target.id)?.setAttribute("aria-current", "true");
        }
      },
      { rootMargin: "-30% 0px -60% 0px" }
    );
    years.forEach((y) => io.observe(y));
  }
})();
