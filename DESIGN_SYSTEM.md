# Soul Sisters — Design System

This document defines the typography, colors, UI components, and design system tokens for the **Soul Sisters** custom e-commerce system (Storefront & Admin CMS).

---

## 🎨 Color Palette

The color system is mapped to CSS variables in `/app/globals.css` and configured in `tailwind.config.js`.

### Brand / Storefront Colors

| CSS Variable | Tailwind Class | Value | Usage |
|---|---|---|---|
| `--color-bg` | `bg-brand-bg` | `#FAFAF8` | Primary background color |
| `--color-dark` | `text-brand-dark` | `#1C1410` | Headings, primary text, dark backgrounds |
| `--color-accent` | `bg-brand-accent` | `#6E1A2C` | Primary accent, primary buttons, announcements |
| `--color-accent-hover` | — | `#8B2A3E` | Hover state for accent elements |
| `--color-muted` | `text-brand-muted` | `#6B5E54` | Secondary text, borders, labels |
| `--color-border` | `border-brand-border` | `#E8E4DF` | Dividers, inputs, subtle borders |
| `--color-gold` | `text-brand-gold` | `#C49B38` | Highlight text, labels |

### Admin CMS Colors

| Color | Hex Value | Usage |
|---|---|---|
| Canvas Background | `#F0EBE1` | Admin panel outer page background |
| Sidebar Background | `#FAF7F0` | Left sidebar background |
| Sidebar Borders | `#E0D0B8` | Sidebar items separator and borders |
| Active Nav Item | `#E0D0B8` | Highlight block behind active route |
| Text Dark | `#1A0F0A` | Headings and primary labels |
| Text Muted | `#9C7B5E` | Inactive nav links, secondary description |
| Button Accent | `#C49B38` | Primary administrative action buttons |

---

## 🔠 Typography

### Display Typography
- **Font**: `Cormorant Garamond` (Google Font)
- **Settings**: Weights `400`, `500`, `600`, `700`, including italics.
- **Tailwind Class**: `font-display`
- **CSS Variable**: `--font-display`
- **Feel**: Traditional, premium serif designed for high-contrast headlines.

### Body Typography
- **Font**: `DM Sans` (Google Font)
- **Settings**: Weights `300`, `400`, `500`, `600`.
- **Tailwind Class**: `font-body`
- **CSS Variable**: `--font-body`
- **Feel**: Highly readable modern sans-serif.

---

## 🔳 Core UI Components

### Storefront Buttons
- **Primary Buttons**: Background `--color-accent`, text white. Uppercase tracking `0.12em` and border-radius `2px`.
- **Secondary Buttons**: Background transparent, border `0.5px` `--color-border`, text `--color-dark`.
- **Admin CMS Buttons**: Background `#C49B38`, text `#1A0F0A`, border-radius `4px`, font-weight `600`.

### Cards & Layouts
- **Product Card**: Grid layouts with minimal hover opacity transition, featuring clear display-family name and formatted pricing in AED (د.إ).
- **Admin Stats Card**: White card layout (`#fff`) with a thin border (`#E0D0B8`), featuring a large `40px` Cormorant Garamond number.
