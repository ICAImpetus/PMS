# shiv-admin-ui-backend

## Build variants

- Regular bundle (externals, no obfuscation): `npm run build` → `dist/server.bundle.js`
- Standalone bundle (includes node_modules, no obfuscation): `npm run build:standalone` → `dist/server.standalone.js`
- Standalone + Obfuscated (includes node_modules, obfuscation): `npm run build:standalone:obf` → `dist/server.standalone.obf.js`
 - Standalone + Obfuscated (Lite): `npm run build:standalone:obf-lite` → `dist/server.standalone.obf-lite.js`

Run variants:

- Regular: `npm run serve`
- Standalone: `npm run serve:standalone`
- Standalone (obfuscated): `npm run serve:standalone:obf`
 - Standalone (obfuscated lite): `npm run serve:standalone:obf-lite`

See `docs/OBFUSCATION.md` for how the obfuscation works and how to tweak it.