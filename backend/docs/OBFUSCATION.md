# Obfuscation build: how it works

This project can produce a single-file, self-contained Node.js bundle and optionally obfuscate it for tamper resistance.

## What changes in the obfuscated build?

- Bundler: `webpack.standalone.obfuscated.config.js` produces `dist/server.standalone.obf.js`.
- Includes dependencies: The bundle is standalone (no `node_modules` needed at runtime).
- Obfuscation: The output JS is transformed by `webpack-obfuscator` with aggressive options.
- Console output disabled: `disableConsoleOutput: true` replaces `console.log/warn/error/...` with no-ops. This is why you don't see logs when running the obfuscated build.

## Key options in `webpack-obfuscator`

- `disableConsoleOutput: true` — Silences all console calls. Set to `false` if you want logs in production.
- `controlFlowFlattening`, `deadCodeInjection`, `stringArray*` — Make reverse engineering harder, at a cost of bigger/slower code.
- `debugProtection` — Blocks DevTools debugging attempts. Can cause overhead; disable if unnecessary.
- `renameGlobals`, `identifierNamesGenerator: 'mangled-shuffled'` — Renames symbols to unreadable names.
- `selfDefending` — Adds code that breaks when modified; can complicate some tooling.

You can tweak these in `webpack.standalone.obfuscated.config.js`.

## How environment variables work

- `index.js` uses `dotenv` to load `.env` at runtime. The standalone bundle still reads `.env` from the working directory.
- The `build-standalone.bat` script copies `.env` and `.env.docker` into `dist/` to keep things simple for deployment.
- Alternatively, you can inject values at build time via `DefinePlugin` (already sets `NODE_ENV`), but secrets should not be baked into the bundle.

## Why logs disappeared

Because `disableConsoleOutput: true` is enabled during obfuscation. If you need logs:

1. Edit `webpack.standalone.obfuscated.config.js` and set:

```js
new JavaScriptObfuscator({
  // ...other options
  disableConsoleOutput: false,
})
```

2. Rebuild: `npm run build:standalone:obf`

Or, switch to the non-obfuscated standalone: `npm run build:standalone`.

## High CPU usage when opening or running the obfuscated bundle

Aggressive options like `controlFlowFlattening`, `deadCodeInjection`, `stringArray*` transforms and `debugProtection` add interpreter work and de-optimise V8, which increases CPU usage significantly—both at startup and when the file is parsed (even just opening the large file in an editor can spike CPU as extensions attempt to index/minify/format it).

If you see high CPU in Task Manager when opening the bundle or running it:

- Use the lite profile: `npm run build:standalone:obf-lite` and run `node dist/server.standalone.obf-lite.js`.
- Avoid opening the big bundle in your editor; inspect via terminal tools or source maps (if enabled) instead.
- Keep `debugProtection` and `deadCodeInjection` disabled unless strictly required.

## Running the bundle

- Non-obfuscated standalone: `node dist/server.standalone.js`
- Obfuscated standalone: `node dist/server.standalone.obf.js`

Both listen on `PORT` env var (default 5000). Ensure `.env` is present or provide env vars.

## Trade-offs and tips

- Obfuscation reduces readability and casual tampering but is not a substitute for server-side security.
- Heavy options increase startup time and memory. If performance matters, consider dialing down:
  - Lower `controlFlowFlatteningThreshold` (e.g., 0.2–0.4)
  - Disable `deadCodeInjection`
  - Reduce `stringArrayWrappersCount` to 1, or disable `splitStrings`
- For debugging production incidents, keep a non-obfuscated build variant available.

## Where to change things

- Build script: `package.json` scripts and `build-standalone.bat`
- Webpack configs:
  - `webpack.standalone.obfuscated.config.js` — standalone + obfuscation
  - `webpack.standalone.config.js` — standalone, no obfuscation
  - `webpack.config.js` — regular bundle (externals)
