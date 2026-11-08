# Shady Paw handoff (Nov 8, 2026)

For the next session working on NastyPlot's mascot with Sim. Read CLAUDE.md first (Mascot section), then this.

## Where things stand
- **The design is locked: Sim's own art.** `docs/mascot/shady-paw-original.png` (458x364, her best version).
  A side-profile black cat in a dark charcoal hoodie with a white hood edge, ears through the hood, white-and-black eyes,
  gritty greyscale sketch ink (cross-hatching, grain, splatter), a thin neon pink rim, a pink "NP" spray tag beside him,
  a black NP spray can, near-black background. She says hers is "still the best". Keep it exactly.
- **Next job: poses, made as EDITS of her image** (not new drawings). Show the poses on their own first and get her OK,
  then put them on the screens.

## Poses needed, and where each goes
Allowed spots only (from CLAUDE.md): never in Your Six, Add a Pokémon or the Battle preview; never beside grades, ratings or data.
| Pose | Used for |
|---|---|
| The original sitting pose (as is) | Empty My Team ("No team yet", line: "Nothing here yet. Let's plot something.") |
| Asleep, curled up | Other empty screens (e.g. no saved teams) |
| Thinking, paw to chin | Loading (e.g. Build me a team: "Plotting your six…") |
| Pointing / peeking | Tip bubbles (the "?" tips) |
| Celebrating (e.g. spraying a fresh tag) | Small notices: saved, grade went up |
| Front-facing, hood up | Build me a team hero (her own board had this) |

## How to make the poses (what works)
1. **Hugging Face connector, FLUX Kontext edit.** Sim enabled Spaces on her HF connector at huggingface.co/settings/mcp
   (account masrin), which should take effect in a new chat. Call `dynamic_space` with `operation: invoke`,
   `space_name: mcp-tools/FLUX.1-Kontext-Dev`, `input_image` = a public URL of her image.
   To get a public URL: POST the file to `https://mcp-tools-flux-1-kontext-dev.hf.space/gradio_api/upload` (form field `files`),
   then use `https://mcp-tools-flux-1-kontext-dev.hf.space/gradio_api/file=<returned path>`.
   Prompt pattern: "Change the pose: [new pose]. Keep the exact same art style: gritty greyscale sketch ink, cross-hatching,
   dark charcoal hoodie with white hood edge, white-and-black eyes, thin pink rim outline, pink NP tag, black background."
   One pose per call; keep prompts around 50 words.
2. If invoke still says "gradio=none", the connector setting has not loaded. Fallback: the same space's REST API
   (`/gradio_api/upload`, then `POST /gradio_api/call/infer` with data `[{path, meta:{_type:"gradio.FileData"}}, prompt, 0, true, 2.5, 28]`,
   then read `GET /gradio_api/call/infer/<event_id>`). A Hugging Face read token for that host is saved on the environment
   (the proxy injects it), but on Nov 8 this route still returned a bare error; the anonymous free quota had run out.
3. Other routes: Canva `generate-image` takes her image as a reference, but its prompt must be Sim's own words (ask her to type
   each pose). Wonder needs a paid plan ("Settings → Plan & billing"). Figma `generate_image` cannot take a reference image.

## Mistakes not to repeat
- **Redrawing him from a text prompt.** Every redraw drifted: white hoodie, blue eyes, clean and cute, big pink glow. Sim:
  "you took away the entire art style".
- **Pasting the one image on every screen.** Sim: "why did you replace everything with 1 image". Each spot needs its own pose.
- **Hand-coded SVG mascots and generic flat styles.** She called these cheap and AI-looking.
- **Glossy, airbrushed, perfectly symmetrical art.** It reads as AI to her.

## What she liked along the way (for reference)
- Her own integration board (dark site screens, side-profile cat, "monochrome + neon pops", spray paint, halftone, bold lines).
- A hand-drawn anime cat face "got emotion out of" her; she also liked a white hoodie and a mid-century risograph look.
  These were explorations; her own art won.

## Screens mock-up (once poses are approved)
A working board template is in the old session's scratchpad and is not in the repo. Rebuild it as real HTML:
dark mode, the real logo (Unbounded "Nasty" + "Plot" on the blue slanted plate), the bottom bar (Home / Build / My team /
Battle / Meta), real site text, and his background matched to the page so there is no box around him. Six screens:
empty My Team, tip bubble ("Spread" tip), Build me a team loading, toast (Saved "Rain team"), grade went up (no grade
letters next to him), no saved teams. Screenshot at 2x and send. Nothing goes on the live site without Sim's explicit go.

## Files and accounts
- Figma file "NastyPlot Mascot Styles" (style explorations): https://www.figma.com/design/hqyY3g6fz1wSCEOpfRMkH1
- Wonder file "Shady Paw" (her image uploaded; generation needs a paid plan):
  https://app.wonder.so/sim-bagga/files/01a1bcff-91b4-7230-a3a2-1b8b56e443f8
- Figma AI credits used so far: 18 generations.
