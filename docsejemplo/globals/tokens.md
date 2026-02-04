# Design Tokens - Doc Generator

## Brand Identity

**Nombre**: DocGen
**Tagline**: "De idea a documentación en segundos"
**Personalidad**: Profesional, minimalista, eficiente

---

## Color Palette

### Primary (Indigo)
| Token | Hex | Uso |
|-------|-----|-----|
| `primary-50` | `#EEF2FF` | Backgrounds sutiles |
| `primary-100` | `#E0E7FF` | Hover backgrounds |
| `primary-500` | `#6366F1` | Botones, links, acentos |
| `primary-600` | `#4F46E5` | Hover en botones |
| `primary-700` | `#4338CA` | Active/pressed states |

### Neutral (Gray)
| Token | Hex | Uso |
|-------|-----|-----|
| `gray-50` | `#F9FAFB` | Page background |
| `gray-100` | `#F3F4F6` | Card backgrounds, inputs |
| `gray-200` | `#E5E7EB` | Borders, dividers |
| `gray-400` | `#9CA3AF` | Placeholder text |
| `gray-500` | `#6B7280` | Secondary text, icons |
| `gray-700` | `#374151` | Body text |
| `gray-900` | `#111827` | Headings |

### Semantic
| Token | Hex | Uso |
|-------|-----|-----|
| `success` | `#10B981` | Éxito, completado |
| `success-light` | `#D1FAE5` | Background success |
| `warning` | `#F59E0B` | Advertencias |
| `warning-light` | `#FEF3C7` | Background warning |
| `error` | `#EF4444` | Errores |
| `error-light` | `#FEE2E2` | Background error |

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
| `text-xs` | 0.75rem (12px) | 400 | 1rem | Labels pequeños |
| `text-sm` | 0.875rem (14px) | 400 | 1.25rem | Secondary text, captions |
| `text-base` | 1rem (16px) | 400 | 1.5rem | Body text |
| `text-lg` | 1.125rem (18px) | 500 | 1.75rem | Subtítulos |
| `text-xl` | 1.25rem (20px) | 600 | 1.75rem | Section headers |
| `text-2xl` | 1.5rem (24px) | 700 | 2rem | Page titles |
| `text-3xl` | 1.875rem (30px) | 700 | 2.25rem | Hero heading |

### Font Weights
- `normal`: 400 - Body text
- `medium`: 500 - Emphasis, labels
- `semibold`: 600 - Buttons, subheadings
- `bold`: 700 - Headings

---

## Spacing System

Basado en múltiplos de 4px (Tailwind default):

| Token | Value | Uso común |
|-------|-------|-----------|
| `space-1` | 0.25rem (4px) | Gaps mínimos |
| `space-2` | 0.5rem (8px) | Entre iconos y texto |
| `space-3` | 0.75rem (12px) | Padding inputs |
| `space-4` | 1rem (16px) | Gap entre elementos |
| `space-6` | 1.5rem (24px) | Padding cards |
| `space-8` | 2rem (32px) | Margin entre secciones |
| `space-12` | 3rem (48px) | Separación major |
| `space-16` | 4rem (64px) | Hero padding |

---

## Border & Radius

### Border Width
- `border`: 1px - Inputs, cards
- `border-2`: 2px - Focus rings

### Border Radius
| Token | Value | Uso |
|-------|-------|-----|
| `rounded-sm` | 0.25rem (4px) | Badges, tags |
| `rounded` | 0.375rem (6px) | Buttons, inputs |
| `rounded-md` | 0.5rem (8px) | Cards, modals |
| `rounded-lg` | 0.75rem (12px) | Containers grandes |
| `rounded-full` | 9999px | Avatars, pills |

---

## Shadows

| Token | Value | Uso |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Inputs, subtle lift |
| `shadow` | `0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)` | Cards |
| `shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Dropdowns, popovers |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals |
| `shadow-inner` | `inset 0 2px 4px rgba(0,0,0,0.06)` | Pressed states |

---

## Transitions

| Token | Value | Uso |
|-------|-------|-----|
| `transition-fast` | `150ms ease-in-out` | Hover states |
| `transition-base` | `200ms ease-in-out` | Most interactions |
| `transition-slow` | `300ms ease-in-out` | Modals, expansions |
| `transition-colors` | `colors 150ms` | Color changes only |

---

## Z-Index Scale

| Token | Value | Uso |
|-------|-------|-----|
| `z-0` | 0 | Base |
| `z-10` | 10 | Sticky headers |
| `z-20` | 20 | Dropdowns |
| `z-30` | 30 | Fixed elements |
| `z-40` | 40 | Modals backdrop |
| `z-50` | 50 | Modals, toasts |

---

## Breakpoints

| Token | Min Width | Descripción |
|-------|-----------|-------------|
| `sm` | 640px | Mobile landscape |
| `md` | 768px | Tablets |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large desktop |

---

## Tailwind Config Snippet

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
        },
      },
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
}
```
