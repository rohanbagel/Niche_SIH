import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

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
        .select('*')
        .order('ideas_count', { ascending: true });

      if (dbError) throw dbError;

      const formattedData = psData.map(ps => ({
        ...ps,
        ideasCount: ps.ideas_count,
        psNumber: ps.ps_number,
        maxIdeas: ps.max_ideas,
        firstSeenAt: ps.first_seen_at,
        lastUpdatedAt: ps.last_updated_at
      }));

      setData(formattedData);
    } catch (err) {
      console.error('Error fetching PS data from Supabase:', err);
      if (!isSilent) {
        setError(err.message);
      }
    } finally {
      if (!isSilent) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchFromSupabase(false);

    // Listen for silent background re-fetches triggered by the countdown toast
    const handleSilentSync = () => {
      fetchFromSupabase(true);
    };

    window.addEventListener('sih:silent-refetch', handleSilentSync);
    return () => {
      window.removeEventListener('sih:silent-refetch', handleSilentSync);
    };
  }, [fetchFromSupabase]);

  return { data, loading, error, refetch: () => fetchFromSupabase(false) };
}

