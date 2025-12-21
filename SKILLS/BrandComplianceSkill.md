# BrandComplianceSkill.md

## Brand Identity

- **Name:** Zavira Salon & Spa
- **Tone:** Modern, luxurious, professional yet approachable
- **Target:** Beauty-conscious customers seeking premium services

## CRITICAL: Theme Rules

### Public Website (Customer-Facing)

**Background:** BLACK (`bg-black` or `bg-slate-950`)

**Text:** WHITE with GLOW effect
```css
text-shadow: 0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,255,255,0.6), 0 0 30px rgba(255,255,255,0.4);
```
**Tailwind:** `drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]`

**Logo/Headings:** Cormorant Garamond (`font-serif`) with glow effect

### Staff Portal / Admin Dashboard

**Background:** WHITE (`bg-white`)

**Text:** BLACK (`text-black` or `text-slate-900`)

**Style:** Clean, professional - NO glow effects

## Color Palette

| Purpose | Color | Hex | Tailwind |
|---------|-------|-----|----------|
| Primary | Deep Purple | `#7c3aed` | `violet-600` |
| Secondary | Rose Gold | `#f43f5e` | `rose-500` |
| Accent | Emerald | `#10b981` | `emerald-500` |
| Public BG | Black | `#000000` | `black` / `slate-950` |
| Admin BG | White | `#ffffff` | `white` |
| Public Text | White Glow | `#ffffff` | with text-shadow |
| Admin Text | Black | `#0f172a` | `slate-900` |

## FORBIDDEN COLORS

❌ **NEVER USE:**
- Blue (`blue-*`, `sky-*`, `cyan-*`) - Use `violet-*` instead
- Teal (`teal-*`) - Use `emerald-*` instead

## ALLOWED COLOR FAMILIES

✅ **USE THESE:**
- `violet-*` / `purple-*` (primary)
- `rose-*` (secondary)
- `emerald-*` / `green-*` (accent)
- `amber-*` / `yellow-*` (requested status)
- `gray-*` / `slate-*` (neutral)
- `white` / `black` (backgrounds)
- `red-*` (errors/cancelled)
- `indigo-*` (completed status)
- `fuchsia-*` (personal tasks)

## Typography

| Font | Variable | Usage |
|------|----------|-------|
| **Cormorant Garamond** | `font-serif` | Headings, luxury text |
| **Inter** | `font-sans` | Body text, UI elements |
| **Playfair Display** | `font-script` | Decorative accents |
