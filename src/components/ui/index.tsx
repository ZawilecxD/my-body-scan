import { type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const HIT_SLOP = Spacing.one;

type AppButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost';

export type AppButtonProps = Omit<PressableProps, 'children'> & {
  label: string;
  variant?: AppButtonVariant;
};

export function AppButton({
  label,
  variant = 'primary',
  style,
  disabled,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const palette = buttonPalette(theme, variant);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: palette.background,
          borderColor: palette.border,
          borderWidth: palette.borderWidth,
          opacity: disabled ? 0.4 : pressed ? 0.85 : 1,
        },
        style as StyleProp<ViewStyle>,
      ]}
      {...rest}>
      <Text style={[styles.buttonLabel, { color: palette.label }]}>{label}</Text>
    </Pressable>
  );
}

function buttonPalette(
  theme: ReturnType<typeof useTheme>,
  variant: AppButtonVariant,
): { background: string; label: string; border: string; borderWidth: number } {
  switch (variant) {
    case 'secondary':
      return {
        background: theme.surfaceContainerLow,
        label: theme.onSurface,
        border: 'transparent',
        borderWidth: 0,
      };
    case 'destructive':
      return {
        background: 'transparent',
        label: theme.error,
        border: theme.error,
        borderWidth: 1,
      };
    case 'ghost':
      return {
        background: 'transparent',
        label: theme.onSurface,
        border: theme.outlineVariant,
        borderWidth: 1,
      };
    case 'primary':
    default:
      return {
        background: theme.primaryContainer,
        label: theme.onPrimary,
        border: 'transparent',
        borderWidth: 0,
      };
  }
}

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.segmentTrack,
        {
          backgroundColor: theme.surfaceContainerLow,
          borderColor: theme.outlineVariant,
        },
        style,
      ]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            hitSlop={HIT_SLOP}
            onPress={() => onChange(option.value)}
            style={({ pressed }) => [
              styles.segmentItem,
              selected && {
                backgroundColor: theme.surfaceContainerLowest,
                shadowColor: theme.onSurface,
                shadowOpacity: 0.06,
                shadowRadius: 2,
                shadowOffset: { width: 0, height: 1 },
                elevation: 1,
              },
              pressed && !selected && { opacity: 0.7 },
            ]}>
            <ThemedText
              type="labelMd"
              themeColor={selected ? 'onSurface' : 'secondary'}
              style={selected ? styles.segmentLabelSelected : undefined}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

export type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
};

export function Card({ children, style, elevated = false }: CardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surfaceContainerLowest,
          borderColor: theme.outlineVariant,
          shadowColor: theme.onSurface,
          shadowOpacity: elevated ? 0.07 : 0.04,
          shadowRadius: elevated ? 6 : 3,
          shadowOffset: { width: 0, height: elevated ? 4 : 1 },
          elevation: elevated ? 2 : 1,
        },
        style,
      ]}>
      {children}
    </View>
  );
}

export type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
};

export function Chip({ label, selected = false, onPress, style, textStyle }: ChipProps) {
  const theme = useTheme();

  const body = (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: selected ? theme.primaryFixed : theme.surfaceContainerLow,
          borderColor: selected ? theme.primary : theme.outlineVariant,
        },
        style,
      ]}>
      <ThemedText
        type="dataSm"
        themeColor={selected ? 'primary' : 'secondary'}
        style={textStyle}>
        {label}
      </ThemedText>
    </View>
  );

  if (onPress == null) {
    return body;
  }

  return (
    <Pressable
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      onPress={onPress}
      style={({ pressed }) => pressed && { opacity: 0.75 }}>
      {body}
    </Pressable>
  );
}

export type TextFieldProps = TextInputProps & {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({ label, containerStyle, style, ...rest }: TextFieldProps) {
  const theme = useTheme();

  return (
    <View style={containerStyle}>
      {label != null ? (
        <ThemedText type="labelMd" themeColor="secondary" style={styles.fieldLabel}>
          {label}
        </ThemedText>
      ) : null}
      <TextInput
        placeholderTextColor={theme.secondary}
        style={[
          styles.fieldInput,
          {
            color: theme.onSurface,
            backgroundColor: theme.surfaceBright,
            borderColor: theme.outlineVariant,
          },
          style,
        ]}
        {...rest}
      />
    </View>
  );
}

export type IconButtonProps = PressableProps & {
  accessibilityLabel: string;
  children: ReactNode;
  size?: number;
};

export function IconButton({
  accessibilityLabel,
  children,
  size = 40,
  style,
  ...rest
}: IconButtonProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      hitSlop={HIT_SLOP}
      style={({ pressed }) => [
        styles.iconButton,
        {
          width: size,
          height: size,
          borderRadius: Radii.md,
          backgroundColor: pressed ? theme.surfaceContainer : 'transparent',
        },
        style as StyleProp<ViewStyle>,
      ]}
      {...rest}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: Spacing.spaceMd,
    borderRadius: Radii.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLabel: {
    fontFamily: Fonts.bodyMedium,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '500',
  },
  segmentTrack: {
    flexDirection: 'row',
    borderRadius: Radii.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: Spacing.spaceSm,
    borderRadius: Radii.DEFAULT,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentLabelSelected: {
    fontWeight: '600',
  },
  card: {
    borderRadius: Radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: Spacing.spaceMd,
  },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.spaceXs,
    paddingVertical: 4,
    borderRadius: Radii.DEFAULT,
    borderWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    marginBottom: 6,
  },
  fieldInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.spaceSm,
    paddingVertical: Spacing.spaceXs,
    fontFamily: Fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
