import React, { createContext, useContext, useState, useEffect } from 'react';
import { AUTH_ENDPOINTS, API_CONFIG } from '~/config';
import { apiRequest, refreshAuthToken, getCSRFToken } from '~/utils/api';
import type { ApiResponse } from '~/utils/api';

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string;
  bio: string;
  stats?: {
    posts_count: number;
    followers_count: number;
    following_count: number;
    likes_received: number;
    likes_given: number;
  };
};

export type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
  getAuthHeader: () => Record<string, string>;
  updateUserInfo: (userData: User) => void;
};

type RegisterData = {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
};

// Define response types for auth operations
type TokenResponse = {
  access: string;
  refresh: string;
};

type AuthSuccessResponse = {
  user: User;
  tokens?: TokenResponse; // Optional now since we're using cookies
};

type TokenValidationResponse = {
  status: string;
  message: string;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const validateSession = async () => {
      try {
        // With HTTP-only cookies, we just need to call an endpoint that checks the cookie
        const response = await apiRequest<User>('/users/me');
        
        if (response.status === 'success' && response.data) {
          setUser(response.data);
        }
      } catch (err: any) {
        console.error('Failed to validate session:', err);
        
        // If authentication failed, try to refresh the token
        if (err.status === 401 || (err.code && err.code === 'token_not_valid')) {
          try {
            // Attempt to refresh the token
            const refreshed = await refreshAuthToken();
            if (refreshed) {
              // If refresh succeeded, try to get user info again
              const retryResponse = await apiRequest<User>('/users/me');
              if (retryResponse.status === 'success' && retryResponse.data) {
                setUser(retryResponse.data);
              } else {
                // User needs to login again
                setUser(null);
              }
            } else {
              // Refresh failed, user needs to login
              setUser(null);
            }
          } catch (refreshErr) {
            console.error('Failed to refresh token:', refreshErr);
            setUser(null);
          }
        } else {
          // Other error, user needs to login again
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  // Helper function to get auth header when needed
  // With HTTP-only cookies, we don't need to include any authentication headers
  // But we should include CSRF token for non-GET requests
  const getAuthHeader = (): Record<string, string> => {
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      return { [API_CONFIG.CSRF_HEADER_NAME]: csrfToken };
    }
    return {};
  };

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiRequest<AuthSuccessResponse>(
        AUTH_ENDPOINTS.LOGIN,
        {
          method: 'POST',
          body: JSON.stringify({ username, password })
        }
      );

      // Since we're using HTTP-only cookies, we just need to check if login was successful
      // and set the user from the response
      if (response.status === 'success' && response.data) {
        // The data object might contain the user directly or nested inside a data property
        const userData = response.data.user || (response.data as any).data?.user;
        
        if (userData) {
          setUser(userData);
          return;
        } else {
          throw new Error('User data not found in response');
        }
      } else {
        throw {
          message: response.message || 'Login failed',
          errors: response.errors
        };
      }
    } catch (err: any) {
      // Set error in context
      if (err.message) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
      
      // Rethrow for component handling
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiRequest<AuthSuccessResponse>(
        AUTH_ENDPOINTS.REGISTER,
        {
          method: 'POST',
          body: JSON.stringify(userData)
        }
      );

      if (response.status === 'success' && response.data) {
        // The data object might contain the user directly or nested inside a data property
        const user = response.data.user || (response.data as any).data?.user;
        
        if (user) {
          setUser(user);
          return;
        } else {
          throw new Error('User data not found in response');
        }
      } else {
        throw {
          message: response.message || 'Registration failed',
          errors: response.errors
        };
      }
    } catch (err: any) {
      // Set error in context
      if (err.message) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
      
      // Rethrow for component handling
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call the logout endpoint to clear the HTTP-only cookie on the server
      await apiRequest(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST'
      });
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      // Always clear user state regardless of server response
      setUser(null);
    }
  };

  // Add function to update user info in context
  const updateUserInfo = (userData: User) => {
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user,
      login, 
      register, 
      logout,
      isLoading,
      error,
      getAuthHeader,
      updateUserInfo
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 