import api from "../utils/api";
import { useState } from "react"

export const Signup = ({ onSignup, onCancel, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [step, setStep] = useState('signup'); // 'signup' or 'otp'
    const [showPassword, setShowPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Step 1: Request OTP
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        
        // Validation
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }
        
        try {
            await api.post('/auth/signup', { username, email, password });
            setSuccessMessage('OTP sent to your email. Please enter it below to complete signup.');
            setStep('otp');
        } catch (error) {
            setError(error?.response?.data?.message || 'Error while signing up');
            console.log('error while signing up', error);
        }
    }

    // Step 2: Verify OTP and create user
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            console.log('OTP verification response:', response.data);
            
            // Handle different possible response structures
            const token = response.data?.data?.token || 
                         response.data?.data || 
                         response.data?.token || 
                         response.data?.accessToken ||
                         response.data?.access_token ||
                         response.token;
            
            // Validate token exists
            if (!token) {
                console.error('Token not found in response:', response.data);
                setError('Signup successful but token not received. Please try again.');
                return;
            }
            
            // Validate token is a string
            if (typeof token !== 'string' || token.trim() === '') {
                console.error('Invalid token format:', token);
                setError('Invalid token received. Please try again.');
                return;
            }
            
            // Set the token in the local storage
            localStorage.setItem('token', token);
            console.log('Token stored in localStorage:', token.substring(0, 20) + '...');
            
            // Store username from response or use the form username
            const user = response.data?.data?.username || 
                        response.data?.data?.user?.username ||
                        response.data?.username ||
                        response.data?.user ||
                        username;
            localStorage.setItem('user', typeof user === 'string' ? JSON.stringify(user) : JSON.stringify(user));
            
            setSuccessMessage('Signup successful!');
            onSignup();
        } catch (error) {
            setError(error?.response?.data?.message || 'OTP verification failed');
            console.log('error while verifying otp', error);
        }
    }

    return <>
        {/* Signup details */}
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <form onSubmit={step === 'signup' ? handleSignup : handleVerifyOtp}
                className="bg-primary-card dark:bg-dark-card flex flex-col items-center w-full max-w-md p-4 md:p-6 border-none rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h1 className="font-semibold text-lg md:text-xl p-2 text-primary-dark dark:text-dark-text mb-4 text-center">
                    SignUp To Your Account
                </h1>
                {error && <p className="text-primary-red dark:text-dark-red mb-4 text-center text-sm w-full px-2">{error}</p>}
                {successMessage && <p className="text-primary-green dark:text-dark-green mb-4 text-center text-sm w-full px-2">{successMessage}</p>}
                {step === 'signup' && <>
                    <input
                        className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent mb-3"
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={e => {
                            setUsername(e.target.value);
                            setError('');
                        }}
                    />
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
                    <div className="relative w-full mb-3">
                        <input
                            className="w-full p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Password (min 6 characters)"
                            required
                            value={password}
                            onChange={e => {
                                setPassword(e.target.value);
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
                </>}
                {step === 'otp' && <>
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
                </>}
                <div className="flex flex-row gap-3 md:space-x-3 mt-2 mb-4 w-full">
                    <button
                        className="flex-1 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text p-3 border-none rounded-lg active:bg-teal-400 dark:active:bg-teal-500 hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors text-base font-semibold"
                        type='submit'>{step === 'signup' ? 'Send OTP' : 'Verify OTP'}</button>
                    <button
                        className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 transition-colors text-base font-semibold"
                        onClick={onCancel}>Cancel</button>
                </div>
                {/* Link to Login */}
                {onLogin && step === 'signup' && (
                    <div className="text-sm text-primary-dark dark:text-dark-text">
                        Already have an account?{' '}
                        <button
                            type="button"
                            onClick={onLogin}
                            className="text-primary-teal dark:text-dark-teal hover:underline font-semibold"
                        >
                            Login
                        </button>
                    </div>
                )}
            </form>
        </div>
    </>
}