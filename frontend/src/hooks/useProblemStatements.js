import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import finalCounts from '../data/finalCounts.json';

export function useProblemStatements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFromSupabase = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) {
        setLoading(true);
      }

      const { data: psData, error: dbError } = await supabase
        .from('problem_statements')
        .select('*');

      if (dbError) throw dbError;

      const formattedData = psData.map(ps => {
        const trueCount = finalCounts[ps.ps_number] ?? ps.ideas_count ?? 0;
        return {
          ...ps,
          ideas_count: trueCount,
          ideasCount: trueCount,
          psNumber: ps.ps_number,
          maxIdeas: ps.max_ideas,
          firstSeenAt: ps.first_seen_at,
          lastUpdatedAt: ps.last_updated_at
        };
      });

      // Sort by default ascending ideasCount
      formattedData.sort((a, b) => a.ideasCount - b.ideasCount);

      setData(formattedData);
    } catch (err) {
      console.error('Error fetching PS data from Supabase, loading fallback:', err);
      try {
        const fallback = await import('../data/fallbackPS.json');
        setData(fallback.default || fallback);
      } catch (fErr) {
        if (!isSilent) {
          setError(err.message);
        }
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchFromSupabase(false);
  }, [fetchFromSupabase]);

  return { data, loading, error, refetch: () => fetchFromSupabase(false) };
}

