# Aveo CharacterAI: Design System

## Overview

Aveo uses a dual theme system. The marketing site uses a dark theme with purple/indigo gradients to convey premium, modern, AI forward branding. The dashboard uses a clean light theme optimized for extended use and data readability.

The design system is built on Tailwind CSS with CSS custom properties for theme switching.

---

## Color Palette

### Brand Colors

| Name | Hex | Tailwind Class | Usage |
|------|-----|---------------|-------|
| Brand Purple | #9333EA | `purple-600` | Primary brand color, CTAs, accents |
| Brand Indigo | #4F46E5 | `indigo-600` | Secondary brand, gradient endpoints |
| Brand Violet | #7C3AED | `violet-600` | Tertiary accent, background glows |

### Primary Gradient

The core brand gradient runs from purple to indigo. Used for primary buttons, badges, and key accent elements.

```css
background: linear-gradient(to right, #9333EA, #4F46E5);
/* Tailwind: bg-gradient-to-r from-purple-600 to-indigo-600 */
```

**Hover state:**
```css
background: linear-gradient(to right, #A855F7, #6366F1);
/* Tailwind: hover:from-purple-500 hover:to-indigo-500 */
```

### Marketing Theme (Dark)

| Name | Hex | Tailwind Class | Usage |
|------|-----|---------------|-------|
| Background | #0A0118 | Custom | Page background |
| Surface | rgba(255,255,255,0.05) | `bg-white/5` | Cards, containers |
| Surface Hover | rgba(255,255,255,0.07) | `bg-white/[0.07]` | Card hover states |
| Border | rgba(255,255,255,0.1) | `border-white/10` | Card borders, dividers |
| Border Hover | rgba(255,255,255,0.2) | `border-white/20` | Interactive border hover |
| Text Primary | #FFFFFF | `text-white` | Headings, important text |
| Text Secondary | #9CA3AF | `text-gray-400` | Body text, descriptions |
| Text Tertiary | #6B7280 | `text-gray-500` | Captions, labels, muted text |
| Accent Text | #C084FC | `text-purple-400` | Section labels, check marks, links |
| Accent Surface | rgba(168,85,247,0.1) | `bg-purple-500/10` | Icon backgrounds, badges |
| Accent Border | rgba(168,85,247,0.2) | `border-purple-500/20` | Accent element borders |
| Glow Purple | rgba(147,51,234,0.2) | `bg-purple-600/20` | Background glow orbs |
| Glow Indigo | rgba(79,70,229,0.2) | `bg-indigo-600/20` | Background glow orbs |
| Glow Violet | rgba(124,58,237,0.1) | `bg-violet-600/10` | Subtle background glows |

### Dashboard Theme (Light)

| Name | Hex | CSS Variable | Usage |
|------|-----|-------------|-------|
| Background | #FFFFFF | `--background` | Page background |
| Foreground | #0F172A | `--foreground` | Primary text |
| Border | #E5E7EB | `border-gray-200` | Card borders, dividers |
| Primary | #4F46E5 | Button default | Actions, links |
| Primary Hover | #4338CA | Button hover | Interactive states |
| Secondary BG | #F3F4F6 | `bg-gray-100` | Secondary buttons, tags |
| Destructive | #DC2626 | `bg-red-600` | Delete actions, errors |
| Muted Text | #374151 | `text-gray-700` | Body text |
| Caption Text | #6B7280 | `text-gray-500` | Labels, metadata |

### Semantic Colors

| Purpose | Color | Hex | Usage |
|---------|-------|-----|-------|
| Success | Green 500 | #22C55E | Completed states, positive metrics |
| Success Surface | Green 500/20 | rgba(34,197,94,0.2) | Money back guarantee badge |
| Warning | Yellow 500 | #EAB308 | Star ratings, approaching limits |
| Error | Red 500 | #EF4444 | Failed renders, validation errors |
| Info | Blue 500 | #3B82F6 | Progress indicators, generating states |
| Purple (Pipeline) | Purple 500 | #A855F7 | Lip syncing status |
| Orange (Pipeline) | Orange 500 | #F97316 | Compositing status |

### Video Pipeline Status Colors

| Status | Color | Tailwind |
|--------|-------|----------|
| Queued | Gray 500 | `bg-gray-500` |
| Generating Audio | Blue 500 | `bg-blue-500` |
| Lip Syncing | Purple 500 | `bg-purple-500` |
| Compositing | Orange 500 | `bg-orange-500` |
| Ready | Green 500 | `bg-green-500` |
| Failed | Red 500 | `bg-red-500` |

