'use strict';

var node_module = require('node:module');
var path = require('node:path');
var getTsconfig = require('get-tsconfig');
var isBunModule = require('is-bun-module');
var stableHash = require('stable-hash');
var unrsResolver = require('unrs-resolver');
var fs = require('node:fs');
var debug = require('debug');
var tinyglobby = require('tinyglobby');

const defaultConditionNames = [
  "types",
  "import",
  // APF: https://angular.io/guide/angular-package-format
  "esm2020",
  "es2020",
  "es2015",
  "require",
  "node",
  "node-addons",
  "browser",
  "default"
];
const defaultExtensions = [
  ".ts",
  ".tsx",
  ".d.ts",
  ".js",
  ".jsx",
  ".json",
  ".node"
];
const defaultExtensionAlias = {
  ".js": [
    ".ts",
    // `.tsx` can also be compiled as `.js`
    ".tsx",
    ".d.ts",
    ".js"
  ],
  ".ts": [".ts", ".d.ts", ".js"],
  ".jsx": [".tsx", ".d.ts", ".jsx"],
  ".tsx": [
    ".tsx",
    ".d.ts",
    ".jsx",
    // `.tsx` can also be compiled as `.js`
    ".js"
  ],
  ".cjs": [".cts", ".d.cts", ".cjs"],
  ".cts": [".cts", ".d.cts", ".cjs"],
  ".mjs": [".mts", ".d.mts", ".mjs"],
  ".mts": [".mts", ".d.mts", ".mjs"]
};
const defaultMainFields = [
  "types",
  "typings",
  // APF: https://angular.io/guide/angular-package-format
  "fesm2020",
  "fesm2015",
  "esm2020",
  "es2020",
  "module",
  "jsnext:main",
  "main"
];
const JS_EXT_PATTERN = /\.(?:[cm]js|jsx?)$/;
const IMPORT_RESOLVER_NAME = "eslint-import-resolver-typescript";
const interfaceVersion = 2;
const DEFAULT_TSCONFIG = "tsconfig.json";
const DEFAULT_JSCONFIG = "jsconfig.json";
const DEFAULT_CONFIGS = [DEFAULT_TSCONFIG, DEFAULT_JSCONFIG];
const DEFAULT_TRY_PATHS = ["", ...DEFAULT_CONFIGS];
const MATCH_ALL = "**";
const DEFAULT_IGNORE = [MATCH_ALL, "node_modules", MATCH_ALL].join("/");
const TSCONFIG_NOT_FOUND_REGEXP = /^Tsconfig not found\b/;

function mangleScopedPackage(moduleName) {
  if (moduleName.startsWith("@")) {
    const replaceSlash = moduleName.replace("/", "__");
    if (replaceSlash !== moduleName) {
      return replaceSlash.slice(1);
    }
  }
  return moduleName;
}
function removeQuerystring(id) {
  const querystringIndex = id.lastIndexOf("?");
  if (querystringIndex !== -1) {
    return id.slice(0, querystringIndex);
  }
  return id;
}
const tryFile = (filename, includeDir = false, base = process.cwd()) => {
  if (typeof filename === "string") {
    const filepath = path.resolve(base, filename);
    return fs.existsSync(filepath) && (includeDir || fs.statSync(filepath).isFile()) ? filepath : "";
  }
  for (const file of filename != null ? filename : []) {
    const filepath = tryFile(file, includeDir, base);
    if (filepath) {
      return filepath;
    }
  }
  return "";
};
const computeAffinity = (projectDir, targetDir) => {
  const a = projectDir.split(path.sep);
  const b = targetDir.split(path.sep);
  let lca = 0;
  while (lca < a.length && lca < b.length && a[lca] === b[lca]) {
    lca++;
  }
  return a.length - lca + (b.length - lca);
};
const sortProjectsByAffinity = (projects, file) => {
  const fileDir = path.dirname(file);
  return projects.map((project) => ({
    project,
    affinity: computeAffinity(path.dirname(project), fileDir)
  })).sort((a, b) => a.affinity - b.affinity).map((item) => item.project);
};
const toGlobPath = (pathname) => pathname.replaceAll("\\", "/");
const toNativePath = (pathname) => "/" === path.sep ? pathname : pathname.replaceAll("/", "\\");

const log = debug(IMPORT_RESOLVER_NAME);

