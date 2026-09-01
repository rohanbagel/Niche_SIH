import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useProblemStatements() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchFromSupabase() {
      try {
        const { data: psData, error: dbError } = await supabase
          .from('problem_statements')
          .select('*')
          // Sorting by ideas_count ascending as requested for the Niche strategy
          .order('ideas_count', { ascending: true });

        if (dbError) throw dbError;
        
        // Map the snake_case DB columns to the camelCase keys the frontend expects
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
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchFromSupabase();
  }, []);

  return { data, loading, error };
}
