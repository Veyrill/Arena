# Ability icons – PixelLab prompts (32x32)

## Settings (all icons)
- Tool: Create image (Bitforge – allows style image + init image)
- Size: 32x32 (export x4 = 128x128)
- Style image: style_ref_hammer_32.png (user's hammer icon, background changed to black)
- Forced palette: arena_palette.png (26 colors) – optional; if colors get dull, generate without it
- No background: OFF (black square background + frame are part of the icon)
- Outline: none / lineless
- Shading: medium, Detail: medium
- Batches of 3 (one shared STYLE DESCRIPTION, colors only in the icon prompt)

## STYLE DESCRIPTION (paste as is, no colors here)
32x32 pixel art skill icon, square icon with a 2px colored frame, pure black background, dramatic close-up of the subject, the subject is big and cropped by the frame, only the most important part is visible, bright jagged energy rays bursting from behind the subject, flat colors with 3 shades, high contrast, bright highlights, low detail, no text

## Icon prompt template
"<close-up of PART of the subject> <what happens>, <1-2 main colors>, <color> energy rays, <frame color> frame"
Composition words that work: "close-up of", "only the blade tip visible", "cropped by the frame", "coming in from the top left corner",
"fills the icon", "seen from below". One subject, max 2 main colors + ray color, no faces/text/small details.

## MORPHS – keep them recognizable
Morph = the same composition as the base icon, new ray/frame color + one extra element.
Use the chosen base icon as INIT IMAGE (Bitforge, init strength ~300–450) with the morph prompt.

---

## Batch 1 – base abilities
- Overhead Blow: close-up of a huge sword blade tip coming down from the top of the icon, cropped by the frame, light gray blade, orange and yellow energy rays bursting from the impact below, red frame
- Pommel Strike: close-up of a sword hilt with a heavy round gold pommel thrusting toward the viewer, blade cropped by the frame, gold and light gray, white impact rays around the pommel, gold frame
- Battle Fury: close-up of the bell of a golden war horn on the left side, cropped by the frame, red sound waves and orange rays blasting to the right, gold and red, red frame

## Batch 2 – base + ultimates
- Decapitate: close-up of a huge executioner axe blade edge from the top right, handle cropped by the frame, light gray blade with a bright white edge, pale purple energy rays behind, white frame
- Bladestorm: three sword blade tips spinning in a circle, handles cropped by the frame, light gray blades, teal wind swirls and white rays, teal frame
- Skullsplitter: close-up of an axe blade buried in a cracked white skull, handle cropped by the frame, light gray and bone white, crimson energy rays, crimson frame

## Batch 3 – ultimate + Overhead Blow morphs (init = Overhead Blow)
- Earthshaker: close-up of a heavy iron hammer head hitting the ground at the bottom, handle cropped by the frame, gray hammer, orange cracks and rocks flying up, orange rays, orange frame
- Siphoning Strike: close-up of a huge sword blade tip coming down from the top, cropped by the frame, light gray blade, crimson rays at the impact and green healing sparks rising up, green frame
- Cruel Blow: close-up of a huge sword blade tip coming down from the top, cropped by the frame, light gray blade, gold star-shaped burst at the impact, gold rays, gold frame

## Batch 4 – Pommel Strike + Battle Fury morphs (init = Pommel Strike / Battle Fury)
- Marking Strike: close-up of a sword hilt with a heavy round gold pommel thrusting toward the viewer, a glowing purple target circle behind it, purple rays, purple frame
- Crippling Strike: close-up of a sword hilt with a heavy round gold pommel thrusting toward the viewer, broken light blue chain links flying around it, light blue rays, light blue frame
- Battlecry: close-up of the bell of a golden war horn on the left side, cropped by the frame, white and gold sound waves blasting to the right, gold frame

## Batch 5 – Battle Fury + Decapitate morphs (init = Battle Fury / Decapitate)
- Relentless Fury: close-up of the bell of a golden war horn on the left side, cropped by the frame, red flames swirling in a circle around it, crimson rays, crimson frame
- Executioner's Reach: close-up of a huge executioner axe blade edge from the top right, cropped by the frame, long purple shadow trail behind the blade, purple rays, purple frame
- Final Verdict: close-up of a huge executioner axe blade edge from the top right, cropped by the frame, glowing gold edge, bright gold rays, gold frame

## Batch 6 – debuff / buff icons (corner of the fight window, also 32x32)
- Mark of Death: purple target circle with a small white skull in the center, purple rays, purple frame
- Crippled: close-up of a broken light blue chain link snapping apart, light blue rays, light blue frame
- Stunned: three yellow stars spinning in a ring, yellow rays, yellow frame
- (optional) Deep Wound: close-up of a deep red slash with dripping drops, crimson rays, crimson frame

---

## Files (export 128x128)
Abilities (new folder): assets/skills/abilities/
- ab_overhead.png, ab_pommel.png, ab_fury.png, ab_decap.png
- ab_storm.png, ab_split.png, ab_quake.png
- ab_overhead_siphon.png, ab_overhead_cruel.png
- ab_pommel_mark.png, ab_pommel_cripple.png
- ab_fury_cry.png, ab_fury_free.png
- ab_decap_reach.png, ab_decap_verdict.png
Debuffs (existing folder, names already used by the game): assets/skills/curses/
- debuff_mark_of_death.png, debuff_crippled.png, debuff_stun.png, debuff_deep_wound.png
- skill_battle_fury.png (buff icon of Battle Fury – can be a copy of ab_fury.png)
