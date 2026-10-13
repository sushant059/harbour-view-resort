# Harbour View Resort Darwin — brand

Sample luxury resort used as a demo. Rename everything in Admin → Settings and Rooms & experiences.

## Colours (Tailwind tokens)
| Token | Hex | Use |
|---|---|---|
| navy | #13262F (deep #0B171D) | Headings, dark sections, primary buttons |
| brand | #8A6A3A | Links, eyebrows, accents on light backgrounds (AA on white) |
| leaf | #C9A46A (dark #7E5F33) | Champagne-gold call-to-action buttons on dark backgrounds |
| sky | #D9B77E | Gold highlights on dark backgrounds |
| mist | #F7F3EC | Warm sand section backgrounds |
| line | #E8DFD1 | Borders |

## Type
Playfair Display (headings, semibold) and Jost (body). Eyebrows: uppercase, wide tracking.

## Logo
`public/hvr-mark.svg` — sun over three waves inside a gold ring on deep ink. PNG at `public/hvr-mark.png` for social and app icons.

## Voice
Warm, calm and personal. Short sentences. No invented awards, star ratings or guest numbers.

## Nocturne motion system (October 2026 redesign)

The public site is a dark, cinematic, editorial design: ink (`navy-deep`) and pearl (`#F4EFE6`) sections,
champagne gold accents, Cormorant Garamond for display type (light weights, italics for emphasis) and Jost for body text.

Motion lives in `components/motion/`:

- `smooth-scroll.tsx`: Lenis smooth scrolling (off for reduced motion). `lockScroll()` pauses it under modals.
- `preloader.tsx`: opening curtain, once per visit.
- `cursor.tsx`: gold cursor for mouse users. Add `data-cursor="View"` to any element to show a label.
- `primitives.tsx`: `SplitWords`, `SplitChars`, `Reveal`, `ClipReveal`, `Parallax`, `Magnetic`, `Tilt`, `CountUp`, `ScrollProgress`.
- `velocity-marquee.tsx`: giant type that reacts to scroll speed.

Home page scenes are in `components/home/`: the cinematic hero, the word-by-word statement, the pinned room rail,
the expanding film, the "day at Harbour View" SVG (sun, sky, boat, stars driven by scroll), the cursor-following
experience list, stacking packages, parallax gallery columns, the airport route map and the closing scene.
Every animation respects `prefers-reduced-motion`.
