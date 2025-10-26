# NS App

Expo React Native app with TypeScript, NativeWind (Tailwind), and **Gluestack UI** for styling.

## Brand Assets

**Font:** Poppins (Regular, Medium, SemiBold, Bold)  
**Colors:** Blue `#155DFC`, Light Blue `#F2F8FF`, Grey `#ECECF0`, Red `#EA222B`, Black `#030213`, White Smoke `#F3F3F5`

## Setup

1. **Install:** `npm install`
2. **Add fonts:** Download Poppins fonts from [Google Fonts](https://fonts.google.com/specimen/Poppins) → place in `assets/fonts/`:
   - `Poppins-Regular.ttf`
   - `Poppins-Medium.ttf`
   - `Poppins-SemiBold.ttf`
   - `Poppins-Bold.ttf`
3. **Run:** `npm run start` (or `android`/`ios`/`web`)

## Usage

**Styling Library:** Gluestack UI + NativeWind (Tailwind classes)

**Pre-built Components:**
```tsx
import { Typography, Button } from '@/components/ui';

<Typography variant="h1" color="#155DFC">Heading</Typography>
<Button title="Click me" variant="primary" onPress={() => {}} />
```

**Fonts:**
```tsx
<Text className="font-poppins-bold">Bold text</Text>
<Text style={{fontFamily: 'Poppins-Regular'}}>Regular text</Text>
```

**Colors:**
```tsx
<View className="bg-brand-blue">
  <Text className="text-brand-black">Blue background, black text</Text>
</View>
```

**Available classes:** `font-poppins`, `font-poppins-medium`, `font-poppins-semibold`, `font-poppins-bold`  
**Available colors:** `bg-brand-blue`, `text-brand-blue`, `bg-brand-light-blue`, `bg-brand-grey`, `bg-brand-red`, `bg-brand-black`, `bg-brand-white-smoke`

## Troubleshooting

- **Fonts not loading:** Check `assets/fonts/` directory has all 4 Poppins files
- **Cache issues:** `npm run start -- --clear`
- **Build issues:** Delete `node_modules` → `npm install`
