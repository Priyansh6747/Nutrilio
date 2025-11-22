import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/theme/colors';

export function useColor(
  // The color key that must exist in both light and dark theme objects
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark,
  // Optional overrides for light and dark modes
  props?: { light?: string; dark?: string }
) {
  // Detect current theme (light or dark)
  const theme = useColorScheme() ?? 'light';

  // If the user provided an override color for the current theme, use it
  const colorFromProps = props?.[theme];

  if (colorFromProps) {
    // Return the override color
    return colorFromProps;
  } else {
    // Otherwise return the color from the theme definitions
    return Colors[theme][colorName];
  }
}