var __defProp$1 = Object.defineProperty;
var __defProps$1 = Object.defineProperties;
var __getOwnPropDescs$1 = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols$1 = Object.getOwnPropertySymbols;
var __hasOwnProp$1 = Object.prototype.hasOwnProperty;
var __propIsEnum$1 = Object.prototype.propertyIsEnumerable;
var __defNormalProp$1 = (obj, key, value) => key in obj ? __defProp$1(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues$1 = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp$1.call(b, prop))
      __defNormalProp$1(a, prop, b[prop]);
  if (__getOwnPropSymbols$1)
    for (var prop of __getOwnPropSymbols$1(b)) {
      if (__propIsEnum$1.call(b, prop))
        __defNormalProp$1(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps$1 = (a, b) => __defProps$1(a, __getOwnPropDescs$1(b));
exports.defaultConfigFile = void 0;
const configFileMapping = /* @__PURE__ */ new Map();
let warned;
function normalizeOptions(options, cwd = process.cwd()) {
  let { project, tsconfig, noWarnOnMultipleProjects } = options || (options = {});
  let { configFile, references } = tsconfig != null ? tsconfig : {};
  let ensured;
  if (configFile) {
    configFile = tryFile(configFile);
    ensured = true;
  } else if (project) {
    project = Array.isArray(project) ? project : [project];
    log("original projects:", ...project);
    project = project.map(toGlobPath);
    if (project.some((p) => tinyglobby.isDynamicPattern(p))) {
      project = tinyglobby.globSync(project, {
        absolute: true,
        cwd,
        dot: true,
        expandDirectories: false,
        onlyFiles: false,
        ignore: DEFAULT_IGNORE
      });
    }
    log("resolving projects:", ...project);
    project = project.flatMap(
      (p) => tryFile(DEFAULT_TRY_PATHS, false, toNativePath(p)) || []
    );
    log("resolved projects:", ...project);
    if (project.length === 1) {
      configFile = project[0];
      ensured = true;
    }
    if (project.length <= 1) {
      project = void 0;
    } else if (!warned && !noWarnOnMultipleProjects) {
      warned = true;
      console.warn(
        "Multiple projects found, consider using a single `tsconfig` with `references` to speed up, or use `noWarnOnMultipleProjects` to suppress this warning"
      );
    }
  }
  if (!project && !configFile) {
    configFile = exports.defaultConfigFile || (exports.defaultConfigFile = tryFile(DEFAULT_CONFIGS));
    ensured = true;
  }
  if (configFile) {
    const cachedOptions = configFileMapping.get(configFile);
    if (cachedOptions) {
      log("using cached options for", configFile);
      return cachedOptions;
    }
  }
  if (!ensured && configFile && configFile !== exports.defaultConfigFile) {
    configFile = tryFile(DEFAULT_TRY_PATHS, false, configFile);
  }
  options = __spreadProps$1(__spreadValues$1({
    conditionNames: defaultConditionNames,
    extensions: defaultExtensions,
    extensionAlias: defaultExtensionAlias,
    mainFields: defaultMainFields
  }, options), {
    project,
    tsconfig: configFile ? { references: references != null ? references : "auto", configFile } : void 0
  });
  if (configFile) {
    configFileMapping.set(configFile, options);
  }
  return options;
}

var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
const resolverCache = /* @__PURE__ */ new Map();
const tsconfigCache = /* @__PURE__ */ new Map();
const matcherCache = /* @__PURE__ */ new Map();
const unrsResolve = (source, file, resolver) => {
  const result = resolver.sync(path.dirname(file), source);
  if (result.path) {
    return {
      found: true,
      path: result.path
    };
  }
  if (result.error) {
    log("unrs-resolver error:", result.error);
    if (TSCONFIG_NOT_FOUND_REGEXP.test(result.error)) {
      throw new Error(result.error);
    }
  }
  return {
    found: false
  };
};
const isBun = !!process.versions.bun;
const resolve = (source, file, options, resolver) => {
  var _a;
  options || (options = {});
  if (isBun || options.bun ? isBunModule.isBunBuiltin(source) : node_module.isBuiltin(source)) {
    log("matched core:", source);
    return { found: true, path: null };
  }
  source = removeQuerystring(source);
  if (!resolver) {
    const optionsHash = stableHash.stableHash(options);
    const cwd = process.cwd();
    options = normalizeOptions(options, cwd);
    const cacheKey = `${optionsHash}:${cwd}`;
    let cached = resolverCache.get(cacheKey);
    if (!cached && !options.project) {
      resolverCache.set(cacheKey, cached = new unrsResolver.ResolverFactory(options));
    }
    resolver = cached;
  }
  createResolver: if (!resolver) {
    const project = options.project;
    for (const tsconfigPath of project) {
      const resolverCached = resolverCache.get(tsconfigPath);
      if (resolverCached) {
        resolver = resolverCached;
        break createResolver;
      }
      let tsconfigCached = tsconfigCache.get(tsconfigPath);
      if (!tsconfigCached) {
        tsconfigCache.set(
          tsconfigPath,
          tsconfigCached = getTsconfig.parseTsconfig(tsconfigPath)
        );
      }
      let matcherCached = matcherCache.get(tsconfigPath);
      if (!matcherCached) {
        matcherCache.set(
          tsconfigPath,
          matcherCached = getTsconfig.createFilesMatcher({
            config: tsconfigCached,
            path: tsconfigPath
          })
        );
      }
      const tsconfig = matcherCached(file);
      if (!tsconfig) {
        log("tsconfig", tsconfigPath, "does not match", file);
        continue;
      }
      log("matched tsconfig at:", tsconfigPath, "for", file);
      options = __spreadProps(__spreadValues({}, options), {
        tsconfig: __spreadProps(__spreadValues({
          references: "auto"
        }, options.tsconfig), {
          configFile: tsconfigPath
        })
      });
      resolver = new unrsResolver.ResolverFactory(options);
      resolverCache.set(tsconfigPath, resolver);
      break createResolver;
    }
    log(
      "no tsconfig matched",
      file,
      "with",
      ...project,
      ", trying from the the nearest one"
    );
    for (const p of sortProjectsByAffinity(project, file)) {
      const resolved2 = resolve(
        source,
        file,
        __spreadProps(__spreadValues({}, options), { project: p }),
        resolver
      );
      if (resolved2.found) {
        return resolved2;
      }
    }
  }
  if (!resolver) {
    return {
      found: false
    };
  }
  const resolved = unrsResolve(source, file, resolver);
  const foundPath = resolved.path;
  if ((foundPath && JS_EXT_PATTERN.test(foundPath) || options.alwaysTryTypes !== false && !foundPath) && !/^@types[/\\]/.test(source) && !path.isAbsolute(source) && !source.startsWith(".")) {
    const definitelyTyped = unrsResolve(
      "@types/" + mangleScopedPackage(source),
      file,
      resolver
    );
    if (definitelyTyped.found) {
      return definitelyTyped;
    }
  }
  if (foundPath) {
    log("matched path:", foundPath);
  } else {
    log(
      "didn't find",
      source,
      "with",
      ((_a = options.tsconfig) == null ? void 0 : _a.configFile) || options.project
    );
  }
  return resolved;
};
const createTypeScriptImportResolver = (options) => {
  options = normalizeOptions(options);
  const resolver = options.project ? null : new unrsResolver.ResolverFactory(options);
  return {
    interfaceVersion: 3,
    name: IMPORT_RESOLVER_NAME,
    resolve(source, file) {
      return resolve(source, file, options, resolver);
    }
  };
};

exports.DEFAULT_CONFIGS = DEFAULT_CONFIGS;
exports.DEFAULT_IGNORE = DEFAULT_IGNORE;
exports.DEFAULT_JSCONFIG = DEFAULT_JSCONFIG;
exports.DEFAULT_TRY_PATHS = DEFAULT_TRY_PATHS;
exports.DEFAULT_TSCONFIG = DEFAULT_TSCONFIG;
exports.IMPORT_RESOLVER_NAME = IMPORT_RESOLVER_NAME;
exports.JS_EXT_PATTERN = JS_EXT_PATTERN;
exports.MATCH_ALL = MATCH_ALL;
exports.TSCONFIG_NOT_FOUND_REGEXP = TSCONFIG_NOT_FOUND_REGEXP;
exports.createTypeScriptImportResolver = createTypeScriptImportResolver;
exports.defaultConditionNames = defaultConditionNames;
exports.defaultExtensionAlias = defaultExtensionAlias;
exports.defaultExtensions = defaultExtensions;
exports.defaultMainFields = defaultMainFields;
exports.interfaceVersion = interfaceVersion;
exports.mangleScopedPackage = mangleScopedPackage;
exports.normalizeOptions = normalizeOptions;
exports.removeQuerystring = removeQuerystring;
exports.resolve = resolve;
exports.sortProjectsByAffinity = sortProjectsByAffinity;
exports.toGlobPath = toGlobPath;
exports.toNativePath = toNativePath;
exports.tryFile = tryFile;
