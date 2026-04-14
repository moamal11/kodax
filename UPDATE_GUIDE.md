# 🚀 Quick Guide: Apply Updates to All Pages

## 📝 Steps to Update Any Page

### 1. Import the Hook
```tsx
import { useResponsiveLayout } from '@/hooks';
```

### 2. Use the Hook in Component
```tsx
export default function YourScreen() {
  const { contentPaddingTop, contentPaddingBottom, isLargeScreen, isWeb } = useResponsiveLayout();
  
  // ... rest of your component
}
```

### 3. Update SafeAreaView
```tsx
<SafeAreaView 
  style={styles.container}
  edges={isLargeScreen && isWeb ? [] : ['top']}
>
```

### 4. Update ScrollView/Content Container
```tsx
<ScrollView
  contentContainerStyle={[
    styles.scrollContent,
    { 
      paddingTop: contentPaddingTop,
      paddingBottom: contentPaddingBottom + 20 
    }
  ]}
>
```

### 5. Add CosmicBackground (Optional)
```tsx
import { CosmicBackground } from '@/components';

// في الـ SafeAreaView:
<CosmicBackground intensity={1} />
```

## 📄 Pages to Update

- [x] ✅ `app/(tabs)/index.tsx` - Home (Done)
- [ ] 🔄 `app/(tabs)/learn.tsx` - Learn
- [ ] 🔄 `app/(tabs)/ai.tsx` - AI Tutor
- [ ] 🔄 `app/(tabs)/code.tsx` - Code Editor
- [ ] 🔄 `app/(tabs)/challenges.tsx` - Challenges
- [ ] 🔄 `app/(tabs)/profile.tsx` - Profile

## 💡 Full Example

```tsx
import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CosmicBackground, ParticleBackground } from '@/components';
import { useResponsiveLayout } from '@/hooks';

export default function MyScreen() {
  const { 
    contentPaddingTop, 
    contentPaddingBottom, 
    isLargeScreen, 
    isWeb 
  } = useResponsiveLayout();

  return (
    <SafeAreaView 
      style={styles.container}
      edges={isLargeScreen && isWeb ? [] : ['top']}
    >
      {/* Background */}
      <CosmicBackground intensity={1} />
      <ParticleBackground density={25} color="#9333ea" speed={1} />

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { 
            paddingTop: contentPaddingTop,
            paddingBottom: contentPaddingBottom + 20
          }
        ]}
      >
        {/* Your content here */}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a15',
  },
  content: {
    padding: 20,
  },
});
```

## ⚡ Quick Commands

```bash
# Test on web
npx expo start --web

# Test on mobile
npx expo start

# Check for errors
npx tsc --noEmit
```

## 🎨 Color Reference

```typescript
// Dark backgrounds
'#050510', '#0a0a15', '#0f0f1a'

// Purple shades
'rgba(88, 28, 135, 0.15)'   // Dark Purple
'rgba(147, 51, 234, 0.12)'  // Purple
'rgba(168, 85, 247, 0.1)'   // Light Purple

// Accents
'#9333ea' // Main purple
'#a855f7' // Light purple
```

---

**Pro Tip:** استخدم `isLargeScreen` و `isWeb` للـ conditional rendering إذا تريد تصميم مختلف للويب!
