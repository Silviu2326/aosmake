# Design Tokens - AOS Studio

## Brand Identity

**Nombre**: AOS Studio
**Tagline**: "Agentic Outbound System"
**Personalidad**: Profesional, oscuro, tecnico, potente

---

## Color Palette

### Primary (Cyan/Accent)
| Token | Hex | Uso |
|-------|-----|-----|
| `accent` | `#06b6d4` | Botones primarios, links, acentos |
| `accent-hover` | `#0891b2` | Hover en botones |
| `accent/10` | `rgba(6,182,212,0.1)` | Backgrounds sutiles |
| `accent/20` | `rgba(6,182,212,0.2)` | Hover backgrounds |

### Surface (Dark Theme)
| Token | Hex | Uso |
|-------|-----|-----|
| `background` | `#0D0D0D` | Page background principal |
| `surface` | `#111111` | Cards, panels, modals |
| `surfaceHighlight` | `#1a1a1a` | Elementos elevados, inputs |
| `border` | `rgba(255,255,255,0.05)` | Bordes sutiles |
| `border-hover` | `rgba(255,255,255,0.1)` | Bordes en hover |

### Text
| Token | Hex | Uso |
|-------|-----|-----|
| `text-white` | `#FFFFFF` | Headings, texto importante |
| `text-gray-200` | `#E5E7EB` | Body text principal |
| `text-gray-300` | `#D1D5DB` | Body text secundario |
| `text-gray-400` | `#9CA3AF` | Labels, placeholders |
| `text-gray-500` | `#6B7280` | Texto deshabilitado |
| `text-gray-600` | `#4B5563` | Texto muy sutil |

### Semantic - Status
| Token | Hex | Uso |
|-------|-----|-----|
| `green-400` | `#4ADE80` | Success, activo, verificado |
| `green-500` | `#22C55E` | Success intenso |
| `green-500/10` | `rgba(34,197,94,0.1)` | Background success |
| `yellow-400` | `#FACC15` | Warning, pendiente |
| `yellow-500` | `#EAB308` | Warning intenso |
| `red-400` | `#F87171` | Error, fallido |
| `red-500` | `#EF4444` | Error intenso |
| `blue-400` | `#60A5FA` | Info, running, PreCrafter |
| `blue-500` | `#3B82F6` | Info intenso |
| `purple-400` | `#A855F7` | Spec, contratos |
| `purple-500` | `#8B5CF6` | Purple intenso |

### Node Status Colors
| Status | Color | Background |
|--------|-------|------------|
| `idle` | `gray-400` | `white/5` |
| `running` | `blue-400` | `blue-500/10` |
| `success` | `green-400` | `green-500/10` |
| `warning` | `yellow-400` | `yellow-500/10` |
| `error` | `red-400` | `red-500/10` |
| `waiting` | `yellow-500` | `yellow-500/10` |

---

## Typography

### Font Stack
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', Consolas, monospace;
```

### Scale
| Token | Size | Weight | Line Height | Uso |
|-------|------|--------|-------------|-----|
| `text-[9px]` | 9px | 400 | 1 | Micro labels |
| `text-[10px]` | 10px | 400-500 | 1.2 | Badges, timestamps |
| `text-xs` | 12px | 400-500 | 1.25rem | Labels, secondary |
| `text-sm` | 14px | 400-500 | 1.25rem | Body text, buttons |
| `text-base` | 16px | 400 | 1.5rem | Body principal |
| `text-lg` | 18px | 600 | 1.75rem | Section headers |
| `text-xl` | 20px | 600 | 1.75rem | Page titles |
| `text-2xl` | 24px | 700 | 2rem | Hero titles |

### Font Weights
- `normal`: 400 - Body text
- `medium`: 500 - Labels, emphasis
- `semibold`: 600 - Buttons, subheadings
- `bold`: 700 - Headings

---

## Spacing System

Basado en multiplos de 4px (Tailwind default):

| Token | Value | Uso comun |
|-------|-------|-----------|
| `space-0.5` | 2px | Gaps minimos |
| `space-1` | 4px | Entre iconos |
| `space-1.5` | 6px | Padding botones pequenos |
| `space-2` | 8px | Gap interno |
| `space-3` | 12px | Padding inputs |
| `space-4` | 16px | Gap entre elementos |
| `space-6` | 24px | Padding cards |
| `space-8` | 32px | Margin secciones |
| `space-12` | 48px | Separacion major |
| `space-14` | 56px | Header height |

---

## Border & Radius

### Border Width
- `border`: 1px - Default
- `border-2`: 2px - Focus rings
- `border-l-2`: 2px left - Active tabs

### Border Radius
| Token | Value | Uso |
|-------|-------|-----|
| `rounded` | 4px | Buttons, inputs |
| `rounded-md` | 6px | Cards pequenas |
| `rounded-lg` | 8px | Cards, modals |
| `rounded-full` | 9999px | Badges, avatars, dots |

---

## Shadows

| Token | Value | Uso |
|-------|-------|-----|
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.3)` | Cards elevadas |
| `shadow-xl` | `0 20px 25px rgba(0,0,0,0.4)` | Modals |
| `shadow-2xl` | `0 25px 50px rgba(0,0,0,0.5)` | Panels flotantes |
| `shadow-glow` | `0 0 8px rgba(color,0.4)` | Status indicators |

---

## Transitions

| Token | Value | Uso |
|-------|-------|-----|
| `transition-colors` | `colors 150ms` | Color changes |
| `transition-all` | `all 200ms ease-in-out` | General |
| `duration-100` | `100ms` | Micro interactions |
| `duration-200` | `200ms` | Standard |
| `duration-300` | `300ms` | Panels, modals |

---

## Z-Index Scale

| Token | Value | Uso |
|-------|-------|-----|
| `z-0` | 0 | Base content |
| `z-10` | 10 | Toolbars flotantes |
| `z-20` | 20 | Inspector panel |
| `z-30` | 30 | Console |
| `z-40` | 40 | Context menus |
| `z-50` | 50 | Modals, overlays |

---

## Breakpoints

| Token | Min Width | Descripcion |
|-------|-----------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |
| `2xl` | 1536px | Extra large |

---

## Tailwind Config Snippet

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        background: '#0D0D0D',
        surface: '#111111',
        surfaceHighlight: '#1a1a1a',
        border: 'rgba(255,255,255,0.05)',
        accent: '#06b6d4',
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
}
```
