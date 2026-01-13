import api from "../utils/api";
import { useState } from "react"

export const ForgotPassword = ({ onCancel, onLogin }) => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [step, setStep] = useState('email'); // 'email', 'otp', 'reset'
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Step 1: Request Password Reset OTP
    const handleForgotPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        
        try {
            const response = await api.post('/auth/forgot-password', { email });
            setSuccessMessage(response.data.message || 'If an account exists with this email, a password reset OTP has been sent.');
            setStep('otp');
        } catch (error) {
            setError(error?.response?.data?.message || 'Failed to send reset email');
            console.log('error while requesting password reset', error);
        }
    }

    // Step 2: Verify OTP (optional step, but we'll use it to proceed to reset)
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (!otp) {
            setError('Please enter the OTP');
            return;
        }
        
        try {
            await api.post('/auth/verify-reset-otp', { email, otp });
            setSuccessMessage('OTP verified successfully. You can now reset your password.');
            setStep('reset');
        } catch (error) {
            setError(error?.response?.data?.message || 'Invalid or expired OTP');
            console.log('error while verifying reset otp', error);
        }
    }

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        
        try {
            const response = await api.post('/auth/reset-password', {
                email,
                otp,
                newPassword
            });
            setSuccessMessage(response.data.message || 'Password reset successfully. You can now login with your new password.');
            // Redirect to login after 2 seconds
            setTimeout(() => {
                if (onLogin) {
                    onLogin();
                }
            }, 2000);
        } catch (error) {
            setError(error?.response?.data?.message || 'Password reset failed');
            console.log('error while resetting password', error);
        }
    }

    return <>
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <form onSubmit={
                step === 'email' ? handleForgotPassword :
                step === 'otp' ? handleVerifyOtp :
                handleResetPassword
            }
                className="bg-primary-card dark:bg-dark-card flex flex-col items-center w-full max-w-md p-4 md:p-6 border-none rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h1 className="font-semibold text-lg md:text-xl p-2 text-primary-dark dark:text-dark-text mb-4 text-center">
                    {step === 'email' && 'Forgot Password'}
                    {step === 'otp' && 'Enter OTP'}
                    {step === 'reset' && 'Reset Password'}
                </h1>
                {error && <p className="text-primary-red dark:text-dark-red mb-4 text-center text-sm w-full px-2">{error}</p>}
                {successMessage && <p className="text-primary-green dark:text-dark-green mb-4 text-center text-sm w-full px-2">{successMessage}</p>}
                
                {step === 'email' && (
                    <>
                        <p className="text-sm text-primary-dark dark:text-dark-text mb-4 text-center px-2">
                            Enter your email address and we'll send you an OTP to reset your password.
                        </p>
                        <input
                            className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent mb-3"
                            type="email"
                            placeholder="Email"
                            required
                            value={email}
                            onChange={e => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                        />
                    </>
                )}
                
                {step === 'otp' && (
                    <>
                        <p className="text-sm text-primary-dark dark:text-dark-text mb-4 text-center px-2">
                            Enter the OTP sent to your email.
                        </p>
                        <input
                            className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent mb-3"
                            type="text"
                            placeholder="Enter OTP"
                            required
                            value={otp}
                            onChange={e => {
                                setOtp(e.target.value);
                                setError('');
                            }}
                        />
                    </>
                )}
                
                {step === 'reset' && (
                    <>
                        <div className="relative w-full mb-3">
                            <input
                                className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="New Password (min 6 characters)"
                                required
                                value={newPassword}
                                onChange={e => {
                                    setNewPassword(e.target.value);
                                    setError('');
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-3.5 text-xl md:text-base text-primary-dark dark:text-dark-text active:text-primary-accent dark:active:text-dark-accent hover:text-primary-accent dark:hover:text-dark-accent"
                                aria-label="Toggle password visibility"
                            >
                                {showPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                        <div className="relative w-full mb-3">
                            <input
                                className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                                type={showConfirmPassword ? 'text' : 'password'}
                                placeholder="Confirm New Password"
                                required
                                value={confirmPassword}
                                onChange={e => {
                                    setConfirmPassword(e.target.value);
                                    setError('');
                                }}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-3.5 text-xl md:text-base text-primary-dark dark:text-dark-text active:text-primary-accent dark:active:text-dark-accent hover:text-primary-accent dark:hover:text-dark-accent"
                                aria-label="Toggle password visibility"
                            >
                                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                            </button>
                        </div>
                    </>
                )}
                
                <div className="flex flex-row gap-3 md:space-x-3 mt-2 mb-4 w-full">
                    <button
                        className="flex-1 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text p-3 border-none rounded-lg active:bg-teal-400 dark:active:bg-teal-500 hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors text-base font-semibold"
                        type='submit'
                    >
                        {step === 'email' && 'Send OTP'}
                        {step === 'otp' && 'Verify OTP'}
                        {step === 'reset' && 'Reset Password'}
                    </button>
                    <button
                        className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 transition-colors text-base font-semibold"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                </div>
                
                {/* Back to Login Link */}
                {onLogin && (
                    <div className="text-sm text-primary-dark dark:text-dark-text">
                        Remember your password?{' '}
                        <button
                            type="button"
                            onClick={onLogin}
                            className="text-primary-teal dark:text-dark-teal hover:underline font-semibold"
                        >
                            Back to Login
                        </button>
                    </div>
                )}
            </form>
        </div>
    </>
}
