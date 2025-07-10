import React, { useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthPage() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { signup, login, currentUser } = useAuth(); // Destructure currentUser to check if logged in
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // State to toggle between login and signup
  const navigate = useNavigate(); // Hook to navigate programmatically

  // Redirect if user is already logged in
  if (currentUser) {
    navigate('/dashboard'); // Redirect to dashboard if logged in
    return null; // Don't render anything while redirecting
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setLoading(true);

    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    try {
      if (isLogin) {
        await login(email, password);
        navigate('/dashboard'); // Navigate to dashboard on successful login
      } else {
        // Signup
        const passwordConfirm = passwordConfirmRef.current.value;
        if (password !== passwordConfirm) {
          return setError('Passwords do not match');
        }
        await signup(email, password);
        navigate('/dashboard'); // Navigate to dashboard on successful signup
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError('Failed to ' + (isLogin ? 'log in' : 'sign up') + '. Please check your credentials.');
      // More specific error handling can be added here based on Firebase error codes (e.g., auth/user-not-found)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isLogin ? 'Sign in to your account' : 'Create an account'}
          </h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                ref={emailRef}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                ref={passwordRef}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
            {!isLogin && (
              <div>
                <label htmlFor="password-confirm" className="sr-only">
                  Confirm Password
                </label>
                <input
                  id="password-confirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  ref={passwordConfirmRef}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm Password"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
            </button>
          </div>
        </form>

        <div className="text-center text-sm">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsLogin(false)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsLogin(true)}
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                Sign In
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;