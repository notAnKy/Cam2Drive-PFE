import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Camera } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/users/authenticate', {
        email,
        password,
      });

      localStorage.setItem('token', response.data.token);
      navigate('/'); // Redirect to the home or dashboard page
    } catch (err: any) {
      setError('Invalid email or password');
    }
  };

  // Handle "Enter" key press for navigating between input fields
  const handleKeyPress = (e: React.KeyboardEvent) => {
    const target = e.target as HTMLInputElement; // Cast to HTMLInputElement

    if (e.key === 'Enter') {
      if (target.id === 'email-input' && email) {
        // If pressed on email input, focus on password input
        document.getElementById('password-input')?.focus();
      } else if (target.id === 'password-input' && password) {
        // If pressed on password input, submit the form
        handleSubmit(e);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
            <Camera className="w-8 h-8 text-blue-300" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Welcome back</h2>
          <p className="text-gray-400">Enter your credentials to access your account</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 shadow-xl border border-gray-800">
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  id="email-input"
                  className="w-full bg-gray-900/50 text-white px-4 py-2.5 pl-11 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  onKeyPress={handleKeyPress}
                />
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
              </div>
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password-input"
                  className="w-full bg-gray-900/50 text-white px-4 py-2.5 pl-11 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  onKeyPress={handleKeyPress}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Display error if any */}
            {error && (
              <div className="mb-4 text-red-500 text-sm">{error}</div>
            )}

            {/* Forgot Password */}
           
            <div className="mb-6 text-right">
              <button
                type="button"
                className="text-blue-400 hover:text-blue-300 text-sm"
                onClick={() => navigate('/reset-password')}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium transition-colors duration-200 flex items-center justify-center gap-2"
            >
              Sign in
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
