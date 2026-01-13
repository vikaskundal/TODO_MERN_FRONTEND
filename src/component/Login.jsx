import { useState } from "react" 
import api from "../utils/api";

export const Login = ({ onLogin, onCancel, onForgotPassword, onSignup }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleLogIn = async (e) => {
        e.preventDefault();
        setError('');
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        try {
            const response = await api.post('/auth/login', { email, password });
            const token = response.data.data;
            // set the token in the local storage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(email));
            onLogin();
        } catch (error) {
            setError(error?.response?.data?.message || 'Invalid email or password, try again');
            console.log('error while login', error);
        }
    }

    return <>
        {/* login details */}
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
            <form onSubmit={handleLogIn}
                className="bg-primary-card dark:bg-dark-card flex flex-col items-center w-full max-w-md p-4 md:p-6 border-none rounded-xl shadow-2xl max-h-[90vh] overflow-y-auto">
                <h1 className="font-semibold text-lg md:text-xl p-2 text-primary-dark dark:text-dark-text mb-4 text-center">
                    Login To Your Account
                </h1>
                {/*if user put the wrong password and username error will appear in good format*/}
                {error && <p className="text-primary-red dark:text-dark-red mb-4 text-center text-sm w-full px-2">{error}</p>}
                <input
                    className="w-full p-3 md:p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent mb-3"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setError('');
                    }}
                />
                <div className="relative w-full mb-3">
                    <input
                        className="w-full p-3 md:p-3 text-base border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => {
                            setPassword(e.target.value)
                            setError('');
                        }}
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-3.5 md:top-3 text-xl md:text-base text-primary-dark dark:text-dark-text active:text-primary-accent dark:active:text-dark-accent hover:text-primary-accent dark:hover:text-dark-accent"
                        aria-label="Toggle password visibility"
                    >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                </div>
                {/* Forgot Password Link */}
                {onForgotPassword && (
                    <div className="w-full px-2 mb-2">
                        <button
                            type="button"
                            onClick={onForgotPassword}
                            className="text-primary-teal dark:text-dark-teal text-sm hover:underline active:underline"
                        >
                            Forgot Password?
                        </button>
                    </div>
                )}
                <div className="flex flex-row gap-3 md:space-x-3 mt-2 mb-4 w-full">
                    <button
                        className="flex-1 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text p-3 border-none rounded-lg active:bg-green-500 dark:active:bg-green-600 hover:bg-green-500 dark:hover:bg-green-600 transition-colors text-base font-semibold"
                        type='submit'
                    >Login</button>
                    <button
                        className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 transition-colors text-base font-semibold"
                        onClick={onCancel}
                    > Cancel</button>
                </div>
                {/* Link to Signup */}
                {onSignup && (
                    <div className="text-sm text-primary-dark dark:text-dark-text">
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onSignup}
                            className="text-primary-teal dark:text-dark-teal hover:underline font-semibold"
                        >
                            Sign up
                        </button>
                    </div>
                )}
            </form>
        </div>
    </>
}