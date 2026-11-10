# Redesign chat: source files

Saved on Nov 10 from the redesign chat's temporary scratchpad before Windows could clear it (Job 1 in `docs/rebuild/gpu-jobs.md`).

- `out/`: full-size renders and the HTML concept pages, kept as the original PNGs. Includes `nastyplot-mybox-concept.png` and `nastyplot-mybox-iphone.png`.
- `up/`, `up4/`, `up1024/`: upscale tests. The total was over 150 MB, so these were converted from PNG to WebP at quality 92.
- `home/`, `cur/`, `curdark/`: source sprites and current-site captures, kept as PNG.
- `*.tpl.html`, `*.cjs`, `*.mjs`, `*.css`, `*.js`: the templates and scripts that made the renders.

## Real-ESRGAN (not in the repo)

The Real-ESRGAN tool folder (`esrgan/`: the ncnn-vulkan binaries and models, 94 MB) is kept on Sim's PC outside Temp at:

`C:\Users\simra\tools\realesrgan\`

The executable is `C:\Users\simra\tools\realesrgan\x\realesrgan-ncnn-vulkan.exe`, and the models are in `x\models\` (including `realesrgan-x4plus-anime`).
