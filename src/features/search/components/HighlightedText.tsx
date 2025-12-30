import React, { memo } from 'react';
import { Text, useTheme } from 'react-native-paper';

interface HighlightedTextProps {
  text: string;
  matchStart: number;
  matchEnd: number;
  numberOfLines?: number;
  variant?: 'bodyMedium' | 'bodySmall' | 'titleMedium' | 'labelLarge';
}

function HighlightedTextComponent({
  text,
  matchStart,
  matchEnd,
  numberOfLines = 1,
  variant = 'bodyMedium',
}: HighlightedTextProps) {
  const theme = useTheme();

  // Split text into three parts: before, match, after
  const beforeMatch = text.substring(0, matchStart);
  const match = text.substring(matchStart, matchEnd);
  const afterMatch = text.substring(matchEnd);

  return (
    <Text variant={variant} numberOfLines={numberOfLines}>
      <Text style={{ color: theme.colors.onSurface }}>{beforeMatch}</Text>
      <Text
        style={{
          color: theme.colors.primary,
          fontWeight: '700',
          backgroundColor: theme.colors.primaryContainer,
        }}
      >
        {match}
      </Text>
      <Text style={{ color: theme.colors.onSurface }}>{afterMatch}</Text>
    </Text>
  );
}

export const HighlightedText = memo(HighlightedTextComponent);
