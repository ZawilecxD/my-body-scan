import { Tabs } from 'expo-router';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TAB_ICONS: Record<string, NonNullable<SymbolViewProps['name']>> = {
  index: { ios: 'figure.stand', android: 'accessibility_new', web: 'accessibility_new' },
  illnesses: { ios: 'cross.case.fill', android: 'assignment', web: 'assignment' },
  archive: { ios: 'clock.arrow.circlepath', android: 'history', web: 'history' },
};

function AppTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.tabBar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.outlineVariant,
          paddingBottom: Math.max(insets.bottom, Spacing.spaceXs),
        },
      ]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label =
          typeof options.tabBarLabel === 'string'
            ? options.tabBarLabel
            : typeof options.title === 'string'
              ? options.title
              : route.name;
        const icon = TAB_ICONS[route.name] ?? TAB_ICONS.index;
        const color = focused ? theme.onSecondaryContainer : theme.onSurfaceVariant;

        return (
          <Pressable
            key={route.key}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
            accessibilityLabel={options.tabBarAccessibilityLabel ?? label}
            hitSlop={Spacing.one}
            onPress={() => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            }}
            style={({ pressed }) => [
              styles.tabItem,
              focused && {
                backgroundColor: theme.secondaryContainer,
              },
              pressed && styles.pressed,
            ]}>
            <SymbolView
              name={icon}
              size={22}
              tintColor={color}
              fallback={
                <ThemedText type="labelMd" style={{ color }}>
                  •
                </ThemedText>
              }
            />
            <ThemedText type="labelMd" style={{ color, fontFamily: Fonts.bodyMedium }}>
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      tabBar={(props) => <AppTabBar {...props} />}
      screenOptions={{
        headerShadowVisible: false,
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.onSurface,
        headerTitleStyle: {
          fontFamily: Fonts.display,
          fontSize: 20,
          fontWeight: '600',
        },
        headerRightContainerStyle: {
          paddingRight: Spacing.spaceSm,
        },
        sceneStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Injuries',
          tabBarLabel: 'Injuries',
        }}
      />
      <Tabs.Screen
        name="illnesses"
        options={{
          title: 'Illnesses',
          tabBarLabel: 'Illnesses',
        }}
      />
      <Tabs.Screen
        name="archive"
        options={{
          title: 'Archive',
          tabBarLabel: 'Archive',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.spaceXs,
    paddingTop: Spacing.spaceXs,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: Spacing.space2xs,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.space2xs,
    paddingHorizontal: Spacing.spaceMd,
    borderRadius: Radii.full,
  },
  pressed: {
    opacity: 0.85,
  },
});