---

## Typography

### Font Family

- **Primary (Sans):** Geist Sans (variable font, weights 100 to 900)
- **Monospace:** Geist Mono (variable font, for code and technical content)
- **Fallbacks:** system-ui, sans-serif

```css
font-family: var(--font-geist-sans), system-ui, sans-serif;
```

### Type Scale

| Name | Size | Weight | Line Height | Tailwind | Usage |
|------|------|--------|-------------|----------|-------|
| Display | 72px / 4.5rem | Bold (700) | Tight | `text-7xl font-bold tracking-tight` | Hero headline (desktop) |
| H1 | 48px / 3rem | Bold (700) | Tight | `text-5xl font-bold tracking-tight` | Page titles |
| H2 | 36px / 2.25rem | Bold (700) | Tight | `text-4xl font-bold tracking-tight` | Section headers |
| H3 | 30px / 1.875rem | Bold (700) | Tight | `text-3xl font-bold` | Sub section headers |
| H4 | 24px / 1.5rem | Semibold (600) | Normal | `text-2xl font-bold` | Card titles, feature comparison |
| H5 | 20px / 1.25rem | Semibold (600) | Normal | `text-xl font-semibold` | Step titles |
| H6 | 18px / 1.125rem | Semibold (600) | Normal | `text-lg font-semibold` | Card titles, plan names |
| Body Large | 20px / 1.25rem | Normal (400) | Relaxed | `text-xl leading-relaxed` | Hero subheadline |
| Body | 18px / 1.125rem | Normal (400) | Relaxed | `text-lg leading-relaxed` | Section descriptions |
| Body Small | 16px / 1rem | Normal (400) | Relaxed | `text-base leading-relaxed` | Card descriptions |
| Caption | 14px / 0.875rem | Normal/Medium | Normal | `text-sm` | Labels, metadata, feature lists |
| Overline | 14px / 0.875rem | Semibold (600) | Normal | `text-sm font-semibold uppercase tracking-widest` | Section labels ("How It Works") |
| Micro | 12px / 0.75rem | Normal (400) | Normal | `text-xs` | Badges, helper text |

### Responsive Typography

Hero headlines scale responsively:
- Mobile: `text-5xl` (48px)
- Tablet: `sm:text-6xl` (60px)
- Desktop: `lg:text-7xl` (72px)

Section headers scale:
- Mobile: `text-3xl` (30px)
- Desktop: `sm:text-4xl` (36px)

---

## Spacing System

Aveo uses Tailwind's default 4px base spacing scale.

### Common Spacing Patterns

| Context | Value | Tailwind | Usage |
|---------|-------|----------|-------|
| Page horizontal padding | 16px / 24px / 32px | `px-4 sm:px-6 lg:px-8` | All sections |
| Page max width | 1280px | `max-w-7xl` | Content container |
| Narrow container | 672px | `max-w-2xl` | Section headers, centered text |
| Medium container | 1024px | `max-w-5xl` | Pricing cards, comparison table |
| Section vertical padding | 96px | `py-24` | Between major sections |
| Section top padding (hero) | 80px / 112px / 128px | `pt-20 sm:pt-28 lg:pt-32` | Hero section |
| Card padding | 32px | `p-8` | Feature cards, pricing cards, testimonials |
| Card gap | 24px / 32px | `gap-6` / `gap-8` | Grid gaps |
| Heading to body | 16px | `mt-4` | After section headers |
| Body to CTA | 40px | `mt-10` | Before call to action buttons |
| Icon to text | 20px | `mb-5` | Icon containers to heading |
| Element stack small | 8px to 12px | `space-y-3` | Feature lists, FAQ items |
| Element stack medium | 16px | `mt-4` or `gap-4` | Form fields, button groups |

### Grid System

