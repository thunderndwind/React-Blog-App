import { useState, useEffect, useRef, useCallback } from 'react';
import { apiRequest, getCSRFToken } from '~/utils/api';
import type { ApiResponse } from '~/utils/api';

interface UsePaginationOptions<T> {
    initialUrl: string;
    getHeaders?: () => Record<string, string>;
    initialData?: T[];
}

export function usePagination<T>({
    initialUrl,
    getHeaders = () => ({}),
    initialData = []
}: UsePaginationOptions<T>) {
    const [data, setData] = useState<T[]>(initialData);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(initialUrl);
    const observer = useRef<IntersectionObserver | null>(null);

    // Store initialUrl in a ref to avoid dependency changes
    const initialUrlRef = useRef(initialUrl);

    // Use a ref for the getHeaders function to stabilize it
    const getHeadersRef = useRef(getHeaders);

    // Update the ref if getHeaders changes
    useEffect(() => {
        getHeadersRef.current = getHeaders;
    }, [getHeaders]);

    // Fetch initial data
    const fetchData = useCallback(async (url: string = initialUrlRef.current, reset: boolean = true) => {
        try {
            setIsLoading(true);
            const headers: Record<string, string> = {
                ...getHeadersRef.current()
            };

            // Add CSRF token if needed for non-GET requests
            const csrfToken = getCSRFToken();
            if (csrfToken) {
                headers['X-CSRFToken'] = csrfToken;
            }

            const response = await apiRequest<T[]>(
                url,
                {
                    headers
                }
            );

            if (response.status === 'success' && response.data) {
                // If reset is true, replace data, otherwise append
                if (reset) {
                    const newData = response.data as T[];
                    setData(newData);
                } else {
                    const newData = response.data as T[];
                    setData(prevData => [...prevData, ...newData]);
                }

                // Store the next page URL from pagination
                setNextPageUrl(response.pagination?.next || null);
                setError(null);
            } else {
                if (reset) {
                    setData([]);
                }
                setError(response.message || 'Failed to load data');
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Failed to load data. Please try again later.');
            if (reset) {
                setData([]);
            }
        } finally {
            setIsLoading(false);
        }
    }, []); // No dependencies, using refs instead

    // Load more data
    const loadMore = useCallback(async () => {
        if (!nextPageUrl || isLoadingMore) return;

        try {
            setIsLoadingMore(true);
            await fetchData(nextPageUrl, false);
        } finally {
            setIsLoadingMore(false);
        }
    }, [nextPageUrl, isLoadingMore, fetchData]);

    // Last element ref for intersection observer
    const lastElementRef = useCallback((node: HTMLElement | null) => {
        if (isLoadingMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && nextPageUrl) {
                loadMore();
            }
        }, { threshold: 0.5 });

        if (node) observer.current.observe(node);
    }, [isLoadingMore, nextPageUrl, loadMore]);

    // Initial load - only run once
    useEffect(() => {
        let isMounted = true;

        const load = async () => {
            if (isMounted) {
                await fetchData();
            }
        };

        load();

        // Cleanup function
        return () => {
            isMounted = false;
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [fetchData]);

    return {
        data,
        isLoading,
        isLoadingMore,
        error,
        hasMore: !!nextPageUrl,
        lastElementRef,
        refresh: () => fetchData(),
        loadMore
    };
} 