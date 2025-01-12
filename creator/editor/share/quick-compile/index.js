const t = require("fire-fs"),
  i = require("fire-path"),
  e = require("module-deps"),
  s = require("JSONStream"),
  r = require("concat-stream"),
  o = require("browser-resolve"),
  a = require("del"),
  n = require("browserify/lib/builtins.js"),
  c = require("lodash"),
  {
    promisify: l
  } = require("util"),
  {
    formatPath: h,
    isNodeModulePath: p
  } = require("./utils"),
  u = "undefined" == typeof Editor;
let d = null;

function m() {
  this._scriptsCache = {}, this._scriptsToCompile = [], this._missingScripts = [], this._watchedScripts = [], this._fileStats = {}, this._mtimes = [], this.plugins = [], this.excludes = []
}
d = u ? function (t) {
  console.error(t)
} : function (t) {
  Editor.error(t)
}, Object.assign(m.prototype, {
  async watch(t, i) {
    await this.build(t), this._createWatcher(t)
  },
  _createWatcher(t) {
    console.log("watching...");
    const e = require("chokidar");
    this.watching = !0;
    let s = (t.exts || [".js"]).map(t => i.join(this.root, "**/*" + t)),
      r = e.watch(s, {
        ignored: i.join(this.out, "**"),
        ignoreInitial: !0
      });
    r.on("all", (i, e) => {
      if (e = h(e), "add" === i) return e = [e].concat(this._missingScripts), this.compileScripts(e), void 0;
      this._scriptsCache[e] && ("change" === i ? t.onlyRecordChanged ? this._watchedScripts = c.union(this._watchedScripts, [e]) : this.compileScripts(e) : "unlink" === i && this.removeScripts(e))
    }), this.watcher && this.watcher.close(), this.watcher = r
  },
  async build(t) {
    if (!t.entries) throw new Error("Please specify the entries");
    Array.isArray(t.entries) || (t.entries = [t.entries]), this.entries = t.entries.map(h), this.getRelativePath = t.getRelativePath || this.getRelativePath;
    let i = t.root;
    if (!i) throw new Error("Please specify the root directory");
    this.root = i;
    let e = t.out;
    if (e || (e = "./quick-compile-temp"), this.out = e, t.clear) try {
      a.sync(e, {
        force: !0
      })
    } catch (t) {
      d(t)
    }
    t.plugins && Array.isArray(t.plugins) && (this.plugins = t.plugins.concat(this.plugins)), t.excludes && Array.isArray(t.excludes) && (this.excludes = t.excludes.concat(this.excludes)), await this.rebuild()
  },
  clearCache() {
    this._scriptsCache = {}
  },
  async _readFileStats() {
    this._fileStats = {};
    let e = i.join(this.out, "__file_stats__.json");
    if (!t.existsSync(e)) return;
    let s = await l(t.readJson)(e);
    "1.0.8" === s.version ? this._fileStats = s.stats : a.sync(this.out, {
      force: !0
    })
  },
  async _writeFileStats() {
    let e = i.join(this.out, "__file_stats__.json");
    await l(t.writeJson)(e, {
      version: "1.0.8",
      stats: this._fileStats
    })
  },
  async rebuild() {
    if (await this._readFileStats(), this.watching) {
      if (console.time("QuickCompiler watching rebuild finished"), 0 === this._watchedScripts.length) return console.timeEnd("QuickCompiler watching rebuild finished"), void 0;
      await Promise.all(this.entries.map(async t => this._transform(t))), await Promise.all(this._watchedScripts.map(async t => this._parseEntry(t, !1))), this._watchedScripts.length = 0
    } else console.time("QuickCompiler rebuild finished"), await Promise.all(this.entries.map(async t => this._transform(t))), await Promise.all(this.entries.map(async t => this._parseEntry(t, !0))), await this._compileFinished(), console.timeEnd("QuickCompiler rebuild finished");
    await this._writeFileStats()
  },
  getRelativePath(t) {
    return h(i.relative(this.root, t))
  },
  getDstPath(t) {
    if (p(t)) return this.getNodeModuleDstPath(t);
    let e = this.getRelativePath(t);
    return h(i.join(this.out, i.stripExt(e) + ".js"))
  },
  getNodeModuleDstPath(t) {
    let e = i.join("__node_modules", t.slice(t.indexOf("/node_modules/") + "/node_modules/".length));
    return e = i.stripExt(e) + ".js", i.join(this.out, e)
  },
  async compileScripts(t) {
    Array.isArray(t) || (t = [t]), this._scriptsToCompile = c.union(this._scriptsToCompile, t), await this._compileScripts()
  },
  async _compileScripts() {
    console.time("compileScript"), await Promise.all(this._scriptsToCompile.map(async t => this._parseEntry(t, !1))), this._scriptsToCompile.length = 0, await this._compileFinished(), console.timeEnd("compileScript")
  },
  async removeScripts(i) {
    Array.isArray(i) || (i = [i]);
    let e = i.map(i => {
      let e = this.getDstPath(i);
      t.existsSync(e) && a.sync(e, {
        force: !0
      });
      let s = e + ".info.json";
      return t.existsSync(s) && a.sync(s, {
        force: !0
      }), e
    });
    this._scriptsToCompile = c.pullAll(this._scriptsToCompile, i);
    for (let t = 0; t < e.length; t++) delete this._scriptsCache[e[t]];
    await this._compileFinished()
  },
  removeCachedScripts(t) {
    Array.isArray(t) || (t = [t]), t.forEach(t => {
      t = h(t), delete this._scriptsCache[t]
    })
  },
  async _transform(e) {
    if (this.watching && console.time("_transform: " + e), e = h(e), this.excludes.find(t => e.match(t))) return null;
    let s = {
        src: e,
        dst: this.getDstPath(e)
      },
      r = await l(t.stat)(e);
    if (this._fileStats[e] === r.mtime.toJSON() && t.existsSync(s.dst)) return this._scriptsCache[e] ? this._scriptsCache[e] : (s.source = await l(t.readFile)(s.dst, "utf8"), s);
    s.source = await l(t.readFile)(e, "utf8");
    for (let t = 0; t < this.plugins.length; t++) {
      let i = this.plugins[t];
      if ((!p(e) || i.nodeModule) && i.transform) try {
        await i.transform(s, this)
      } catch (t) {
        d(t)
      }
    }
    return await l(t.ensureDir)(i.dirname(s.dst)), await l(t.writeFile)(s.dst, s.source), this.watching && console.timeEnd("_transform: " + e), r = await l(t.stat)(e), this._fileStats[e] = r.mtime.toJSON(), this._scriptsCache[e] = s, s
  },
  _isFileInCache(t) {
    return this._scriptsCache[t]
  },
  _refineScript(t) {
    t.src = h(t.file), t.dst = this.getDstPath(t.src), delete t.file;
    for (let i in t.deps) t.deps[i] = h(t.deps[i])
  },
  _parseModules(t, i, a) {
    t = h(t), console.time(`Parse [${t}]`);
    let l = 0,
      u = r(e => {
        console.log(`Parse [${t}]: walk ${l}  files.`), console.timeEnd(`Parse [${t}]`);
        let s = e.toString();
        s = `{"scripts": ${s}}`;
        let r = [];
        try {
          r = JSON.parse(s).scripts
        } catch (t) {
          d(t)
        }
        let o = this._scriptsCache;
        r.forEach(e => {
          this._refineScript(e), (i || e.src === t || p(e.src)) && (o[e.src] = e)
        }), a()
      }),
      m = {
        extensions: [".js", ".json", ".ts"],
        ignoreMissing: !0
      };
    m.modules = Object.assign(Object.create(null), n), m.cache = {}, m.resolve = ((t, i, e) => {
      let s = "";
      if (this.plugins.forEach(e => {
          e.resolve && (s = e.resolve(t, i))
        }), s) return e(null, s);
      i.paths = require.main.paths.concat(i.paths), o(t, i, (s, r) => {
        if (s) return e(s);
        this.plugins.forEach(e => {
          e.onResolve && e.onResolve(t, r, i && i.filename)
        }), e(s, r)
      })
    }), m.persistentCache = ((e, s, r, o, a) => {
      process.nextTick(() => {
        i || h(e) === t || p(e) ? (l++, this._transform(e).then(t => {
          t ? (m.cache[e] = t.source, o(t.source, a)) : o("module.exports = {};", a)
        }).catch(t => {
          a(t)
        })) : o("module.exports = {};", a)
      })
    });
    var _ = new e(m);
    _.pipe(s.stringify()).pipe(u), _.write({
      file: t
    }), _.end(), _.on("missing", (t, i) => {
      console.log(`Cannot resolve module [${t}] when parse [${i.filename}]`), this._missingScripts = c.union(this._missingScripts, [h(i.filename)])
    }), _.on("error", t => {
      a(t instanceof Error ? t : new Error(t))
    })
  },
  async _parseEntry(t, i, e) {
    try {
      await l(this._parseModules.bind(this))(t, i)
    } catch (t) {
      Editor.error(t)
    }
  },
  getSortedScripts() {
    let t = [],
      i = this._scriptsCache;
    for (let e in i) t.push(i[e]);
    return t = c.sortBy(t, "file")
  },
  async _compileFinished() {
    console.time("QuickCompiler compileFinished"), await Promise.all(this.plugins.map(async t => {
      if (t.compileFinished) return t.compileFinished(this)
    })), this.onCompileFinished && this.onCompileFinished(), console.timeEnd("QuickCompiler compileFinished")
  }
}), m.prototype._compileScripts = c.debounce(m.prototype._compileScripts, 100), module.exports = m;