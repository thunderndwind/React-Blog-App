import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import PublicOnlyRoute from '~/components/PublicOnlyRoute';
import type { Route } from "./../+types/login";
import FormErrorMessage from '~/components/FormErrorMessage';
import { showError, showSuccess, showLoadingToast, updateToastError, updateToastSuccess } from '~/utils/toast';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Login - BlogPosts App" },
    { name: "description", content: "Login to your account" },
  ];
}

export default function LoginPage() {
  return (
    <PublicOnlyRoute>
      <LoginForm />
    </PublicOnlyRoute>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (name: string, value: string): string[] => {
    const fieldErrors: string[] = [];
    if (!value.trim()) {
      fieldErrors.push(`${name.charAt(0).toUpperCase() + name.slice(1)} is required`);
    }
    return fieldErrors;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    const fieldErrors = validateField(name, value);
    if (fieldErrors.length > 0) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'username') setUsername(value);
    if (name === 'password') setPassword(value);
    
    // Clear errors for this field when user types
    if (touchedFields[name]) {
      const fieldErrors = validateField(name, value);
      if (fieldErrors.length > 0) {
        setErrors(prev => ({ ...prev, [name]: fieldErrors }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    }
  };

  const getErrorMessage = (error: any): string => {
    // Handle different types of authentication errors
    if (error.status === 401 || error.status === 400) {
      // Invalid credentials
      if (error.message?.toLowerCase().includes('invalid') || 
          error.message?.toLowerCase().includes('incorrect') ||
          error.message?.toLowerCase().includes('wrong') ||
          error.errors?.non_field_errors?.some((msg: string) => 
            msg.toLowerCase().includes('invalid') || 
            msg.toLowerCase().includes('incorrect') ||
            msg.toLowerCase().includes('unable to log in')
          )) {
        return 'Invalid username or password. Please check your credentials and try again.';
      }
      
      // Account related issues
      if (error.message?.toLowerCase().includes('inactive') ||
          error.message?.toLowerCase().includes('disabled')) {
        return 'Your account has been deactivated. Please contact support for assistance.';
      }
      
      if (error.message?.toLowerCase().includes('locked') ||
          error.message?.toLowerCase().includes('suspended')) {
        return 'Your account has been temporarily locked. Please try again later or contact support.';
      }
    }
    
    // Network or server errors
    if (error.status >= 500) {
      return 'Server error occurred. Please try again in a few moments.';
    }
    
    if (error.status === 403) {
      return 'Access denied. Please check your credentials or contact support.';
    }
    
    if (error.status === 429) {
      return 'Too many login attempts. Please wait a few minutes before trying again.';
    }
    
    // CSRF or security related errors
    if (error.code === 'csrf_error' || error.message?.toLowerCase().includes('csrf')) {
      return 'Security token expired. Please refresh the page and try again.';
    }
    
    // Network connectivity issues
    if (!error.status && (error.message?.toLowerCase().includes('network') || 
                          error.message?.toLowerCase().includes('fetch'))) {
      return 'Network connection error. Please check your internet connection and try again.';
    }
    
    // Default error message
    return error.message || 'Login failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Perform form validation
    const formErrors: Record<string, string[]> = {};
    if (!username.trim()) {
      formErrors.username = ['Username is required'];
      showError('Please enter your username');
    }
    if (!password.trim()) {
      formErrors.password = ['Password is required'];
      showError('Please enter your password');
    }
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    setErrors({});

    // Show loading toast
    const toastId = showLoadingToast('Signing you in...');

    try {
      await login(username, password);
      
      // Success feedback
      updateToastSuccess(toastId, `Welcome back, ${username}!`);
      
      // Small delay to show success message before navigation
      setTimeout(() => {
        navigate('/');
      }, 500);
      
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Get appropriate error message
      const errorMessage = getErrorMessage(error);
      
      // Update loading toast with error
      updateToastError(toastId, errorMessage);
      
      // Handle form field errors
      if (error.errors) {
        setErrors(error.errors);
        
        // Show specific field errors in toasts
        Object.entries(error.errors).forEach(([field, messages]) => {
          if (Array.isArray(messages) && messages.length > 0) {
            const fieldName = field === 'non_field_errors' ? 'Login' : field.charAt(0).toUpperCase() + field.slice(1);
            showError(`${fieldName}: ${messages[0]}`);
          }
        });
      } else {
        // Set form error for display
        setErrors({ form: [errorMessage] });
      }
      
      // Clear password field for security on certain errors
      if (error.status === 401 || error.status === 400) {
        setPassword('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            create a new account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.form && <FormErrorMessage errors={errors.form} />}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Username
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  disabled={isSubmitting}
                  value={username}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  placeholder="Enter your username"
                />
              </div>
              {errors.username && <FormErrorMessage errors={errors.username} />}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={isSubmitting}
                  value={password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  placeholder="Enter your password"
                />
              </div>
              {errors.password && <FormErrorMessage errors={errors.password} />}
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : 'Sign in'}
              </button>
            </div>
          </form>
          
          {/* Additional help text */}
          <div className="mt-6">
            <div className="text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Having trouble signing in? Make sure your username and password are correct.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 