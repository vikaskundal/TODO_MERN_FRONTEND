import { Login } from "./Login";
import { Signup } from "./Signup";
import { ForgotPassword } from "./ForgotPassword";
import { createTodo } from "./Todos";
import GuestLimitModal from "./GuestLimitModal";
import api from "../utils/api";
import React, { useEffect, useState } from "react";

export const TodoList = ({ todos, addTodoToDS, deleteTodo, markAsDone, setTodos }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const [showlogin, setShowLogIn] = useState(false);
    const [showsignup, setShowSignUp] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [showUserName, SetShowUserName] = useState('');
    const [isEditingUsername, setIsEditingUsername] = useState(false);
    const [editedUsername, setEditedUsername] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isUpdatingUsername, setIsUpdatingUsername] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
    const [inputError, setInputError] = useState("");
    const [sendStatus, setSendStatus] = useState(""); // For email send feedback
    const [sendStatusType, setSendStatusType] = useState(""); // 'success' or 'error'
    const [sending, setSending] = useState(false); // For spinner

    // Dark mode toggle
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        if (!isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    // Check for saved dark mode preference
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'true') {
            setIsDarkMode(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    // Save dark mode preference
    useEffect(() => {
        localStorage.setItem('darkMode', isDarkMode.toString());
    }, [isDarkMode]);

    // handle the login logic and load username
    useEffect(() => {
        const savedtoken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedtoken) {
            setisLoggedIn(true);
            // Load username if available
            if (savedUser) {
                try {
                    const username = JSON.parse(savedUser);
                    SetShowUserName(username);
                } catch (error) {
                    console.log('Error parsing username:', error);
                }
            }
        }

    }, [])
    // fetching the Todos from the backend and puting it in the localstorage
    const fetchTodos = async () => {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        try {
           // Assuming you stored the token in local storage
          if (token) {
          const response = await api.get('/api/todos');
          // Parse the username from JSON string
          const username = user ? JSON.parse(user) : '';
          SetShowUserName(username);

          console.log('after using the axios');
          setTodos(response.data);
        } else {
            localStorage.removeItem('todos')
            setTodos([])

        }
          // localStorage.setItem('todos', JSON.stringify(response.data));
        } catch (error) {
          console.log('unable to fetch the todos', error);
        }
      };

    const handleLogIn = () => {
        setisLoggedIn(true);
        setShowLogIn(false);
        fetchTodos(); // This should log
        setTodos(todos);

    }
    // handle the singup
    const handleSignUp = async () => {
        setisLoggedIn(true);
        setShowSignUp(false);
        fetchTodos();// above function helps to store the token and fetch the todos from the DS
        setTodos(todos);
    }
    // remove the token from local storage
    const handleLogOut = () => {
        setisLoggedIn(false);
        localStorage.removeItem('token');
        localStorage.removeItem('todos');
        localStorage.removeItem('user');
        setTodos([]);

    }

    // Handle username editing
    const handleEditUsername = () => {
        setIsEditingUsername(true);
        setEditedUsername(showUserName);
        setUsernameError('');
    }

    const handleSaveUsername = async () => {
        const trimmedUsername = editedUsername.trim();
        
        // Validation
        if (!trimmedUsername) {
            setUsernameError('Username cannot be empty');
            return;
        }

        // Username validation: 3-20 characters, letters, numbers, underscores, and hyphens only
        const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
        if (!usernameRegex.test(trimmedUsername)) {
            setUsernameError('Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens');
            return;
        }

        // Don't update if username hasn't changed
        if (trimmedUsername === showUserName) {
            setIsEditingUsername(false);
            setUsernameError('');
            return;
        }

        setIsUpdatingUsername(true);
        setUsernameError('');

        try {
            console.log('Updating username to:', trimmedUsername);
            const response = await api.put('/auth/update-username', {
                newUsername: trimmedUsername
            });

            console.log('Update username response:', response.data);

            // Check response structure - backend returns { message, data: { username, email, token } }
            const newUsername = response.data?.data?.username || response.data?.username;
            const newToken = response.data?.data?.token || response.data?.token;

            if (!newUsername || !newToken) {
                console.error('Invalid response structure:', response.data);
                setUsernameError('Invalid response from server');
                return;
            }

            // Update token in localStorage (IMPORTANT: backend returns new token)
            localStorage.setItem('token', newToken);
            
            // Update username in localStorage
            localStorage.setItem('user', JSON.stringify(newUsername));
            
            // Update state
            SetShowUserName(newUsername);
            setIsEditingUsername(false);
            
            // Show success message briefly
            setSendStatus('Username updated successfully!');
            setSendStatusType('success');
            setTimeout(() => setSendStatus(''), 3000);
        } catch (error) {
            console.error('Error updating username:', error);
            console.error('Error response:', error?.response?.data);
            
            // Handle different error scenarios
            if (error?.response?.status === 404) {
                setUsernameError('Update username endpoint not found. Please check if the backend server is running and the endpoint is available.');
            } else if (error?.response?.status === 401) {
                setUsernameError('Authentication failed. Please login again.');
            } else if (error?.response?.status === 400) {
                const errorMessage = error?.response?.data?.message || 'Invalid username format';
                setUsernameError(errorMessage);
            } else if (error?.response?.data?.message) {
                setUsernameError(error?.response?.data?.message);
            } else if (error?.message) {
                setUsernameError(`Network error: ${error.message}`);
            } else {
                setUsernameError('Failed to update username. Please try again.');
            }
        } finally {
            setIsUpdatingUsername(false);
        }
    }

    const handleCancelEditUsername = () => {
        setIsEditingUsername(false);
        setEditedUsername('');
        setUsernameError('');
    }

    const handleAddTodo = async () => {
        if (!title || !description || !time || !date) {
            setInputError('Please enter all the fields');
            return;
        } else {
            setInputError("");
            // Guest todo limit logic
            if (!isLoggedIn && todos.length >= 5) {
                setShowGuestLimitModal(true);
                return;
            }
            console.log('before addtodo function');
            const newTodo = createTodo(title, description, time, date);
            await addTodoToDS(newTodo);
            clearInputs();
        }
    };

    const clearInputs = () => {
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
    }

    // Clear error on input change
    const handleInputChange = (setter) => (e) => {
        setInputError("");
        setter(e.target.value);
    };

    // Send todos to email
    const handleSendTodosToEmail = async () => {
        setSendStatus("");
        setSendStatusType("");
        setSending(true);
        const token = localStorage.getItem('token');
        if (!token) {
            setSendStatus("You must be logged in to email your todos.");
            setSendStatusType("error");
            setSending(false);
            return;
        }
        try {
            const response = await api.post('/api/send-todos', {});
            setSendStatus(response.data.message || "Todos sent to your email!");
            setSendStatusType("success");
        } catch (error) {
            setSendStatus(error?.response?.data?.message || "Failed to send todos to email.");
            setSendStatusType("error");
        } finally {
            setSending(false);
            // Hide the toast after 3 seconds
            setTimeout(() => setSendStatus(""), 3000);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-primary-bg dark:bg-dark-bg p-2 md:p-4 gap-2 md:gap-4">{/*this is the main div*/}
            {/* Toast message for email send status */}
            {sendStatus && (
                <div className={`fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg font-semibold text-sm md:text-lg transition-all duration-300 max-w-[90%] md:max-w-none
                    ${sendStatusType === 'success' ? 'bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text' : 'bg-primary-red dark:bg-dark-red text-white'}`}
                >
                    {sendStatus}
                </div>
            )}
            <div className="w-full md:w-3/10 bg-primary-card dark:bg-dark-card flex flex-col justify-start items-center rounded-lg shadow-lg mb-2 md:mb-0">{/*Add you Todo and inputs*/}
                <div className="font-serif font-medium m-2 p-2 bg-primary-accent dark:bg-dark-accent text-white rounded-lg shadow-lg w-full text-center">
                        <h2 className="text-lg md:text-xl">Add Your Todo</h2>
                </div>
                {/* Inline error message */}
                {inputError && <div className="w-full text-center text-primary-red dark:text-dark-red font-semibold mb-2 text-sm px-2">{inputError}</div>}
               <div className="flex flex-col items-center w-full p-3 md:p-4">{/*inputs*/}
                        <input className="mb-3 p-3 md:p-2 text-base border border-primary-accent dark:border-dark-accent rounded-lg w-full focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text" type="text" placeholder="Title" required
                         value={title}
                         onChange={handleInputChange(setTitle)}  />
                        <textarea className="mb-3 p-3 md:p-2 text-base border border-primary-accent dark:border-dark-accent rounded-lg w-full h-32 md:h-32 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text resize-none"  type="text" placeholder="Description" required 
                         value={description}
                         onChange={handleInputChange(setDescription)}   />
                        <div className="flex flex-row gap-2 md:gap-1 w-full mb-3 md:m-1 justify-center">
                        <div className="relative flex-1 md:flex-none md:w-1/2 max-w-[48%] md:max-w-none">
                            <input 
                                className="w-full p-3 md:p-2 text-base border border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-transparent focus:text-primary-dark dark:focus:text-dark-text [&:not(:placeholder-shown)]:text-primary-dark dark:[&:not(:placeholder-shown)]:text-dark-text"  
                                type="date"
                                value={date}
                                onChange={handleInputChange(setDate)}
                                required
                            />
                            {!date && (
                                <span className="absolute left-3 top-3.5 md:top-2.5 text-base md:text-sm text-gray-400 dark:text-gray-500 pointer-events-none select-none">Date</span>
                            )}
                        </div>
                        <div className="relative flex-1 md:flex-none md:w-1/2 max-w-[48%] md:max-w-none">
                            <input 
                                className="w-full p-3 md:p-2 text-base border border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-transparent focus:text-primary-dark dark:focus:text-dark-text [&:not(:placeholder-shown)]:text-primary-dark dark:[&:not(:placeholder-shown)]:text-dark-text"  
                                type="time"
                                value={time}
                                onChange={handleInputChange(setTime)}
                                required
                            />
                            {!time && (
                                <span className="absolute left-3 top-3.5 md:top-2.5 text-base md:text-sm text-gray-400 dark:text-gray-500 pointer-events-none select-none">Time</span>
                            )}
                        </div>
                        </div>
                        <div className="flex flex-row space-x-2 w-full justify-between mt-2">
                        <button className="p-3 md:p-2 bg-primary-red dark:bg-dark-red text-white border-none shadow-md rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 w-1/2 text-base font-semibold transition-colors"  type="button"
                         onClick={clearInputs}   >
                        Clear
                        </button>
                        <button className="p-3 md:p-2 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text border-none shadow-md rounded-lg active:bg-green-500 dark:active:bg-green-600 hover:bg-green-500 dark:hover:bg-green-600 w-1/2 text-base font-semibold transition-colors"  type="button"
                         onClick={handleAddTodo}   >
                        Add
                        </button>
                        </div>
                </div>
            </div>
            <div className="w-full md:w-7/10 bg-primary-gray dark:bg-dark-gray rounded-lg flex flex-col shadow-lg flex-1 min-h-0">{/*work todo and Todolist*/}
                <div className="flex flex-col md:flex-row justify-between font-serif font-medium m-2 p-2 bg-primary-accent dark:bg-dark-accent text-white rounded-lg shadow-lg items-start md:items-center gap-2 md:gap-0">
                            <h1 className="text-2xl md:text-3xl p-2">Work To Do</h1>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full md:w-auto justify-start md:justify-end">
                                {/* Dark mode toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2.5 md:p-2 bg-primary-yellow dark:bg-dark-yellow text-primary-dark dark:text-dark-text rounded-lg active:bg-yellow-400 dark:active:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors text-lg md:text-base"
                                    aria-label="Toggle dark mode"
                                >
                                    {isDarkMode ? '☀️' : '🌙'}
                                </button>
                                {/* Email Todos Button */}
                                <button
                                    className="p-2.5 md:p-2 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text rounded-lg active:bg-teal-400 dark:active:bg-teal-500 hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors border-none flex items-center justify-center text-sm md:text-base px-3 md:min-w-[140px]"
                                    onClick={handleSendTodosToEmail}
                                    disabled={sending}
                                >
                                    {sending && <span className="animate-spin mr-2 w-4 h-4 md:w-5 md:h-5 border-2 border-t-transparent border-primary-dark dark:border-dark-text rounded-full inline-block"></span>}
                                    <span className="hidden sm:inline">Email My Todos</span>
                                    <span className="sm:hidden">📧 Email</span>
                                </button>
                                {!isLoggedIn ? (
                                    <div className="flex gap-2 md:gap-3">
                                        <button className="bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text px-4 py-2.5 md:py-2 border-none rounded active:bg-green-400 dark:active:bg-green-600 hover:bg-green-400 dark:hover:bg-green-600 text-sm md:text-base font-semibold transition-colors"
                                        onClick={() => { setShowLogIn(true) }}>
                                            Login
                                        </button>
                                        <button
                                        className="bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text px-4 py-2.5 md:py-2 rounded active:bg-teal-400 dark:active:bg-teal-500 hover:bg-teal-400 dark:hover:bg-teal-500 text-sm md:text-base font-semibold transition-colors"
                                        onClick={() => { setShowSignUp(true) }}>
                                        Signup
                                       </button>
                                    </div>
                                ):(<>
                                    <div className="flex flex-wrap gap-2 md:gap-2 items-center">
                                        {!isEditingUsername ? (
                                            <div className="flex items-center bg-primary-yellow dark:bg-dark-yellow border-none rounded-lg p-2 text-primary-dark dark:text-dark-text gap-2 text-sm md:text-base">
                                                <span className="hidden sm:inline">Hi, {showUserName}!</span>
                                                <span className="sm:hidden">Hi, {showUserName.length > 8 ? showUserName.substring(0, 8) + '...' : showUserName}!</span>
                                                <button
                                                    type="button"
                                                    onClick={handleEditUsername}
                                                    className="active:bg-yellow-400 dark:active:bg-yellow-500 hover:bg-yellow-400 dark:hover:bg-yellow-500 rounded p-1 transition-colors"
                                                    title="Edit username"
                                                    aria-label="Edit username"
                                                >
                                                    ✏️
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-start bg-primary-yellow dark:bg-dark-yellow border-none rounded-lg p-2 gap-1">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editedUsername}
                                                        onChange={(e) => {
                                                            setEditedUsername(e.target.value);
                                                            setUsernameError('');
                                                        }}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && !isUpdatingUsername) {
                                                                handleSaveUsername();
                                                            } else if (e.key === 'Escape') {
                                                                handleCancelEditUsername();
                                                            }
                                                        }}
                                                        maxLength={20}
                                                        className="px-2 py-1.5 md:py-1 text-sm md:text-base rounded border border-primary-accent dark:border-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent w-32 md:w-auto"
                                                        autoFocus
                                                        disabled={isUpdatingUsername}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveUsername}
                                                        disabled={isUpdatingUsername}
                                                        className="active:bg-green-400 dark:active:bg-green-500 hover:bg-green-400 dark:hover:bg-green-500 rounded p-1.5 md:p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                                                        title="Save"
                                                        aria-label="Save"
                                                    >
                                                        {isUpdatingUsername ? (
                                                            <span className="animate-spin w-4 h-4 border-2 border-t-transparent border-primary-dark dark:border-dark-text rounded-full inline-block"></span>
                                                        ) : (
                                                            '✓'
                                                        )}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={handleCancelEditUsername}
                                                        disabled={isUpdatingUsername}
                                                        className="active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 rounded p-1.5 md:p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Cancel"
                                                        aria-label="Cancel"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                {usernameError && (
                                                    <span className="text-xs text-primary-red dark:text-dark-red">
                                                        {usernameError}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <button
                                        className="bg-primary-red dark:bg-dark-red text-white px-4 py-2.5 md:py-2 rounded active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 text-sm md:text-base font-semibold transition-colors"
                                        onClick={handleLogOut}>
                                        Logout
                                        </button>
                                    </div>
                                    </>
                                )}
                            </div>
                </div>
                <div className="overflow-y-auto font-serif font-medium m-2 p-2 bg-primary-card dark:bg-dark-card rounded-lg shadow-lg flex-1 min-h-0">
                    {/* login Model */}
                    {showlogin && (
                        <Login
                        className='flex justify-center items-center'
                        onLogin={handleLogIn}
                        onCancel={() => { setShowLogIn(false) }}
                        onForgotPassword={() => { setShowLogIn(false); setShowForgotPassword(true); }}
                        onSignup={() => { setShowLogIn(false); setShowSignUp(true); }} />
                    )}
                    {/* Signup Modal */}
                    {showsignup && (
                    <Signup
                    onSignup={handleSignUp}
                    onCancel={() => setShowSignUp(false)}
                    onLogin={() => { setShowSignUp(false); setShowLogIn(true); }} />
            )}
                    {/* Forgot Password Modal */}
                    {showForgotPassword && (
                        <ForgotPassword
                        onCancel={() => setShowForgotPassword(false)}
                        onLogin={() => { setShowForgotPassword(false); setShowLogIn(true); }} />
                    )}
                    {todos.map((todo) => (
                        <div key={todo._id} className={`p-3 md:p-2 m-1 md:m-2 rounded-lg shadow-lg flex flex-col transition-colors duration-200 ${todo.done ? 'bg-primary-green/70 dark:bg-dark-green/70' : 'bg-white dark:bg-dark-card'}`}>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-2"> {/*div containing title and data/time */}
                            <div className="py-1.5 md:py-0.5 border-2 border-primary-accent dark:border-dark-accent rounded-lg px-2 md:p-1 text-sm md:text-base font-semibold text-primary-dark dark:text-dark-text bg-primary-gray dark:bg-dark-gray break-words flex-1">{todo.title}</div>
                            <div className="flex gap-2 md:space-x-2">
                            <div className="py-1 px-2 md:p-0.5 border-2 border-primary-accent dark:border-dark-accent rounded bg-primary-bg dark:bg-dark-bg text-primary-dark dark:text-dark-text text-xs md:text-sm whitespace-nowrap">{todo.date}</div>
                            <div className="py-1 px-2 md:p-0.5 border-2 border-primary-accent dark:border-dark-accent rounded bg-primary-bg dark:bg-dark-bg text-primary-dark dark:text-dark-text text-xs md:text-sm whitespace-nowrap">{todo.time}</div>
                            </div>
                            </div>
                            <div className="p-2 flex flex-col md:flex-row justify-between rounded-lg items-start md:items-center gap-3 md:gap-2">
                                <span className="text-primary-dark dark:text-dark-text text-sm md:text-base flex-1 break-words">{todo.description}</span>
                                <div className="flex flex-row gap-2 md:space-x-1 w-full md:w-auto">
                                <button className="flex-1 md:flex-none p-2.5 md:p-0.5 bg-primary-green dark:bg-dark-green text-white shadow-md rounded-lg active:bg-green-500 dark:active:bg-green-600 hover:bg-green-500 dark:hover:bg-green-600 px-4 md:px-3 text-sm md:text-base font-semibold transition-colors" onClick={() => markAsDone(todo._id)}>
                                    {todo.done ? '✓ Done' : 'Done'}</button>
                                <button className="flex-1 md:flex-none p-2.5 md:p-0.5 bg-primary-red dark:bg-dark-red text-white shadow-md rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 px-4 md:px-3 text-sm md:text-base font-semibold transition-colors" onClick={() => deleteTodo(todo._id)}>
                                    Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {showGuestLimitModal && (
                <GuestLimitModal
                    onLogin={() => { setShowGuestLimitModal(false); setShowLogIn(true); }}
                    onSignup={() => { setShowGuestLimitModal(false); setShowSignUp(true); }}
                    onClose={() => setShowGuestLimitModal(false)}
                />
            )}
        </div>
    )
}
