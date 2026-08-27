# Development notes

- The generator lives in `.sdk/`; the customization content (the `bash`
  target and the `elementcard` feature) lives in `ext/`, this repo's own
  sdkgen package. Edit `ext/`, then `cd .sdk && npx voxgig-sdkgen package
  add ../ext && npm run build && npm run generate`.
- `ts/ go/ py/ java/ bash/` are generated output. Never edit them.
- `app/` is the standalone reference server (port 8902), independent of
  the SDKs. `cd app && npm run build && npm start`, then
  `npm run validate` for the live check.
- Verify no drift before committing: `cd .sdk && npx voxgig-sdkgen doctor`
  (expects: matches the scaffold, 1 additive) and
  `npx voxgig-sdkgen package check ../ext`.
