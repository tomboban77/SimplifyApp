# App Theme System

A world-class, centralized theme system for consistent design across the entire application.

## Structure

```
src/theme/
├── colors.ts      # Color palette definitions
├── index.ts       # React Native Paper theme configuration
├── styles.ts      # Common style utilities
└── README.md      # This file
```

## Usage

### Using Theme Colors

```typescript
import { colors } from '@/theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.default,
    borderColor: colors.border.main,
  },
  text: {
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary.main,
  },
});
```

### Using Theme in React Native Paper Components

The theme is automatically applied to all React Native Paper components via `PaperProvider` in `app/_layout.tsx`.

```typescript
import { useTheme } from 'react-native-paper';

function MyComponent() {
  const theme = useTheme();
  
  return (
    <View style={{ backgroundColor: theme.colors.surface }}>
      <Text style={{ color: theme.colors.onSurface }}>
        Themed text
      </Text>
    </View>
  );
}
```

### Using Theme Utilities

```typescript
import { shadows, borderRadius, spacing, containers, textStyles } from '@/theme/styles';

const styles = StyleSheet.create({
  card: {
    ...containers.card,
    padding: spacing.md,
  },
  title: {
    ...textStyles.heading,
    marginBottom: spacing.md,
  },
  shadowed: {
    ...shadows.medium,
  },
});
```

## Color Palette

### Primary Colors
- **Main**: Indigo 500 (`#6366F1`) - Modern, professional, trustworthy
- **Light**: Indigo 400 - Lighter variant
- **Dark**: Indigo 600 - Darker variant

### Secondary Colors
- **Main**: Teal 500 (`#14B8A6`) - Fresh, modern accent
- **Light**: Teal 300 - Light accent
- **Dark**: Teal 600 - Dark accent

### Background Colors
- **Default**: Neutral 50 - Main background
- **Paper**: White - Card/surface background
- **Elevated**: Neutral 100 - Elevated surfaces

### Status Colors
- **Success**: Green 500
- **Error**: Red 500
- **Warning**: Amber 500
- **Info**: Blue 500

## Best Practices

1. **Always use theme colors** - Never hardcode colors in components
2. **Use semantic color names** - `colors.primary.main` not `colors.blue`
3. **Leverage theme utilities** - Use `shadows`, `borderRadius`, `spacing` from `styles.ts`
4. **Consistent spacing** - Use spacing constants instead of magic numbers
5. **Accessibility** - Theme colors are chosen for WCAG AA compliance

## Updating Colors

To change the app's color scheme:

1. Edit `src/theme/colors.ts`
2. Update the color values
3. The changes will automatically apply throughout the app

## Future Enhancements

- Dark mode support (dark theme already configured)
- Theme switching functionality
- Custom theme variants

