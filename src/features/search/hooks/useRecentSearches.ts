import { useState, useEffect, useCallback } from 'react';
import { storageService } from '@shared/services/storageService';

const MAX_RECENT_SEARCHES = 10;

export function useRecentSearches() {
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    const load = async () => {
      const searches = await storageService.getRecentSearches();
      setRecentSearches(searches);
      setIsLoaded(true);
    };
    load();
  }, []);

  // Add a search term to recent searches
  const addRecentSearch = useCallback(async (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;

    setRecentSearches((prev) => {
      // Remove if already exists, then add to front
      const filtered = prev.filter((s) => s.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);

      // Save async (fire and forget)
      storageService.saveRecentSearches(updated);

      return updated;
    });
  }, []);

  // Remove a specific search term
  const removeRecentSearch = useCallback(async (term: string) => {
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== term);
      storageService.saveRecentSearches(updated);
      return updated;
    });
  }, []);

  // Clear all recent searches
  const clearRecentSearches = useCallback(async () => {
    setRecentSearches([]);
    await storageService.clearRecentSearches();
  }, []);

  return {
    recentSearches,
    isLoaded,
    addRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
  };
}
