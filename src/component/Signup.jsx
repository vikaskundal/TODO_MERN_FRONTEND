import axios from "axios";
import { useState } from "react"

export const Signup = ({ onSignup, onCancel }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [step, setStep] = useState('signup'); // 'signup' or 'otp'

    // Step 1: Request OTP
    const handleSignup = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');
        try {
            await axios.post('http://localhost:8000/auth/signup', { username, email, password });
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
            const response = await axios.post('http://localhost:8000/auth/verify-otp', { username, email, password, otp });
            const token = response.data.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(username));
            setSuccessMessage('Signup successful!');
            onSignup();
        } catch (error) {
            setError(error?.response?.data?.message || 'OTP verification failed');
            console.log('error while verifying otp', error);
        }
    }

    return <>
        {/* Signup details */}
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <form onSubmit={step === 'signup' ? handleSignup : handleVerifyOtp}
                className="bg-primary-card dark:bg-dark-card flex flex-col items-center w-96 p-6 border-none rounded-xl shadow-2xl">
                <h1 className="font-semibold text-xl p-2 text-primary-dark dark:text-dark-text mb-4">
                    SignUp To Your Account
                </h1>
                {error && <p className="text-primary-red dark:text-dark-red mb-4 text-center">{error}</p>}
                {successMessage && <p className="text-primary-green dark:text-dark-green mb-4 text-center">{successMessage}</p>}
                {step === 'signup' && <>
                    <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="text"
                        placeholder="Username"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                    />
                    <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </>}
                {step === 'otp' && <>
                    <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="text"
                        placeholder="Enter OTP"
                        required
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                    />
                </>}
                <div className="flex flex-row space-x-3 m-4 w-full">
                    <button
                        className="flex-1 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text p-3 border-none rounded-lg hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors"
                        type='submit'>{step === 'signup' ? 'Send OTP' : 'Verify OTP'}</button>
                    <button
                        className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg hover:bg-red-400 dark:hover:bg-red-500 transition-colors"
                        onClick={onCancel}>Cancel</button>
                </div>
            </form>
        </div>
    </>
}