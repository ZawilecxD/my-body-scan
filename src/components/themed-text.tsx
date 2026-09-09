import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { ThemeColor, TypeRole, TypeRoles } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/** Legacy `type` values map onto Stitch type roles until screens are restyled. */
const LEGACY_TO_ROLE: Record<
  'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code',
  TypeRole
> = {
  default: 'bodyLg',
  title: 'headlineLg',
  subtitle: 'headlineMd',
  small: 'bodyMd',
  smallBold: 'titleMd',
  link: 'labelMd',
  linkPrimary: 'labelMd',
  code: 'dataSm',
};

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'title'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'link'
    | 'linkPrimary'
    | 'code'
    | TypeRole;
  themeColor?: ThemeColor;
};

function resolveRole(type: NonNullable<ThemedTextProps['type']>): TypeRole {
  if (type in LEGACY_TO_ROLE) {
    return LEGACY_TO_ROLE[type as keyof typeof LEGACY_TO_ROLE];
  }
  return type as TypeRole;
}

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const role = resolveRole(type);
  const roleStyle = TypeRoles[role] as TextStyle;
  const usesPrimary = type === 'linkPrimary';

  return (
    <Text
      style={[
        roleStyle,
        { color: usesPrimary ? theme.primary : theme[themeColor ?? 'text'] },
        style,
      ]}
      {...rest}
    />
  );
}

/** Kept for call sites that import StyleSheet helpers; prefer TypeRoles. */
export const themedTextStyles = StyleSheet.create(
  Object.fromEntries(
    (Object.keys(TypeRoles) as TypeRole[]).map((key) => [key, TypeRoles[key]]),
  ) as Record<TypeRole, TextStyle>,
);
