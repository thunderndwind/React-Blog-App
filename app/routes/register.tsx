import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import { useAuth } from '~/context/AuthContext';
import type { Route } from "./../+types/register";
import FormErrorMessage from '~/components/FormErrorMessage';
import { showError } from '~/utils/toast';
import PublicOnlyRoute from '~/components/PublicOnlyRoute';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Register - BlogPosts App" },
    { name: "description", content: "Create a new account" },
  ];
}

export default function RegisterPage() {
  return (
    <PublicOnlyRoute>
      <RegisterForm />
    </PublicOnlyRoute>
  );
}

function RegisterForm() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: ''
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const validateField = (name: string, value: string): string[] => {
    const validationErrors: string[] = [];
    
    switch (name) {
      case 'username':
        if (!value.trim()) {
          validationErrors.push('Username is required');
        } else if (value.length < 3) {
          validationErrors.push('Username must be at least 3 characters');
        }
        break;
      
      case 'email':
        if (!value.trim()) {
          validationErrors.push('Email is required');
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          validationErrors.push('Please enter a valid email address');
        }
        break;
      
      case 'password':
        if (!value.trim()) {
          validationErrors.push('Password is required');
        } else if (value.length < 8) {
          validationErrors.push('Password must be at least 8 characters');
        }
        break;
      
      case 'password2':
        if (value !== formData.password) {
          validationErrors.push('Passwords do not match');
        }
        break;
      
      case 'first_name':
        if (!value.trim()) {
          validationErrors.push('First name is required');
        }
        break;
      
      case 'last_name':
        if (!value.trim()) {
          validationErrors.push('Last name is required');
        }
        break;
    }
    
    return validationErrors;
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    // If field was touched, validate immediately
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

    // Special check for password confirmation
    if (name === 'password' && touchedFields.password2) {
      const password2Errors = formData.password2 !== value ? ['Passwords do not match'] : [];
      if (password2Errors.length > 0) {
        setErrors(prev => ({ ...prev, password2: password2Errors }));
      } else {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.password2;
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const validationErrors: Record<string, string[]> = {};
    
    // Check all fields
    Object.entries(formData).forEach(([name, value]) => {
      const fieldErrors = validateField(name, value);
      if (fieldErrors.length > 0) {
        validationErrors[name] = fieldErrors;
      }
    });
    
    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(formData).forEach(field => {
      allTouched[field] = true;
    });
    setTouchedFields(allTouched);
    
    // First, validate the form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      await register(formData);
      navigate('/');
    } catch (error: any) {
      // Handle API validation errors
      if (error.errors) {
        setErrors(error.errors);
        
        // Show the first error message in toast
        const firstErrorField = Object.keys(error.errors)[0];
        if (firstErrorField && error.errors[firstErrorField][0]) {
          showError(error.errors[firstErrorField][0]);
        } else {
          showError('Registration failed. Please check the form for errors.');
        }
      } else if (error.message) {
        showError(error.message);
        setErrors({ form: [error.message] });
      } else {
        showError('Registration failed. Please try again.');
        setErrors({ form: ['Registration failed. Please try again.'] });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create a new account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Or{" "}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            sign in to your account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 dark:bg-gray-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {errors.form && <FormErrorMessage errors={errors.form} />}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Username*
                </label>
                <div className="mt-1">
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    disabled={isSubmitting}
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  />
                  <FormErrorMessage errors={errors.username} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Email*
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    disabled={isSubmitting}
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  />
                  <FormErrorMessage errors={errors.email} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First Name*
                </label>
                <div className="mt-1">
                  <input
                    id="first_name"
                    name="first_name"
                    type="text"
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    value={formData.first_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.first_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  />
                  <FormErrorMessage errors={errors.first_name} />
                </div>
              </div>

              <div>
                <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last Name*
                </label>
                <div className="mt-1">
                  <input
                    id="last_name"
                    name="last_name"
                    type="text"
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    value={formData.last_name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`appearance-none block w-full px-3 py-2 border ${errors.last_name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                  />
                  <FormErrorMessage errors={errors.last_name} />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password*
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                />
                <FormErrorMessage errors={errors.password} />
              </div>
            </div>

            <div>
              <label htmlFor="password2" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password*
              </label>
              <div className="mt-1">
                <input
                  id="password2"
                  name="password2"
                  type="password"
                  autoComplete="new-password"
                  disabled={isSubmitting}
                  value={formData.password2}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`appearance-none block w-full px-3 py-2 border ${errors.password2 ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:text-white ${isSubmitting ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                />
                <FormErrorMessage errors={errors.password2} />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-75 cursor-not-allowed' : ''}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 