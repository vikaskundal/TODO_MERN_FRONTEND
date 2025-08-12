import { useState } from "react" 
import axios  from "axios";

export const  Login=({onLogin,onCancel})=>{
    const [email,setEmail]=useState('');
    const [password,setPassword]=useState('');
    const [error,setError]=useState('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    const handleLogIn= async(e)=>{
        e.preventDefault();
        setError('');
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address');
            return;
        }
        localStorage.setItem('user',JSON.stringify(email));
        try{
            const response= await axios.post('http://localhost:8000/auth/login',{email,password});
            const token=response.data.data;
            // set the token in the local storage
            localStorage.setItem('token',token);
            onLogin();
            console.log('login successfull')
        }catch(error){
            setError(error?.response?.data?.message || 'Invalid email or password, try again');
            console.log('error while login',error);
        }
    }

    return <>
        {/* login details */}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <form onSubmit={handleLogIn} 
                    className="bg-primary-card dark:bg-dark-card flex flex-col items-center w-96 p-6 border-none rounded-xl shadow-2xl">
                        <h1 className="font-semibold text-xl p-2 text-primary-dark dark:text-dark-text mb-4">
                            Login To Your Account
                        </h1>
                    {/*if user put the wrong password and username error will appear in good format*/}
                        {error && <p className="text-primary-red dark:text-dark-red mb-4 text-center">{error}</p>}
                        <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={((e)=>{
                            setEmail(e.target.value)
                        })}
                        />
                        <input
                        className="w-full p-3 m-2 border border-primary-accent dark:border-dark-accent rounded-lg bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent"
                        type="password"
                        placeholder="Password"
                        onChange={((e)=>{
                            setPassword(e.target.value)
                        })}
                        required/>
                        <div className="flex flex-row space-x-3 m-4 w-full">
                        <button
                        className="flex-1 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text p-3 border-none rounded-lg hover:bg-green-500 dark:hover:bg-green-600 transition-colors"
                        type='submit'
                        >Login</button>
                        <button
                        className="flex-1 bg-primary-red dark:bg-dark-red text-white p-3 border-none rounded-lg hover:bg-red-400 dark:hover:bg-red-500 transition-colors"
                        onClick={onCancel}
                        > Cancel</button>
                        </div>
                    </form>
            </div>
    </>
}