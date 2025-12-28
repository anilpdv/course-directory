import React, { ReactNode } from 'react';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { paperTheme } from '@shared/theme';
import { CoursesProvider } from '@shared/contexts/CoursesContext';
import { ProgressProvider } from '@shared/contexts/ProgressContext';
import { TagsProvider } from '@shared/contexts/TagsContext';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <PaperProvider theme={paperTheme}>
      <SafeAreaProvider>
        <CoursesProvider>
          <ProgressProvider>
            <TagsProvider>
              {children}
            </TagsProvider>
          </ProgressProvider>
        </CoursesProvider>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
