import { useState, useEffect } from 'react';
import { useDebounce } from './use-debounce';
import axios from '@/lib/axios';

interface UseNameAvailabilityOptions {
  endpoint: string;
  name: string;
  excludeId?: number;
  enabled?: boolean;
}

export function useNameAvailability({
  endpoint,
  name,
  excludeId,
  enabled = true
}: UseNameAvailabilityOptions) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const debouncedName = useDebounce(name, 500);

  useEffect(() => {
    if (!enabled || !debouncedName || debouncedName.length < 2) {
      setIsAvailable(null);
      return;
    }

    const checkAvailability = async () => {
      setIsChecking(true);
      try {
        const params = new URLSearchParams({ name: debouncedName });
        if (excludeId) {
          params.append('excludeId', String(excludeId));
        }

        const response = await axios.get(`${endpoint}?${params.toString()}`);

        if (response.data.success) {
          setIsAvailable(response.data.available);
        }
      } catch (error) {
        console.error('Error checking name availability:', error);
        setIsAvailable(null);
      } finally {
        setIsChecking(false);
      }
    };

    checkAvailability();
  }, [debouncedName, endpoint, excludeId, enabled]);

  return { isChecking, isAvailable };
}
