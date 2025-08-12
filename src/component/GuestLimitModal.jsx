import React from 'react';

export default function GuestLimitModal({ onLogin, onSignup, onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-primary-card dark:bg-dark-card rounded-xl shadow-2xl p-8 flex flex-col items-center w-96">
        <h2 className="text-xl font-semibold text-primary-dark dark:text-dark-text mb-4">Guest Limit Reached</h2>
        <p className="text-primary-dark dark:text-dark-text mb-6 text-center">
          Guests can only add up to 5 todos.<br />
          Please login or signup to add more.
        </p>
        <div className="flex flex-row space-x-3 w-full">
          <button
            className="flex-1 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text p-3 border-none rounded-lg hover:bg-green-500 dark:hover:bg-green-600 transition-colors"
            onClick={onLogin}
          >
            Login
          </button>
          <button
            className="flex-1 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text p-3 border-none rounded-lg hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors"
            onClick={onSignup}
          >
            Signup
          </button>
          <button
            className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg hover:bg-red-400 dark:hover:bg-red-500 transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
} 