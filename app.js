/* =========================================================================
   QuickBite SQL Lab — application logic
   - boots sql.js (SQLite WASM) from CDN
   - every "Run" rebuilds the DB from SEED_SQL (deterministic, DML-safe)
   - renders lessons from LESSONS, with runnable examples + checked exercises
   - CodeMirror editors with a plain-textarea fallback
   ========================================================================= */
(function () {
  "use strict";

  var SQL = null;          // sql.js module
  var bootOk = false;

  // ----- small DOM helpers -----
  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    if (html != null) n.innerHTML = html;
    return n;
  }
  function $(sel) { return document.querySelector(sel); }

  // ----- flatten lessons for routing / prev-next -----
  var FLAT = [];
  LESSONS.forEach(function (mod) {
    mod.lessons.forEach(function (les) {
      FLAT.push({ moduleId: mod.id, moduleTitle: mod.title, lessonId: les.id, lesson: les });
    });
  });

  // =======================================================================
  // SQL engine
  // =======================================================================
  function freshDb() {
    var db = new SQL.Database();
    db.run(SEED_SQL);
    return db;
  }

  // Run arbitrary SQL on a fresh DB. Returns { results, error }.
  function runSQL(sql) {
    var db;
    try {
      db = freshDb();
      var results = db.exec(sql); // array of { columns, values }
      return { results: results, error: null };
    } catch (e) {
      return { results: null, error: String((e && e.message) || e) };
    } finally {
      if (db) db.close();
    }
  }

  // =======================================================================
  // Result comparison (for exercise checking)
  // =======================================================================
  var NULL_TOKEN = "\u0000NULL\u0000";
  function cellKey(v) {
    if (v === null || v === undefined) return NULL_TOKEN;
    if (typeof v === "number") {
      // kill floating-point jitter, drop trailing zeros
      var r = Math.round(v * 10000) / 10000;
      return String(r);
    }
    return String(v);
  }
  function rowKey(row) { return row.map(cellKey).join("\u0001"); }

  function lastSet(results) {
    if (!results || results.length === 0) return { columns: [], values: [] };
    return results[results.length - 1];
  }

  function resultsMatch(userSet, solSet, orderMatters) {
    if (userSet.columns.length !== solSet.columns.length) return false;
    var u = userSet.values.map(rowKey);
    var s = solSet.values.map(rowKey);
    if (u.length !== s.length) return false;
    if (orderMatters) {
      for (var i = 0; i < u.length; i++) if (u[i] !== s[i]) return false;
      return true;
    }
    var su = u.slice().sort();
    var ss = s.slice().sort();
    for (var j = 0; j < su.length; j++) if (su[j] !== ss[j]) return false;
    return true;
  }

  // =======================================================================
  // Rendering a result set into a table
  // =======================================================================
  var MAX_ROWS = 300;
  function renderResult(container, result) {
    container.innerHTML = "";

    if (result.error) {
      container.appendChild(el("div", { class: "verdict error" },
        iconWarn() + "<span>SQL error <span class='verdict-sub'>— check the message below</span></span>"));
      container.appendChild(el("div", { class: "result-error" }, escapeHtml(result.error)));
      return;
    }

    var set = lastSet(result.results);
    if (!set.columns || set.columns.length === 0) {
      container.appendChild(el("div", { class: "result-empty" },
        "Statement ran successfully. It didn't return a table to display (for example an INSERT/UPDATE/DELETE on its own)."));
      return;
    }

    var n = set.values.length;
    container.appendChild(el("div", { class: "result-meta" },
      n + (n === 1 ? " row" : " rows") + (n > MAX_ROWS ? " (showing first " + MAX_ROWS + ")" : "")));

    var scroll = el("div", { class: "table-scroll" });
    var table = el("table", { class: "result" });

    var thead = el("thead");
    var htr = el("tr");
    set.columns.forEach(function (c) { htr.appendChild(el("th", null, escapeHtml(c))); });
    thead.appendChild(htr);
    table.appendChild(thead);

    var tbody = el("tbody");
    var rows = set.values.slice(0, MAX_ROWS);
    rows.forEach(function (row) {
      var tr = el("tr");
      row.forEach(function (v) {
        if (v === null || v === undefined) {
          tr.appendChild(el("td", { class: "null-cell" }, "NULL"));
        } else {
          tr.appendChild(el("td", null, escapeHtml(String(v))));
        }
      });
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    scroll.appendChild(table);
    container.appendChild(scroll);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
    });
  }

  // =======================================================================
  // Editors (CodeMirror with textarea fallback)
  // =======================================================================
  function makeEditor(host, initial, onRun) {
    var ta = el("textarea", { spellcheck: "false" });
    ta.value = initial || "";
    host.appendChild(ta);

    var api;
    if (window.CodeMirror) {
      var cm = window.CodeMirror.fromTextArea(ta, {
        mode: "text/x-sql",
        lineNumbers: true,
        lineWrapping: true,
        smartIndent: false,
        viewportMargin: Infinity,
        extraKeys: {
          "Ctrl-Enter": function () { onRun(); },
          "Cmd-Enter": function () { onRun(); }
        }
      });
      api = {
        getValue: function () { return cm.getValue(); },
        setValue: function (v) { cm.setValue(v); },
        focus: function () { cm.focus(); }
      };
    } else {
      ta.addEventListener("keydown", function (e) {
        if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); onRun(); }
      });
      api = {
        getValue: function () { return ta.value; },
        setValue: function (v) { ta.value = v; },
        focus: function () { ta.focus(); }
      };
    }
    return api;
  }

  // =======================================================================
  // Building example + exercise blocks
  // =======================================================================
  function buildExample(ex) {
    var block = el("div", { class: "qblock" });

    var head = el("div", { class: "qblock-head" });
    head.appendChild(el("span", { class: "qblock-tag example" }, "Example"));
    head.appendChild(el("span", { class: "qblock-label" }, escapeHtml(ex.label)));
    block.appendChild(head);

    var editorWrap = el("div", { class: "editor-wrap" });
    block.appendChild(editorWrap);

    if (ex.note) {
      block.appendChild(el("div",
        { class: "result-meta", style: "border-bottom:none;background:#fff" },
        "💡 " + escapeHtml(ex.note)));
    }

    var result = el("div", { class: "qblock-result" });

    var actions = el("div", { class: "qblock-actions" });
    var runBtn = el("button", { class: "btn btn-run" }, iconPlay() + "Run");
    actions.appendChild(runBtn);
    actions.appendChild(el("span", { class: "kbd-hint" }, "<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>"));
    block.appendChild(actions);
    block.appendChild(result);

    var editor;
    function run() { renderResult(result, runSQL(editor.getValue())); }
    editor = makeEditor(editorWrap, ex.sql, run);
    runBtn.addEventListener("click", run);

    return block;
  }

  function buildExercise(exr, index) {
    var block = el("div", { class: "qblock" });

    var head = el("div", { class: "qblock-head" });
    head.appendChild(el("span", { class: "qblock-tag exercise" }, "Your turn"));
    head.appendChild(el("span", { class: "qblock-label" }, "Exercise " + index));
    block.appendChild(head);

    block.appendChild(el("div", { class: "qblock-prompt" }, escapeHtml(exr.prompt)));

    var editorWrap = el("div", { class: "editor-wrap" });
    block.appendChild(editorWrap);

    var result = el("div", { class: "qblock-result" });

    var actions = el("div", { class: "qblock-actions" });
    var runBtn = el("button", { class: "btn btn-run" }, iconPlay() + "Run &amp; check");
    var solBtn = el("button", { class: "btn btn-ghost" }, "Show solution");
    actions.appendChild(runBtn);
    actions.appendChild(solBtn);
    actions.appendChild(el("span", { class: "kbd-hint" }, "<kbd>Ctrl</kbd>/<kbd>⌘</kbd> + <kbd>Enter</kbd>"));
    block.appendChild(actions);
    block.appendChild(result);

    // solution (hidden until toggled)
    var solWrap = el("div", { class: "solution-box", style: "display:none" });
    var solInner = "";
    if (exr.hint) solInner += "<div style='font-size:13px;color:var(--muted);margin-bottom:6px'><b>Hint:</b> " + escapeHtml(exr.hint) + "</div>";
    solInner += "<div style='font-size:12.5px;color:var(--muted)'>One correct answer:</div>";
    solWrap.innerHTML = solInner;
    solWrap.appendChild(el("pre", null, escapeHtml(exr.solution)));
    block.appendChild(solWrap);

    var editor;
    function check() {
      var userSql = editor.getValue();
      if (!userSql.trim()) { editor.focus(); return; }
      var userRun = runSQL(userSql);
      // show the user's result table first
      renderResult(result, userRun);
      if (userRun.error) return; // verdict already shown by renderResult

      var solRun = runSQL(exr.solution);
      var match = !solRun.error &&
        resultsMatch(lastSet(userRun.results), lastSet(solRun.results), !!exr.orderMatters);

      var verdict;
      if (match) {
        verdict = el("div", { class: "verdict correct" },
          iconCheck() + "<span>Correct! <span class='verdict-sub'>your result matches the expected answer.</span></span>");
      } else {
        var sub = exr.orderMatters
          ? "rows or their order don't match the expected answer yet."
          : "the rows don't match the expected answer yet.";
        verdict = el("div", { class: "verdict incorrect" },
          iconX() + "<span>Not quite <span class='verdict-sub'>— " + sub + " Tweak your query and run again, or reveal the solution.</span></span>");
      }
      result.insertBefore(verdict, result.firstChild);
    }

    editor = makeEditor(editorWrap, "-- write your query here\n", check);
    runBtn.addEventListener("click", check);
    solBtn.addEventListener("click", function () {
      var showing = solWrap.style.display !== "none";
      solWrap.style.display = showing ? "none" : "block";
      solBtn.textContent = showing ? "Show solution" : "Hide solution";
    });

    return block;
  }

  // =======================================================================
  // Lesson rendering + routing
  // =======================================================================
  function currentIndex() {
    var hash = location.hash.replace(/^#/, "");
    var parts = hash.split("/");
    if (parts.length === 2) {
      for (var i = 0; i < FLAT.length; i++) {
        if (FLAT[i].moduleId === parts[0] && FLAT[i].lessonId === parts[1]) return i;
      }
    }
    return 0;
  }

  function renderLesson(idx) {
    var entry = FLAT[idx];
    var les = entry.lesson;
    var main = $("#main");
    main.innerHTML = "";

    main.appendChild(el("div", { class: "lesson-eyebrow" }, escapeHtml(entry.moduleTitle)));
    main.appendChild(el("h1", { class: "lesson-title" }, escapeHtml(les.title)));

    var body = el("div", { class: "lesson-body" }, les.body || "");
    main.appendChild(body);

    (les.examples || []).forEach(function (ex) { main.appendChild(buildExample(ex)); });
    (les.exercises || []).forEach(function (exr, i) { main.appendChild(buildExercise(exr, i + 1)); });

    // prev / next
    var foot = el("div", { class: "lesson-foot" });
    if (idx > 0) {
      var p = FLAT[idx - 1];
      var prev = el("a", { class: "foot-link prev", href: "#" + p.moduleId + "/" + p.lessonId });
      prev.appendChild(el("span", { class: "dir" }, "← Previous"));
      prev.appendChild(el("span", { class: "ttl" }, escapeHtml(p.lesson.title)));
      foot.appendChild(prev);
    }
    if (idx < FLAT.length - 1) {
      var nx = FLAT[idx + 1];
      var next = el("a", { class: "foot-link next", href: "#" + nx.moduleId + "/" + nx.lessonId });
      next.appendChild(el("span", { class: "dir" }, "Next →"));
      next.appendChild(el("span", { class: "ttl" }, escapeHtml(nx.lesson.title)));
      foot.appendChild(next);
    }
    main.appendChild(foot);

    markActiveNav(entry);
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    closeSidebar();
  }

  function markActiveNav(entry) {
    document.querySelectorAll(".nav-lesson").forEach(function (a) {
      var on = a.getAttribute("data-mod") === entry.moduleId && a.getAttribute("data-les") === entry.lessonId;
      a.classList.toggle("active", on);
    });
  }

  function buildSidebar() {
    var sb = $("#sidebar");
    sb.innerHTML = "";
    LESSONS.forEach(function (mod) {
      var group = el("div", { class: "nav-module" });
      group.appendChild(el("div", { class: "nav-module-title" }, escapeHtml(mod.title)));
      mod.lessons.forEach(function (les) {
        var a = el("a", {
          class: "nav-lesson",
          href: "#" + mod.id + "/" + les.id,
          "data-mod": mod.id,
          "data-les": les.id
        }, escapeHtml(les.title));
        group.appendChild(a);
      });
      sb.appendChild(group);
    });
  }

  // =======================================================================
  // Tables modal (introspect the real seeded DB)
  // =======================================================================
  function buildTablesModal() {
    var body = $("#modalBody");
    body.innerHTML = "";
    body.appendChild(el("p", { class: "schema-intro" },
      "Every query you run is checked against these four tables. The database is rebuilt from scratch on every Run, so nothing you do can break it."));

    var db = freshDb();
    try {
      var t = db.exec("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name");
      var names = (t[0] ? t[0].values : []).map(function (r) { return r[0]; });
      // preferred display order
      var order = ["customers", "categories", "products", "orders"];
      names.sort(function (a, b) {
        var ia = order.indexOf(a), ib = order.indexOf(b);
        return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib);
      });

      names.forEach(function (name) {
        var info = db.exec("PRAGMA table_info(" + name + ")");
        var cols = (info[0] ? info[0].values : []).map(function (r) { return r[1]; });
        var cntRes = db.exec("SELECT COUNT(*) FROM " + name);
        var cnt = cntRes[0].values[0][0];
        var sample = db.exec("SELECT * FROM " + name + " LIMIT 6");

        var wrap = el("div", { class: "schema-table" });
        var h = el("h3", null, escapeHtml(name));
        h.appendChild(el("span", { class: "pill" }, cnt + " rows"));
        wrap.appendChild(h);
        wrap.appendChild(el("div", { class: "cols" }, cols.map(escapeHtml).join(" · ")));

        if (sample[0]) {
          var scroll = el("div", { class: "table-scroll" });
          var tbl = el("table", { class: "result" });
          var thead = el("thead"); var htr = el("tr");
          sample[0].columns.forEach(function (c) { htr.appendChild(el("th", null, escapeHtml(c))); });
          thead.appendChild(htr); tbl.appendChild(thead);
          var tb = el("tbody");
          sample[0].values.forEach(function (row) {
            var tr = el("tr");
            row.forEach(function (v) {
              if (v === null || v === undefined) tr.appendChild(el("td", { class: "null-cell" }, "NULL"));
              else tr.appendChild(el("td", null, escapeHtml(String(v))));
            });
            tb.appendChild(tr);
          });
          tbl.appendChild(tb); scroll.appendChild(tbl); wrap.appendChild(scroll);
        }
        body.appendChild(wrap);
      });
    } finally {
      db.close();
    }
  }

  function openModal() { $("#tablesModal").classList.add("open"); }
  function closeModal() { $("#tablesModal").classList.remove("open"); }

  // ----- sidebar (mobile) -----
  function openSidebar() { $("#sidebar").classList.add("open"); $("#scrim").classList.add("open"); }
  function closeSidebar() { $("#sidebar").classList.remove("open"); $("#scrim").classList.remove("open"); }

  // =======================================================================
  // Icons (inline SVG)
  // =======================================================================
  function iconPlay() { return "<svg viewBox='0 0 24 24' fill='currentColor'><path d='M8 5v14l11-7z'/></svg>"; }
  function iconCheck() { return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4'><path d='M20 6L9 17l-5-5'/></svg>"; }
  function iconX() { return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.4'><path d='M18 6L6 18M6 6l12 12'/></svg>"; }
  function iconWarn() { return "<svg viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2'><path d='M12 9v4M12 17h.01M10.3 3.9l-8 13.8A2 2 0 004 21h16a2 2 0 001.7-3.3l-8-13.8a2 2 0 00-3.4 0z'/></svg>"; }

  // =======================================================================
  // Boot
  // =======================================================================
  function setBootMsg(m) { var b = $("#boot-msg"); if (b) b.textContent = m; }

  function start() {
    buildSidebar();
    buildTablesModal();
    renderLesson(currentIndex());

    window.addEventListener("hashchange", function () { renderLesson(currentIndex()); });
    $("#tablesBtn").addEventListener("click", openModal);
    $("#modalClose").addEventListener("click", closeModal);
    $("#tablesModal").addEventListener("click", function (e) {
      if (e.target === this) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") { closeModal(); closeSidebar(); }
    });
    $("#menuToggle").addEventListener("click", function () {
      if ($("#sidebar").classList.contains("open")) closeSidebar(); else openSidebar();
    });
    $("#scrim").addEventListener("click", closeSidebar);

    // fade out splash
    var boot = $("#boot");
    boot.style.opacity = "0";
    setTimeout(function () { boot.style.display = "none"; }, 420);
  }

  function fail(msg) {
    var boot = $("#boot");
    boot.innerHTML =
      "<div class='logo'>QuickBite <span class='dot'>·</span> SQL Lab</div>" +
      "<div class='msg' style='max-width:440px;text-align:center;line-height:1.6'>" +
      "Couldn't start the SQL engine. This page needs an internet connection the first time it loads " +
      "(to fetch the SQLite WebAssembly file). Please check your connection and refresh.<br><br>" +
      "<span style='color:var(--danger)'>" + escapeHtml(msg) + "</span></div>";
  }

  // kick off
  if (typeof initSqlJs !== "function") {
    fail("The SQL library failed to load from the CDN.");
    return;
  }
  setBootMsg("Downloading the SQLite engine…");
  initSqlJs({ locateFile: function (file) { return "vendor/" + file; } })
    .then(function (lib) {
      SQL = lib;
      bootOk = true;
      setBootMsg("Loading the QuickBite data…");
      // sanity check the seed before showing UI
      var db = freshDb(); db.close();
      start();
    })
    .catch(function (e) {
      fail(String((e && e.message) || e));
    });
})();