| Layout | Columns | Tailwind | Usage |
|--------|---------|----------|-------|
| Feature cards | 1 / 2 / 3 | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` | Features section |
| Pricing cards | 1 / 3 | `grid-cols-1 md:grid-cols-3` | Pricing section |
| Testimonials | 1 / 3 | `grid-cols-1 md:grid-cols-3` | Social proof |
| Metrics bar | 2 / 4 | `grid-cols-2 md:grid-cols-4` | Stats display |
| How it works | 1 / 3 | `grid-cols-1 md:grid-cols-3` | Steps |

---

## Component Patterns

### Buttons

**Primary (Gradient)**
```
rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white
shadow-lg shadow-purple-600/25
hover:from-purple-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-purple-600/40
```
Sizes: h-12 px-8 (standard), h-14 px-10 (hero CTA)

**Secondary (Ghost/Dark)**
```
rounded-lg border border-gray-700 bg-white/5 text-gray-300 backdrop-blur-sm
hover:border-gray-600 hover:bg-white/10 hover:text-white
```

**Dashboard Primary**
```
rounded-lg bg-indigo-600 text-white hover:bg-indigo-700
```

**Dashboard Secondary**
```
rounded-lg bg-gray-100 text-gray-900 hover:bg-gray-200
```

**Dashboard Outline**
```
rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50
```

**Dashboard Ghost**
```
rounded-lg text-gray-700 hover:bg-gray-100
```

Button sizes: sm (h-8 px-3 text-xs), default (h-10 px-4), lg (h-12 px-6 text-base), icon (h-10 w-10)

### Cards

**Marketing Card (Feature/Testimonial)**
```
rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm
hover:border-purple-500/30 hover:bg-white/[0.07]
transition-all duration-300
```

**Pricing Card (Standard)**
```
rounded-2xl border border-white/10 bg-white/5 p-8
hover:border-white/20
transition-all duration-300
```

**Pricing Card (Highlighted)**
```
rounded-2xl border border-purple-500/50 p-8
bg-gradient-to-b from-purple-500/10 to-transparent
shadow-lg shadow-purple-500/10
scale-[1.02]
```

**"Most Popular" Badge (Pricing)**
```
absolute -top-4 left-1/2 -translate-x-1/2
rounded-full bg-gradient-to-r from-purple-600 to-indigo-600
px-4 py-1 text-sm font-semibold text-white
shadow-lg shadow-purple-500/25
```

### Icon Containers

**Step Icons (Large)**
```
h-24 w-24 rounded-2xl
border border-purple-500/20
bg-gradient-to-br from-purple-500/10 to-indigo-500/10
text-purple-400
```
With number badge:
```
absolute -right-2 -top-2
h-7 w-7 rounded-full bg-purple-600
text-xs font-bold text-white
```

**Feature Icons (Medium)**
```
rounded-xl border border-purple-500/20 bg-purple-500/10
p-3 text-purple-400
```

### Badges

**Status Badge (Header)**
```
rounded-full border border-purple-500/20 bg-purple-500/10
px-4 py-1.5 text-sm text-purple-300
```
With animated dot:
```
// Ping animation
absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400 opacity-75
// Solid dot
relative inline-flex h-2 w-2 rounded-full bg-purple-500
```

**Billing Toggle**
```
rounded-full border border-white/10 bg-white/5 p-1.5 backdrop-blur-sm
```
Active state: `rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg`
Inactive state: `text-gray-400 hover:text-white`

**Save Badge**
```
rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-semibold text-green-400
```

### FAQ Accordion

```
rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm
hover:border-white/20
transition-all duration-300
```
Chevron rotation: `transition-transform duration-300` with `rotate-180` when open.
Content animation: `overflow-hidden transition-all duration-300` toggling between `max-h-0` and `max-h-96`.

---

## Layout Principles

### Background Treatment (Marketing)

The marketing site uses a deep dark background (#0A0118) with decorative gradient orbs for visual depth.

**Background orbs pattern:**
```
pointer-events-none absolute
rounded-full blur-[128px] or blur-[100px]
```
Typical sizes: 300px to 600px
Colors: `bg-purple-600/20`, `bg-indigo-600/20`, `bg-violet-600/10`
Positioned with absolute positioning and transform utilities.

**Grid overlay (Hero only):**
```
bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),
    linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)]
bg-[size:64px_64px]
```

### Section Structure

Every marketing section follows this pattern:

```
<section className="relative bg-[#0A0118] py-24">
  {/* Background decorative elements (orbs) */}
  <div className="pointer-events-none absolute inset-0">
    {/* Gradient orbs */}
  </div>

  {/* Content container */}
  <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
    {/* Section header (centered) */}
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-purple-400">
        Section Label
      </p>
      <h2 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Section Title
      </h2>
      <p className="mt-4 text-lg text-gray-400">
        Section description
      </p>
    </div>

    {/* Content grid */}
    <div className="mt-16 grid ...">
      {/* Cards */}
    </div>
  </div>
