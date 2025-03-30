import { useCallback, useState, useEffect } from 'react';

// Type definitions for Wouter compatibility
type NavigateFn = (to: string, options?: { replace?: boolean }) => void;
type LocationHook = () => [string, NavigateFn];

/**
 * A location hook that uses hash-based routing
 * This is useful for static file hosting that doesn't support proper URL rewrites
 */
export const useHashLocation: LocationHook = () => {
  // Get the hash without the # prefix, or "/" if empty
  const getCurrentHash = () => window.location.hash.replace('#', '') || '/';
  
  // Initialize with current hash
  const [path, setPath] = useState(getCurrentHash());
  
  // Update path state when hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = getCurrentHash();
      setPath(hash);
    };
    
    window.addEventListener('hashchange', handleHashChange);
    if (window.location.hash) handleHashChange();
    
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  
  // Navigation function that updates the hash
  const navigate = useCallback((to: string) => {
    window.location.hash = to;
  }, []);
  
  // Return in format expected by Wouter: [currentPath, navigateFunction]
  return [path, navigate];
};

/**
 * A location hook for Wouter that works in Vercel deployments
 * This implementation matches Wouter's expected return type
 */
export const useVercelFriendlyLocation: LocationHook = () => {
  // Initialize with current pathname
  const [path, setPath] = useState(window.location.pathname);
  
  // Update path state when location changes
  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    
    // Listen for popstate (browser back/forward)
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);
  
  // Navigation function that updates both browser URL and component state
  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState(null, '', to);
    } else {
      window.history.pushState(null, '', to);
    }
    
    // Update the path state
    setPath(to);
  }, []);
  
  // Return in format expected by Wouter: [currentPath, navigateFunction]
  return [path, navigate];
}; 