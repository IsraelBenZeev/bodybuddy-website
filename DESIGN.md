---
name: BodyBuddy website
description: Hebrew RTL landing and share pages for the BodyBuddy fitness and nutrition app. Dark slate, one lime, condensed display type.
colors:
  bg: "#1a2030"
  surface: "#252d3a"
  inner: "#2c3545"
  green: "#96c828"
  green-soft: "rgba(150, 200, 40, 0.14)"
  green-line: "rgba(150, 200, 40, 0.4)"
  muted: "#516070"
  text: "#c8d0db"
  text-2: "#8c9aab"
  heading: "#ffffff"
  line: "rgba(255, 255, 255, 0.08)"
typography:
  chapter-title:
    fontFamily: "Karantina, Heebo, sans-serif"
    fontSize: "clamp(3.8rem, 11vw, 6rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "0.01em"
  section-title:
    fontFamily: "Karantina, Heebo, sans-serif"
    fontSize: "clamp(2.8rem, 8vw, 5rem)"
    fontWeight: 700
    lineHeight: 1
  tagline:
    fontFamily: "Heebo, sans-serif"
    fontSize: "clamp(1.1rem, 2.4vw, 1.35rem)"
  body:
    fontFamily: "Heebo, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
  button:
    fontFamily: "Heebo, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
rounded:
  pill: "999px"
  screen: "26px"
  frame: "34px"
  frame-lg: "44px"
  icon-tile: "16px"
  stroke: "3px"
spacing:
  gutter: "16px"
  max-width: "1120px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
    rounded: "{rounded.pill}"
    padding: "16px 34px"
    typography: "{typography.button}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "16px 34px"
  button-ghost-hover:
    backgroundColor: "{colors.green}"
    textColor: "{colors.bg}"
  button-store:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
    padding: "14px 28px"
  button-link:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    padding: "16px 8px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
  day-active:
    backgroundColor: "{colors.green-soft}"
    textColor: "{colors.green}"
    rounded: "{rounded.pill}"
---

# BodyBuddy website

## Overview

The site has one job: get an Israeli person who trains to install BodyBuddy. It is Hebrew-first and RTL, and most visitors arrive on a phone. The look is the app's own world. Pages sit on a dark slate ground, with a single lime green as the only accent. Titles use Karantina, a tall condensed display face, with a short painted lime stroke under them. Real app screenshots sit in rounded frames, and every button is a pill.

Two surfaces share this system:
- `index.html`: the landing page. It is in Persuade mode and tells its story in chapters.
- `share/index.html`: the page for a shared plan (`?t=`) or exercise (`?e=`), for visitors who don't have the app. The hero shows the shared plan itself over the drifting wall of app screenshots. Below it come one chapter and a download section. The chapter's background is a 7-bar chart of the plan's real training week.

There is no build step. The site is static HTML, CSS and JS on GitHub Pages.

## Colors

- **`bg` #1a2030** is the ground of every page. The app's main screen background uses the same value.
- **`surface` #252d3a / `inner` #2c3545** are for raised areas and inner wells. Use them sparingly, because most content sits directly on `bg`.
- **`green` #96c828** is the only accent. It colors the primary CTA fill, the stroke under titles, active states, numbers and focus rings. Never add a second accent hue.
- **`green-soft` / `green-line`** are the translucent pair for selected or "on" states, such as an active day, the store button or an icon tile: a soft fill with a lime hairline.
- **`text` #c8d0db** is for body copy. **`text-2` #8c9aab** is for secondary lines and notes. **`heading` #ffffff** is for titles only.
- **`line`** is a white hairline at 8% opacity, used for dividers and screenshot frame borders.

Contrast must stay AA. Never use lime text smaller than 14px on `surface`.

## Typography

- **Display:** Karantina 700. Use it only for chapter and section titles, hero titles and big figures. Each chapter title gets the lime stroke from `::after`, which paints in when the chapter scrolls into view.
- **Body:** Heebo, in weights 300 to 800. Buttons use Heebo 700.
- Use `text-wrap: balance` on taglines and subtitles.
- Hebrew text must never be letter-spaced. The small 0.01em on the display face is the only exception.

## Layout

- The content width is at most `1120px`, with a 16px side gutter on mobile. Nothing should cause horizontal page scroll. The decorative screen wall can extend past the viewport because it is clipped.
- Pages follow a chapter rhythm: a hero, then chapters, each with a title, a subtitle and its content, then the download close.
- The layout is RTL. Use logical properties (`inset-inline-start`). On the share page's week chart, Sunday (א) is the rightmost bar.
- Design for a 390px width first. Check every change at both 390px and desktop width.

## Elevation & Depth

- The hero screen wall drifts slowly in three columns, under a dark scrim, so the title stays readable.
- Phone and screenshot frames take a long, soft, dark drop shadow (`0 30px 40px -24px rgba(0,0,0,.8)`) plus a 1px `line` ring.
- The primary button takes a dark shadow under it, and on hover a light sweep passes across it.
- Motion uses `--ease-out` (`cubic-bezier(0.16, 1, 0.3, 1)`). Every animation has to respect `prefers-reduced-motion`, and the content has to be complete without it.

## Shapes

- Buttons, chips, day circles and badges are full pills (`999px`).
- Screenshots are `26px` and phone frames are `34–44px`. Icon tiles are `16px`.
- The title stroke is 84×6 with a `3px` radius.
- Never use sharp corners on interactive elements.

## Components

- **Primary button:** a solid lime pill with dark text. It is used once per view, for the download action.
- **Ghost button:** a transparent pill with a lime border and lime text. It fills with lime on hover. It is used for "download" in the header and for "back to the homepage".
- **Store button:** a translucent lime pill with the Google Play mark and a two-line label. The Play link is the standard details URL.
- **Link button:** text with a down-arrow. It scrolls to the next chapter.
- **Chips:** pills for body areas and equipment.
- **Week row:** 7 circles in RTL order. Active days get the `green-soft` fill plus `green-line`.
- **Exercise list:** an ordered list with a numbered lime index, a 64px square thumbnail on black, the name, and the body parts joined with " · ".
- **Download close:** the logo mark, a section title, one sentence, store buttons, and three numbered steps (download, sign in, tap the link again).

## Do's and Don'ts

- **Do** insert text written by users (plan names, descriptions, sender name) through `textContent` only.
- **Do** use gender-neutral Hebrew when the sender is named. For example, write "תוכנית האימון של X, ששותפה איתך", not "X שיתף".
- **Do** keep every number honest. Use real data from the server only, and invent no ratings, user counts or testimonials.
- **Do** add Cloudinary transforms (`f_auto,q_auto,w_N`) to the exercise images.
- **Don't** add a second accent color, a gradient fill on buttons, or glassmorphism cards.
- **Don't** use Karantina for body copy or for anything smaller than about 2rem.
- **Don't** offer an "open in app" link except on Android, where the `intent://` URL falls back to Play.
