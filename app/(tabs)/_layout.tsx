import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadows, spacing } from '@/theme';

/**
 * Custom Tab Bar Icon with active indicator
 */
interface TabIconProps {
  name: keyof typeof MaterialCommunityIcons.glyphMap;
  activeName?: keyof typeof MaterialCommunityIcons.glyphMap;
  color: string;
  focused: boolean;
  size: number;
}

function TabIcon({ name, activeName, color, focused, size }: TabIconProps) {
  const iconName = focused && activeName ? activeName : name;
  
  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <MaterialCommunityIcons 
        name={iconName} 
        size={size} 
        color={color}
        style={focused && styles.iconActive}
      />
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
}

/**
 * Premium Tabs Layout
 * 
 * A sophisticated bottom navigation with:
 * - Subtle blur effect
 * - Active state indicators
 * - Premium shadows
 * - Smooth transitions
 */
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.tertiary,
        tabBarShowLabel: true,
        tabBarStyle: [
          styles.tabBar,
          {
            paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 6),
            height: (Platform.OS === 'ios' ? 60 : 56) + Math.max(insets.bottom, Platform.OS === 'ios' ? 8 : 6),
          },
        ],
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Documents',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="file-document-multiple-outline"
              activeName="file-document-multiple"
              color={color}
              size={24}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="resumes"
        options={{
          title: 'Resumes',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="file-account-outline"
              activeName="file-account"
              color={color}
              size={24}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          title: 'Create',
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              name="plus-circle-outline"
              activeName="plus-circle"
              color={color}
              size={24}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background.paper,
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.xs,
    ...shadows.md,
    elevation: 12,
  },
  tabBarItem: {
    paddingTop: spacing.xxs,
    paddingBottom: spacing.xxs,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 2,
    marginBottom: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 48,
    height: 32,
  },
  iconContainerActive: {
    // Subtle scale for active state
  },
  iconActive: {
    // Icon styling when active
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary.main,
  },
});