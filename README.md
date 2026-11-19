# ADITYA × SHREYA — THE CINEMATIC CUT (V2)

Original, mobile-first, scroll-directed royal Indian wedding invitation for 10–11 December 2026, Shivdhara Resort, Palanpur.

**Unlike the first version, the scroll position itself drives the transitions.** There are eleven bespoke, reversible scene changes, each with its own art direction, ornament, geometry and camera movement. It is not a slide deck, scroll-snap site or a set of page-load fades.

## What's new in V2

- **Scroll-controlled cinematic cuts at all 11 section boundaries**: a parchment page-fold, a constellation vortex, botanical petals, Sufi star portal, golden Haldi sunburst, serrated procession flags, prismatic reception mirror, glowing wedding embers, blessing mandala, unfolding venue scroll and closing rose-gold invitation seal.
- **A custom generative mandala** with numerous concentric gold rings, ornamental leaves and precision linework, rendered as an SVG so it stays crisp on phones.
- **Reversible motion**: scroll down to close the doors / transform the scene, or scroll upward to reverse the effect. No wheel trapping, jumping, mandatory autoplay video, or CDN animation framework.
- **Individual scene reactions**: Sufi stars, Haldi flower petals, Baraat confetti, reception glints and sacred-fire embers, with chapter-entry bursts and touch-triggered effects.
- **Moving illustration camera**: scene-dependent parallax zoom, image drift, subtle tilt, gold light sweeps, floating frames, ornamental halos, and title watermarks.
- **Kinetic editorial type**: staggered, masked word animations in headlines while preserving the original accessible heading label.
- **Animated opening flare** when the envelope seal is broken, plus a small fixed active-chapter indicator.
- **All original V1 features remain**: handmade palace / event illustrations, original instrumental loop, family blessings, countdown, venue/directions, RSVP dialer, share and downloadable calendar events.
- **Mobile-aware performance**: requestAnimationFrame scroll batching, transform-first animations, limited canvas particles, reduced pixel ratio, hidden-page throttling, and `prefers-reduced-motion` support.

## Deploy in GitHub → Vercel

Unzip this ZIP and upload the **files at its root** to your GitHub repository: `index.html`, `styles.css`, `cinema.css`, `script.js`, `cinema.js`, `assets/`, and `vercel.json`.

In Vercel use **Framework Preset: Other**; leave build/install commands blank. The app is just HTML + CSS + JavaScript, no npm dependencies or server/backend required.

For local preview, open `index.html` or serve with `python -m http.server 8000`. Music playback and sharing behave most reliably on an HTTPS host after user interaction.

## Key files

- `index.html` — invitation story, event dates/times, names and button links
- `styles.css` — original scene design / responsive layout
- `cinema.css` — all V2 cinematic geometry, portal and scroll-driven visual effects
- `script.js` — envelope interaction, soundtrack, base particles, calendar, countdown, sharing
- `cinema.js` — scroll timelines, per-scene effects, dynamic motion, ambient canvas
- `assets/*.svg` — original editable vector illustrations (including portal mandala)
- `assets/celebration-soundscape.mp3` — original synthesized soundtrack
- `assets/preview.jpg` — social-preview placeholder image

## Before sending guests the link

- Verify all wedding details against the family. The original invite describes the ceremony as **11 December at midnight**, which is ambiguous. The `.ics` invitation currently treats that as **12 December at 00:00 IST (the midnight following Friday evening)**.
- The countdown now starts with **Sufi Night on 10 December 2026 at 7:00 PM IST**, i.e. the first event in the supplied itinerary.
- `noindex, nofollow` limits indexing but is **not access control**. If the invitation must be private, use an authenticated gate.
- After deploying, change the `og:image` tag to the full `https://your-domain.com/assets/preview.jpg` URL for consistent WhatsApp link previews.
- All graphics and source code here are original, not copied from the reference site.

## Build verification

The JavaScript passes `node --check`; the stylesheets pass `tinycss2` stylesheet parsing and all referenced local assets resolve. Browser visual QA may still be needed on the final Vercel link, particularly iOS Safari and low-power Android devices; use real devices before distribution.
