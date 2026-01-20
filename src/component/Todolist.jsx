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
    const [showTodoForm, setShowTodoForm] = useState(false); // Toggle todo form visibility

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
                    const parsedUser = JSON.parse(savedUser);
                    // Handle case where user might be an object with {id, username} or just a string
                    const username = typeof parsedUser === 'object' && parsedUser !== null && parsedUser.username 
                        ? parsedUser.username 
                        : (typeof parsedUser === 'string' ? parsedUser : '');
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
          if (user) {
            try {
              const parsedUser = JSON.parse(user);
              // Handle case where user might be an object with {id, username} or just a string
              const username = typeof parsedUser === 'object' && parsedUser !== null && parsedUser.username 
                  ? parsedUser.username 
                  : (typeof parsedUser === 'string' ? parsedUser : '');
              SetShowUserName(username);
            } catch (error) {
              console.log('Error parsing username:', error);
            }
          }

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
        // Ensure showUserName is a string, not an object
        const usernameString = typeof showUserName === 'object' && showUserName !== null && showUserName.username 
            ? showUserName.username 
            : (typeof showUserName === 'string' ? showUserName : '');
        setEditedUsername(usernameString);
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
        // Ensure showUserName is a string for comparison
        const currentUsername = typeof showUserName === 'object' && showUserName !== null && showUserName.username 
            ? showUserName.username 
            : (typeof showUserName === 'string' ? showUserName : '');
        if (trimmedUsername === currentUsername) {
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
            // Close form after successful addition (optional - can keep it open if user prefers)
            // setShowTodoForm(false);
        }
    };

    const clearInputs = () => {
        setTitle("");
        setDescription("");
        setDate("");
        setTime("");
        setInputError("");
    }

    const toggleTodoForm = () => {
        setShowTodoForm(!showTodoForm);
        // Clear errors when closing
        if (showTodoForm) {
            setInputError("");
        }
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
        <div className="min-h-screen flex flex-col md:flex-row bg-primary-bg dark:bg-dark-bg p-2 md:p-4 gap-2 md:gap-4 relative">{/*this is the main div*/}
            {/* Toast message for email send status */}
            {sendStatus && (
                <div className={`fixed top-4 md:top-6 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg font-semibold text-sm md:text-lg transition-all duration-300 max-w-[90%] md:max-w-none
                    ${sendStatusType === 'success' ? 'bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text' : 'bg-primary-red dark:bg-dark-red text-white'}`}
                >
                    {sendStatus}
                </div>
            )}
            
            {/* Floating Action Button (FAB) for Mobile - Shows when form is collapsed */}
            {!showTodoForm && (
                <button
                    onClick={toggleTodoForm}
                    className="fixed bottom-6 right-6 md:hidden w-16 h-16 rounded-full bg-primary-accent dark:bg-dark-accent text-white shadow-2xl flex items-center justify-center text-3xl font-bold z-40 hover:scale-110 active:scale-95 transition-transform duration-200 animate-pulse hover:animate-none"
                    aria-label="Add new todo"
                    title="Add New Todo"
                >
                    +
                </button>
            )}
            {/* Add Todo Card - Collapsible - Minimal when closed */}
            <div className={`w-full ${showTodoForm ? 'md:w-[35%]' : 'md:w-[280px]'} bg-primary-card dark:bg-dark-card rounded-lg shadow-lg mb-2 md:mb-0 transition-all duration-300 overflow-hidden ${showTodoForm ? 'md:min-h-[450px]' : 'h-auto'}`}>
                {/* Card Header - Always Visible - Compact */}
                <div 
                    className="font-serif font-medium p-3 md:p-4 bg-gradient-to-r from-primary-accent to-primary-teal dark:from-dark-accent dark:to-dark-teal text-white rounded-lg cursor-pointer flex items-center justify-between hover:shadow-lg transition-all"
                    onClick={toggleTodoForm}
                >
                    <h2 className="text-base md:text-lg font-semibold">Add New Todo</h2>
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleTodoForm();
                        }}
                        className={`w-9 h-9 md:w-10 md:h-10 rounded-full bg-white dark:bg-dark-gray text-primary-accent dark:text-dark-accent flex items-center justify-center text-xl md:text-2xl font-bold shadow-md hover:scale-110 active:scale-95 transition-transform duration-200 ${showTodoForm ? 'rotate-45' : 'rotate-0'}`}
                        aria-label={showTodoForm ? 'Close form' : 'Open form'}
                    >
                        +
                    </button>
                </div>

                {/* Collapsible Form Content */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showTodoForm ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    {/* Error message */}
                    {inputError && (
                        <div className="mx-3 md:mx-4 mt-3 p-2 text-center text-primary-red dark:text-dark-red font-semibold text-sm bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                            {inputError}
                        </div>
                    )}
                    
                    {/* Form Inputs */}
                    <div className="flex flex-col items-center w-full p-4 md:p-5 space-y-3 md:space-y-4">
                        {/* Title Input */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-primary-dark dark:text-dark-text mb-1.5">
                                Title <span className="text-red-500">*</span>
                            </label>
                            <input 
                                className="w-full p-3 text-base border-2 border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:border-transparent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text placeholder-gray-400 dark:placeholder-gray-500" 
                                type="text" 
                                placeholder="Enter todo title..." 
                                required
                                value={title}
                                onChange={handleInputChange(setTitle)}  
                            />
                        </div>

                        {/* Description Input */}
                        <div className="w-full">
                            <label className="block text-sm font-medium text-primary-dark dark:text-dark-text mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea 
                                className="w-full p-3 text-base border-2 border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:border-transparent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text resize-none min-h-[100px] placeholder-gray-400 dark:placeholder-gray-500" 
                                placeholder="Enter todo description..."
                                required 
                                value={description}
                                onChange={handleInputChange(setDescription)}   
                            />
                        </div>

                        {/* Date and Time Inputs */}
                        <div className="flex flex-row gap-3 w-full">
                            <div className="relative flex-1">
                                <label className="block text-sm font-medium text-primary-dark dark:text-dark-text mb-1.5">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    className="w-full p-3 text-sm md:text-base border-2 border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:border-transparent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text"  
                                    type="date"
                                    value={date}
                                    onChange={handleInputChange(setDate)}
                                    required
                                />
                            </div>
                            <div className="relative flex-1">
                                <label className="block text-sm font-medium text-primary-dark dark:text-dark-text mb-1.5">
                                    Time <span className="text-red-500">*</span>
                                </label>
                                <input 
                                    className="w-full p-3 text-sm md:text-base border-2 border-primary-accent dark:border-dark-accent rounded-lg focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent focus:border-transparent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text"  
                                    type="time"
                                    value={time}
                                    onChange={handleInputChange(setTime)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-row gap-3 w-full pt-2">
                            <button 
                                className="flex-1 p-3 bg-primary-red dark:bg-dark-red text-white border-none shadow-md rounded-lg active:bg-red-400 dark:active:bg-red-500 hover:bg-red-400 dark:hover:bg-red-500 text-base font-semibold transition-colors flex items-center justify-center gap-2"  
                                type="button"
                                onClick={clearInputs}
                            >
                                <span>🗑️</span>
                                <span>Clear</span>
                            </button>
                            <button 
                                className="flex-1 p-3 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text border-none shadow-md rounded-lg active:bg-green-500 dark:active:bg-green-600 hover:bg-green-500 dark:hover:bg-green-600 text-base font-semibold transition-colors flex items-center justify-center gap-2"  
                                type="button"
                                onClick={handleAddTodo}
                            >
                                <span>✓</span>
                                <span>Add Todo</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className={`w-full ${showTodoForm ? 'md:w-[65%]' : 'md:w-[calc(100%-300px)]'} bg-primary-gray dark:bg-dark-gray rounded-lg flex flex-col shadow-lg flex-1 min-h-0 transition-all duration-300`}>{/*work todo and Todolist*/}
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
                                                {(() => {
                                                    // Ensure showUserName is always a string for rendering
                                                    const usernameString = typeof showUserName === 'object' && showUserName !== null && showUserName.username 
                                                        ? showUserName.username 
                                                        : (typeof showUserName === 'string' ? showUserName : '');
                                                    return (
                                                        <>
                                                            <span className="hidden sm:inline">Hi, {usernameString}!</span>
                                                            <span className="sm:hidden">Hi, {usernameString.length > 8 ? usernameString.substring(0, 8) + '...' : usernameString}!</span>
                                                        </>
                                                    );
                                                })()}
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
                    {todos.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 md:py-20 px-4 text-center">
                            <div className="text-6xl md:text-7xl mb-4 opacity-50">📝</div>
                            <h3 className="text-xl md:text-2xl font-semibold text-primary-dark dark:text-dark-text mb-2">
                                No Todos Yet
                            </h3>
                            <p className="text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6">
                                Click the + button to add your first todo!
                            </p>
                            <button
                                onClick={toggleTodoForm}
                                className="px-6 py-3 bg-gradient-to-r from-primary-accent to-primary-teal dark:from-dark-accent dark:to-dark-teal text-white rounded-lg shadow-lg hover:shadow-xl transition-all font-semibold text-base"
                            >
                                Add Your First Todo
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 md:gap-4 p-2 md:p-3">
                            {todos.map((todo, index) => {
                                // Create a color gradient based on index for visual variety
                                const colorSchemes = [
                                    { bg: 'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20', border: 'border-blue-200 dark:border-blue-700', accent: 'bg-blue-500 dark:bg-blue-600' },
                                    { bg: 'from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20', border: 'border-purple-200 dark:border-purple-700', accent: 'bg-purple-500 dark:bg-purple-600' },
                                    { bg: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20', border: 'border-green-200 dark:border-green-700', accent: 'bg-green-500 dark:bg-green-600' },
                                    { bg: 'from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20', border: 'border-orange-200 dark:border-orange-700', accent: 'bg-orange-500 dark:bg-orange-600' },
                                    { bg: 'from-cyan-50 to-teal-50 dark:from-cyan-900/20 dark:to-teal-900/20', border: 'border-cyan-200 dark:border-cyan-700', accent: 'bg-cyan-500 dark:bg-cyan-600' },
                                    { bg: 'from-rose-50 to-red-50 dark:from-rose-900/20 dark:to-red-900/20', border: 'border-rose-200 dark:border-rose-700', accent: 'bg-rose-500 dark:bg-rose-600' },
                                ];
                                const colors = todo.done 
                                    ? { bg: 'from-green-100 to-emerald-100 dark:from-green-800/40 dark:to-emerald-800/40', border: 'border-green-300 dark:border-green-600', accent: 'bg-green-500 dark:bg-green-600' }
                                    : colorSchemes[index % colorSchemes.length];
                                
                                return (
                                    <div 
                                        key={todo._id} 
                                        className={`bg-gradient-to-br ${colors.bg} ${colors.border} border-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 p-4 md:p-5 ${todo.done ? 'opacity-75' : ''}`}
                                    >
                                        {/* Header with Title and Status Badge */}
                                        <div className="flex items-start justify-between mb-3 gap-3">
                                            <h3 className={`text-lg md:text-xl font-bold text-primary-dark dark:text-dark-text flex-1 break-words ${todo.done ? 'line-through' : ''}`}>
                                                {todo.title}
                                            </h3>
                                            {todo.done && (
                                                <span className="flex-shrink-0 px-3 py-1 bg-green-500 dark:bg-green-600 text-white text-xs font-bold rounded-full shadow-md">
                                                    ✓ Completed
                                                </span>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className={`text-sm md:text-base text-gray-700 dark:text-gray-300 mb-4 leading-relaxed ${todo.done ? 'line-through opacity-70' : ''}`}>
                                            {todo.description}
                                        </p>

                                        {/* Footer with Date, Time, and Actions */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t-2 border-white/50 dark:border-gray-700/50">
                                            {/* Date and Time */}
                                            <div className="flex gap-2 flex-wrap">
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 ${colors.accent} text-white rounded-lg shadow-md text-xs md:text-sm font-semibold`}>
                                                    <span>📅</span>
                                                    <span>{todo.date}</span>
                                                </div>
                                                <div className={`flex items-center gap-1.5 px-3 py-1.5 ${colors.accent} text-white rounded-lg shadow-md text-xs md:text-sm font-semibold`}>
                                                    <span>🕐</span>
                                                    <span>{todo.time}</span>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2 w-full sm:w-auto">
                                                <button 
                                                    className={`flex-1 sm:flex-none px-4 py-2 ${todo.done ? 'bg-gray-400 dark:bg-gray-600' : 'bg-gradient-to-r from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600'} text-white rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all font-semibold text-sm md:text-base flex items-center justify-center gap-2`}
                                                    onClick={() => markAsDone(todo._id)}
                                                    disabled={todo.done}
                                                >
                                                    <span>{todo.done ? '✓' : '✓'}</span>
                                                    <span>{todo.done ? 'Completed' : 'Mark Done'}</span>
                                                </button>
                                                <button 
                                                    className="flex-1 sm:flex-none px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 dark:from-red-600 dark:to-rose-600 text-white rounded-lg shadow-md hover:shadow-lg active:scale-95 transition-all font-semibold text-sm md:text-base flex items-center justify-center gap-2"
                                                    onClick={() => deleteTodo(todo._id)}
                                                >
                                                    <span>🗑️</span>
                                                    <span>Delete</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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
