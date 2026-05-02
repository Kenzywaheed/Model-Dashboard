import { useState, useEffect } from 'react';

export const useApiData = (endpoint) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // TODO: Replace with real API endpoint
    const fetchData = async () => {
      try {
        // const response = await fetch(`/api/${endpoint}`);
        // const result = await response.json();
        setLoading(false);
        // setData(result);
        setData([]); // Placeholder
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

