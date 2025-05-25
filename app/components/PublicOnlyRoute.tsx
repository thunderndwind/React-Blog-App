import React, { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '~/context/AuthContext';

interface PublicOnlyRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Component that ensures only non-authenticated users can access certain routes
 * If user is logged in, they will be redirected to the specified path (default: home)
 */
export default function PublicOnlyRoute({ 
  children, 
  redirectTo = '/' 
}: PublicOnlyRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate(redirectTo);
    }
  }, [isAuthenticated, isLoading, navigate, redirectTo]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Checking authentication...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not loading and not authenticated, show the public route (login/register)
  return <>{children}</>;
} 