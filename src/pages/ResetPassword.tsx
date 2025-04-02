// src/pages/ResetPassword.tsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ResetPassword = () => {
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState(''); // State for resetToken
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // Send a reset password email with the token
  const sendResetToken = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/forgot-password', { email });
      setMessage('Password reset token sent to your email.');
    } catch (err: any) {
      setError('Error sending reset token');
    }
  };

  // Handle password reset with the token
  const handleResetPassword = async () => {
    try {
      await axios.post('http://localhost:5000/api/users/reset-password', { email, resetToken, newPassword });
      setMessage('Password reset successfully.');
      navigate('/login'); // Redirect to login page after successful reset
    } catch (err: any) {
      setError('Error resetting password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-400">Enter your email to receive a reset token</p>
        </div>

        <div className="bg-gray-900/50 backdrop-blur-xl rounded-xl p-8 shadow-xl border border-gray-800">
          {/* Email Input */}
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              className="w-full bg-gray-900/50 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={sendResetToken}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium mb-4"
          >
            Send Reset Token
          </button>

          {/* Reset Token */}
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-medium mb-2">Reset Token</label>
            <input
              type="text"
              className="w-full bg-gray-900/50 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your reset token"
              value={resetToken}
              onChange={(e) => setResetToken(e.target.value)}
            />
          </div>

          {/* New Password */}
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-medium mb-2">New Password</label>
            <input
              type="password"
              className="w-full bg-gray-900/50 text-white px-4 py-2.5 rounded-lg border border-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button
            type="button"
            onClick={handleResetPassword}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium"
          >
            Reset Password
          </button>

          {error && <div className="mt-4 text-red-500">{error}</div>}
          {message && <div className="mt-4 text-green-500">{message}</div>}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
