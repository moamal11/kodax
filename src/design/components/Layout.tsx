import React from 'react';
import { View, type ViewProps, type ViewStyle, type StyleProp } from 'react-native';

type Gap = number;
type Common = ViewProps & {
  gap?: Gap;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  wrap?: boolean;
  flex?: number;
  style?: StyleProp<ViewStyle>;
};

/** صف من اليمين لليسار (أول عنصر على اليمين) */
export function Row({ gap = 0, align = 'center', justify, wrap, flex, style, ...rest }: Common) {
  return <View {...rest} style={[{ flexDirection: 'row-reverse', alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? 'wrap' : undefined, flex }, style]} />;
}

/** صف من اليسار لليمين (للمحتوى التقني: كود، أرقام LTR) */
export function RowLTR({ gap = 0, align = 'center', justify, wrap, flex, style, ...rest }: Common) {
  return <View {...rest} style={[{ flexDirection: 'row', alignItems: align, justifyContent: justify, gap, flexWrap: wrap ? 'wrap' : undefined, flex }, style]} />;
}

export function Col({ gap = 0, align, justify, flex, style, ...rest }: Common) {
  return <View {...rest} style={[{ flexDirection: 'column', alignItems: align, justifyContent: justify, gap, flex }, style]} />;
}

export const Spacer = ({ size = 0, flex }: { size?: number; flex?: number }) => <View style={flex ? { flex } : { width: size, height: size }} />;
