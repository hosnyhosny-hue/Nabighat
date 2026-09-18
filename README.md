# Nabigha — full v3 development preview

This is the `feature/global-expedition-v3` branch for the complete playable expedition/circuit preview. The live `main` branch remains at 2.2.3. PR #2 is draft; this update does not merge or deploy.

```sh
python3 v3/build.py --export-source
node --test v3/core.test.mjs
python3 -m http.server 8080 --directory _preview
```

Open localhost:8080 and choose **ابدأ بعثة الإعمار / Start the expedition** or **مضمار الآفاق / Horizon circuit**. The legacy runner and nine thinking gates remain connected.

See [v3/README.md](v3/README.md) for the source architecture, integrity locks, local review workflow and limitations. All required source bytes and existing approved character illustrations are tracked; `--export-source` materializes a conventional editable module tree. No archive assets or font binaries are committed.

**No production deployment is authorized in this development task.**