</section>
```

### Header (Marketing)

Sticky header with scroll aware background transition:
- Default: `bg-transparent`
- Scrolled: `border-b border-white/10 bg-[#0A0118]/90 backdrop-blur-xl`

Navigation items: `text-sm font-medium text-gray-400 hover:text-white`

Logo: 32px rounded gradient square with "A" + "Aveo" text in white.

### Hero Section

Uses `overflow-hidden` to contain decorative elements. Contains:
1. Background gradient orbs (3 orbs)
2. Grid pattern overlay
3. Badge ("Now in public beta")
4. H1 with gradient text accent
5. Subheadline
6. Dual CTA buttons (primary gradient + secondary ghost)
7. Microcopy
8. Mock product visual (browser chrome frame)
9. Metrics bar

### Mock Product Visual (Hero)

Browser chrome frame:
```
rounded-2xl border border-white/10 bg-white/5
shadow-2xl shadow-purple-900/20 backdrop-blur-sm
```
Title bar with traffic light dots:
```
h-3 w-3 rounded-full bg-red-500/70 (and yellow, green)
```

---

## Dark Theme (Marketing) vs Light Theme (Dashboard) Guidelines

### When to Use Dark Theme
- Landing page (aveo.ai/)
- Pricing page (/pricing)
- Blog listing and posts (/blog)
- Login and registration pages
- Any public facing marketing page

### When to Use Light Theme
- Dashboard (/dashboard)
- Character management
- Video library
- Content calendar
- Settings and account pages
- Any authenticated in app experience

### Transition Between Themes
The themes are separated by route group in Next.js:
- `(marketing)` route group: Dark theme with MarketingHeader + MarketingFooter
- `(dashboard)` route group: Light theme with dashboard sidebar layout
- `(auth)` route group: Can use either theme depending on design preference

### Key Differences

| Property | Marketing (Dark) | Dashboard (Light) |
|----------|-----------------|-------------------|
| Background | #0A0118 | #FFFFFF |
| Text primary | #FFFFFF | #0F172A |
| Text secondary | #9CA3AF | #374151 |
| Card background | rgba(255,255,255,0.05) | #FFFFFF (with border) |
| Borders | rgba(255,255,255,0.1) | #E5E7EB |
| Primary action | Gradient (purple to indigo) | Solid indigo-600 |
| Corner radius | 2xl (16px) for cards | lg (8px) for buttons, xl (12px) for cards |
| Shadows | purple-600/25 glow | Standard gray shadows |
| Backdrop blur | Yes (glass morphism) | No |

### Accessibility Notes
- Dark theme: All text meets WCAG AA contrast ratio against #0A0118. Gray-400 (#9CA3AF) on dark = 5.2:1 ratio.
- Light theme: All text meets WCAG AA. Gray-700 (#374151) on white = 9.7:1 ratio.
- Interactive elements have visible focus rings (`focus-visible:ring-2`)
- All buttons have hover states with `transition-all duration-300`
- Disabled states use `opacity-50` with `pointer-events-none`

---

## Animation and Transition Patterns

| Pattern | Properties | Duration | Usage |
|---------|-----------|----------|-------|
| Card hover | border-color, background, shadow | 300ms | Feature cards, pricing cards |
| Button hover | background gradient, shadow | 300ms | All buttons |
| Header scroll | background, border, backdrop-blur | 300ms | Sticky header |
| FAQ accordion | max-height, chevron rotation | 300ms | FAQ expand/collapse |
| Badge ping | scale, opacity | CSS animation | "Live" indicator dots |
| Loading spinner | rotation | CSS animation | Button loading states |

All transitions use `transition-all duration-300` as the default pattern.

---

## Scrollbar Styling

Custom scrollbar for webkit browsers:

```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
```

---

## Responsive Breakpoints

Aveo uses Tailwind's default breakpoints:

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| (default) | 0px | Mobile first styles |
| sm | 640px | Tablet adjustments |
| md | 768px | Grid column changes, show/hide nav |
| lg | 1024px | Desktop layout, larger type |
| xl | 1280px | (reserved for future use) |

Key responsive patterns:
- Navigation: Mobile hamburger menu below md, inline nav at md+
- Grids: 1 column on mobile, 2 at sm, 3 at lg (features), or 3 at md (pricing)
- Hero: Single column, text scales from 5xl to 7xl
- Buttons: Stack vertically on mobile (`flex-col`), inline on sm+ (`sm:flex-row`)
