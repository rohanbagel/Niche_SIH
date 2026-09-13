import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export function usePSHistory(psNumber, currentIdeasCount = 0) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!psNumber) {
      setHistory([]);
      setLoading(false);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    async function fetchHistory() {
      try {
        const { data, error: dbError } = await supabase
          .from('history_log')
          .select('*')
          .eq('ps_number', psNumber)
          .order('created_at', { ascending: true });

        if (dbError) throw dbError;

        if (isMounted) {
          setHistory(data || []);
        }
      } catch (err) {
        console.error(`Error fetching history for ${psNumber}:`, err);
        if (isMounted) {
          setError(err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchHistory();

    return () => {
      isMounted = false;
    };
  }, [psNumber]);

  // Compute telemetry metrics
  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  let last24hDelta = 0;
  let last7dDelta = 0;

  const timeline = history.map((record) => {
    const timestamp = new Date(record.created_at).getTime();
    const increment = Math.max(0, (record.new_count ?? 0) - (record.old_count ?? 0));

    if (timestamp >= oneDayAgo) {
      last24hDelta += increment;
    }
    if (timestamp >= sevenDaysAgo) {
      last7dDelta += increment;
    }

    return {
      id: record.id,
      timestamp: record.created_at,
      dateObj: new Date(record.created_at),
      oldCount: record.old_count,
      newCount: record.new_count,
      increment,
      changeType: record.change_type,
    };
  });

  // Calculate daily velocity across total tracked span
  let dailyVelocity = 0;
  if (timeline.length > 0) {
    const firstTime = new Date(timeline[0].timestamp).getTime();
    const daysSpan = Math.max(1, (now - firstTime) / (1000 * 60 * 60 * 24));
    const totalAdded = (currentIdeasCount || 0) - (timeline[0].oldCount || 0);
    dailyVelocity = Number((Math.max(0, totalAdded) / daysSpan).toFixed(1));
  } else if (currentIdeasCount > 0) {
    // If no history records yet, estimate based on current count over 7 days
    dailyVelocity = Number((currentIdeasCount / 7).toFixed(1));
  }

  // Pace classification
  let pace = 'COLD';
  let paceLabel = 'COLD / STAGNANT';
  let paceDescription = 'Few to no recent submissions. Minimal competition from other teams.';

  if (last24hDelta >= 4 || dailyVelocity >= 3.0) {
    pace = 'SURGING';
    paceLabel = 'SURGING / RAPID PACE';
    paceDescription = 'Ideas are being submitted rapidly right now. Competition is accelerating.';
  } else if (last24hDelta >= 1 || dailyVelocity >= 1.0) {
    pace = 'STEADY';
    paceLabel = 'STEADY / MODERATE PACE';
    paceDescription = 'Consistent submission pace. Moderate ongoing competitor interest.';
  }

  // Official SIH Grand Finale shortlisting calculations (4 to 5 teams shortlisted per PS)
  const safeCount = Math.max(1, currentIdeasCount);
  const shortlistOdds = Math.min(100, Math.round((4.5 / safeCount) * 100));
  const winOdds = Number(Math.min(100, (1.0 / safeCount) * 100).toFixed(1));
  const relativeAdvantage = Math.max(1, Math.round(218 / safeCount));

  return {
    history,
    timeline,
    loading,
    error,
    metrics: {
      last24hDelta,
      last7dDelta,
      dailyVelocity,
      pace,
      paceLabel,
      paceDescription,
      shortlistOdds,
      winOdds,
      relativeAdvantage,
      totalCount: currentIdeasCount,
    },
  };
}
