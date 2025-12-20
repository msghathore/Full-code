import { useState, useEffect, useCallback } from 'react';
import { feedbackService, FeedbackWithCustomer, FeedbackSummary, FeedbackInsert, FeedbackUpdate } from '@/services/feedbackService';
import { useAuth } from '@clerk/clerk-react';

interface UseFeedbackOptions {
  service?: string;
  limit?: number;
  autoFetch?: boolean;
}

interface UseFeedbackReturn {
  // Data
  feedback: FeedbackWithCustomer[];
  summary: FeedbackSummary | null;
  trends: Array<{
    date: string;
    nps: number;
    avgRating: number;
    total: number;
  }>;

  // Loading states
  loading: boolean;
  summaryLoading: boolean;
  trendsLoading: boolean;

  // Error states
  error: string | null;
  summaryError: string | null;
  trendsError: string | null;

  // Actions
  refetch: () => Promise<void>;
  refetchSummary: () => Promise<void>;
  refetchTrends: () => Promise<void>;
  createFeedback: (data: FeedbackInsert) => Promise<FeedbackWithCustomer>;
  updateFeedback: (id: string, data: FeedbackUpdate) => Promise<FeedbackWithCustomer>;
  deleteFeedback: (id: string) => Promise<void>;
  searchFeedback: (query: string, service?: string) => Promise<void>;
}

export const useFeedback = (options: UseFeedbackOptions = {}): UseFeedbackReturn => {
  const { autoFetch = true } = options;
  const { isSignedIn } = useAuth();

  // State
  const [feedback, setFeedback] = useState<FeedbackWithCustomer[]>([]);
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [trends, setTrends] = useState<Array<{
    date: string;
    nps: number;
    avgRating: number;
    total: number;
  }>>([]);

  // Loading states
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [trendsLoading, setTrendsLoading] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [trendsError, setTrendsError] = useState<string | null>(null);

  // Fetch feedback list
  const fetchFeedback = useCallback(async () => {
    if (!isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const data = await feedbackService.getAll(options);
      setFeedback(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback';
      setError(errorMessage);
      console.error('Error fetching feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn, options.service, options.limit]);

  // Fetch feedback summary
  const fetchSummary = useCallback(async () => {
    if (!isSignedIn) return;

    setSummaryLoading(true);
    setSummaryError(null);

    try {
      const data = await feedbackService.getSummary();
      setSummary(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback summary';
      setSummaryError(errorMessage);
      console.error('Error fetching feedback summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [isSignedIn]);

  // Fetch feedback trends
  const fetchTrends = useCallback(async () => {
    if (!isSignedIn) return;

    setTrendsLoading(true);
    setTrendsError(null);

    try {
      const data = await feedbackService.getTrends(30);
      setTrends(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch feedback trends';
      setTrendsError(errorMessage);
      console.error('Error fetching feedback trends:', err);
    } finally {
      setTrendsLoading(false);
    }
  }, [isSignedIn]);

  // Create feedback
  const createFeedback = useCallback(async (data: FeedbackInsert): Promise<FeedbackWithCustomer> => {
    try {
      const newFeedback = await feedbackService.create(data);

      // Refresh data
      await Promise.all([fetchFeedback(), fetchSummary(), fetchTrends()]);

      return newFeedback as FeedbackWithCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create feedback';
      throw new Error(errorMessage);
    }
  }, [fetchFeedback, fetchSummary, fetchTrends]);

  // Update feedback
  const updateFeedback = useCallback(async (id: string, data: FeedbackUpdate): Promise<FeedbackWithCustomer> => {
    try {
      const updatedFeedback = await feedbackService.update(id, data);

      // Refresh data
      await Promise.all([fetchFeedback(), fetchSummary(), fetchTrends()]);

      return updatedFeedback as FeedbackWithCustomer;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update feedback';
      throw new Error(errorMessage);
    }
  }, [fetchFeedback, fetchSummary, fetchTrends]);

  // Delete feedback
  const deleteFeedback = useCallback(async (id: string): Promise<void> => {
    try {
      await feedbackService.delete(id);

      // Refresh data
      await Promise.all([fetchFeedback(), fetchSummary(), fetchTrends()]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete feedback';
      throw new Error(errorMessage);
    }
  }, [fetchFeedback, fetchSummary, fetchTrends]);

  // Search feedback
  const searchFeedback = useCallback(async (query: string, service?: string) => {
    if (!isSignedIn) return;

    setLoading(true);
    setError(null);

    try {
      const data = await feedbackService.search(query, service);
      setFeedback(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to search feedback';
      setError(errorMessage);
      console.error('Error searching feedback:', err);
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Initial data fetch
  useEffect(() => {
    if (autoFetch && isSignedIn) {
      fetchFeedback();
      fetchSummary();
      fetchTrends();
    }
  }, [autoFetch, isSignedIn, fetchFeedback, fetchSummary, fetchTrends]);

  return {
    // Data
    feedback,
    summary,
    trends,

    // Loading states
    loading,
    summaryLoading,
    trendsLoading,

    // Error states
    error,
    summaryError,
    trendsError,

    // Actions
    refetch: fetchFeedback,
    refetchSummary: fetchSummary,
    refetchTrends: fetchTrends,
    createFeedback,
    updateFeedback,
    deleteFeedback,
    searchFeedback,
  };
};