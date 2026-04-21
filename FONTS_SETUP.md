# Font System Setup - PramanaAI

## Overview
Complete font system implementation using **DM Sans** family with centralized management and automatic application across all components.

---

## ✅ Implementation Summary

### 1. **Font Configuration** (`lib/theme.ts`)
```typescript
export const FONTS = {
  regular: 'DMSans-Regular',
  medium: 'DMSans-Medium',
  semibold: 'DMSans-SemiBold',
  italic: 'DMSans-Italic',
};

export const FONT_VARIANTS = {
  default: 'regular',
  p: 'regular',
  h1: 'semibold',
  h2: 'semibold',
  h3: 'semibold',
  h4: 'semibold',
  // ... more variants
};
```

### 2. **Font Loading** (`app/_layout.tsx`)
- Fonts loaded globally using `expo-font` via `useFonts` hook
- App render prevented until fonts are fully loaded
- `SplashScreen` managed appropriately

### 3. **Text Component** (`components/ui/text.tsx`)
- All text variants automatically use correct fonts
- No need to pass `fontFamily` when using the Text component
- Supports all variants: h1-h4, p, lead, small, muted, large, blockquote, code

### 4. **Markdown Rendering** (`src/utils/markdownStyles.ts`)
- `createMarkdownStyles()` utility for consistent markdown styling
- Automatically applies fonts to markdown elements:
  - **body, paragraph, list_item** → DMSans-Regular
  - **heading1-4, strong** → DMSans-SemiBold
  - **em, blockquote** → DMSans-Italic
  - **code_inline, code_block** → Monospace (platform-specific)

### 5. **Font Utilities** (`src/hooks/useFont.ts`)
- `useFont(variant)` - Get fontFamily for a variant
- `getFontStyle(variant)` - Get style object with fontFamily
- `createFontStyle(variant, customStyle)` - Combine fonts with custom styles

---

## 🎯 Usage Examples

### Using Text Component
```typescript
import { Text } from '@/components/ui/text';

// Automatic font application based on variant
<Text variant="h1">Heading</Text>           {/* DMSans-SemiBold */}
<Text variant="p">Paragraph</Text>           {/* DMSans-Regular */}
<Text variant="small">Small text</Text>    {/* DMSans-Medium */}
```

### Using Markdown
```typescript
import Markdown from 'react-native-markdown-display';
import { createMarkdownStyles } from '@/src/utils/markdownStyles';

<Markdown style={createMarkdownStyles()}>
  # Heading (uses DMSans-SemiBold)
  Regular text (uses DMSans-Regular)
  **Bold** (uses DMSans-SemiBold)
  *Italic* (uses DMSans-Italic)
</Markdown>
```

### Using Font Utilities
```typescript
import { useFont, getFontStyle, createFontStyle } from '@/src/hooks/useFont';

// Get font family
const fontFamily = useFont('h1'); // Returns 'DMSans-SemiBold'

// Get style object
const style = getFontStyle('p'); // { fontFamily: 'DMSans-Regular' }

// Combine with custom styles
const customStyle = createFontStyle('h2', { fontSize: 20, color: '#111' });
```

---

## 📋 Font Variant Mapping

| Variant | Font | Use Case |
|---------|------|----------|
| `default` | Regular | Base text |
| `p` | Regular | Paragraphs |
| `lead` | Regular | Lead/intro text |
| `muted` | Regular | Muted text |
| `h1` | SemiBold | Large headings |
| `h2` | SemiBold | Medium headings |
| `h3` | SemiBold | Small headings |
| `h4` | SemiBold | Extra small headings |
| `large` | SemiBold | Large emphasis |
| `small` | Medium | Small text |
| `code` | Medium | Code snippets |
| `blockquote` | Italic | Quotes |

---

## 🔍 How It Works

### Font Loading Flow
1. App starts → `useFonts` hook loads all fonts from `assets/fonts/`
2. Fonts cached in device memory
3. `SplashScreen.hideAsync()` called when fonts ready
4. App renders only when `fontsLoaded === true`

### Font Application Flow
1. Component receives `variant` prop (e.g., `<Text variant="h1">`)
2. `getFontFamily()` looks up variant in `FONT_VARIANTS`
3. Returns appropriate font from `FONTS` object
4. `fontFamily` style applied to rendered text
5. Platform-specific fonts handled automatically

### Markdown Rendering Flow
1. `createMarkdownStyles()` creates style object
2. Each markdown element gets corresponding font
3. Platform-specific monospace fonts for code blocks
4. Custom overrides possible via spread operator

---

## 📦 File Structure

```
assets/fonts/
├── DMSans-Regular.ttf      (Default body text)
├── DMSans-Medium.ttf       (Buttons, small text)
├── DMSans-SemiBold.ttf     (Headings, emphasis)
└── DMSans-Italic.ttf       (Blockquotes, emphasis)

lib/
└── theme.ts                (FONTS, FONT_VARIANTS configs)

components/ui/
└── text.tsx                (Font-aware Text component)

src/
├── hooks/
│   └── useFont.ts          (Font utility hooks)
└── utils/
    └── markdownStyles.ts   (Markdown styling utility)

app/
└── _layout.tsx             (Font loading & initialization)
```

---

## ✨ Features

✅ **Global Font Loading** - All fonts loaded once at app startup  
✅ **Zero Configuration** - Text component automatically applies fonts  
✅ **Type Safe** - TypeScript variants for IDE autocomplete  
✅ **Reusable Utilities** - `createMarkdownStyles()` & font hooks  
✅ **Platform Aware** - Different fonts for iOS/Android code blocks  
✅ **Production Ready** - Minimal, clean, and optimized code  
✅ **Easy Extensibility** - Add new fonts or variants easily  

---

## 🚀 Adding New Fonts

1. Add TTF file to `assets/fonts/`
2. Update `FONTS` in `lib/theme.ts`:
   ```typescript
   export const FONTS = {
     // ...existing fonts
     bold: 'DMSans-Bold', // New
   };
   ```
3. Update font loading in `app/_layout.tsx`:
   ```typescript
   const [fontsLoaded] = Font.useFonts({
     // ...existing fonts
     [FONTS.bold]: require('@/assets/fonts/DMSans-Bold.ttf'),
   });
   ```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Fonts not applying | Ensure app fully reloaded after adding fonts |
| Splash screen stuck | Check `SplashScreen.hideAsync()` is called |
| Custom fonts not found | Verify TTF files in `assets/fonts/` |
| Wrong font applying | Check `FONT_VARIANTS` mapping for variant |

---

## 📝 Notes

- **DMSans-Regular.ttf** is the default for all text
- **No hardcoded fontWeight** - Use fonts instead
- **Markdown styling is centralized** - Easy to update globally
- **All native platforms supported** - iOS, Android, Web
