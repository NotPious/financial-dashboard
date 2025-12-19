import { useEffect, useState, useRef, useCallback } from 'react';

export interface PollingDataResult<T> {
  data: T;
  loading: boolean;
  error: any;
  refetch: () => Promise<void>;
}

/**
 * Polling hook, ensures only one internval runs
 * @param fetcher - async function returning data of type T
 * @param intervalMs - polling interval in milliseconds
 * @param initialValue - starting value for data
 * @param immediate - Whether to run the first fetch immediately on mount.
 * @param enabled - Whether polling is enabled                    
 */
export const usePollingData = <T>(
  fetcher: () => Promise<T>,
  intervalMs: number,
  initialValue: T,
  immediate: boolean = true,
  enabled: boolean = true
): PollingDataResult<T> => {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState<boolean>(immediate && enabled);
  const [error, setError] = useState<any>(null);

  const isFetching = useRef(false);
  const hasFetchedOnce = useRef(false);
  const intervalId = useRef<NodeJS.Timeout | null>(null);

  if (!enabled) { console.log("Polling disabled in usePollingData."); }
  //console.log("Initial polling data:", initialValue);

/*    // Track mounted state
   useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []); */

  const fetchData = useCallback(async () => {
    if (!enabled || isFetching.current) {
      console.log("Skipping fetch as previous request is still pending.");
      return; // Prevent overlapping fetches
    }

    isFetching.current = true;
    try {
      const result = await fetcher();
      setData(result);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [fetcher, enabled]);

  // Initial fetch, only once per mount
  useEffect(() => {
    if (!enabled || !immediate || hasFetchedOnce.current) return;

//    console.log("Triggering initial fetch...");
    hasFetchedOnce.current = true;
    fetchData();
  }, [enabled, immediate, fetchData]);

   // Polling loop
  useEffect(() => {
    if (!enabled || intervalMs <= 0) return;

//    console.log('Starting polling loop with interval:', intervalMs);

    intervalId.current = setInterval(fetchData,intervalMs);

    // Cleanup interval safely
    return () => {
      if (intervalId.current) {
        clearInterval(intervalId.current);
        intervalId.current = null;
      }
//      console.log('Cleaning up polling interval.');
    };
  }, [enabled, intervalMs, fetchData]);

//  console.log('Returning data:', data);

  return { data, loading, error, refetch: fetchData };
};
