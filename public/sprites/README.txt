Pixel-art sprite slots (Task 2.3 placeholder).

When real art arrives, drop PNGs in this directory using the naming pattern:
  <agent-id>-active.png    (sprite at desk/computer)
  <agent-id>-idle.png      (sprite curled in cat bed)
  <agent-id>-standby.png   (sprite mid-stretch / wandering)
  <agent-id>-error.png     (sprite at desk with alert overlay)

Recommended size: 48x48 px, transparent PNG.

Agent IDs: alyvis, ohara, nyssa, sonic, picasso, dear-diary.

Replace the placeholder rendering in components/home/agent-sprite.tsx with <Image> tags pointing at /sprites/<id>-<status>.png.
