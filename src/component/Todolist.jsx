import { Login } from "./Login";
import { Signup } from "./Signup";
import { createTodo } from "./Todos";
import GuestLimitModal from "./GuestLimitModal";
import axios from "axios";
import React, { useEffect, useState } from "react";

export const TodoList = ({ todos, addTodoToDS, deleteTodo, markAsDone, setTodos }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [isLoggedIn, setisLoggedIn] = useState(false);
    const [showlogin, setShowLogIn] = useState(false);
    const [showsignup, setShowSignUp] = useState(false);
    const [showUserName, SetShowUserName] = useState('');
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
          const response = await axios.get('http://localhost:8000/api/todos', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
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
            const response = await axios.post('http://localhost:8000/api/send-todos', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
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
        <div className="p-1 flex flex-col space-x-2 h-screen md:flex-row bg-primary-bg dark:bg-dark-bg">{/*this is the main div*/}
            {/* Toast message for email send status */}
            {sendStatus && (
                <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg font-semibold text-lg transition-all duration-300
                    ${sendStatusType === 'success' ? 'bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text' : 'bg-primary-red dark:bg-dark-red text-white'}`}
                >
                    {sendStatus}
                </div>
            )}
            <div className="w-full bg-primary-card dark:bg-dark-card flex flex-col justify-start items-center rounded-lg md:w-3/10 shadow-lg">{/*Add you Todo and inputs*/}
                <div className="font-serif font-medium m-2 p-2 bg-primary-accent dark:bg-dark-accent text-white rounded-lg shadow-lg">
                        <h2>Add Your Todo</h2>
                </div>
                {/* Inline error message */}
                {inputError && <div className="w-full text-center text-primary-red dark:text-dark-red font-semibold mb-2">{inputError}</div>}
               <div className="flex flex-col items-center w-full p-2">{/*inputs*/}
                        <input className="mb-2 p-2 border border-primary-accent dark:border-dark-accent rounded-lg w-full focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text" type="text" placeholder="Title" required
                         value={title}
                         onChange={handleInputChange(setTitle)}  />
                        <textarea className="mb-2 p-2 border border-primary-accent dark:border-dark-accent rounded-lg w-full h-32 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text"  type="text" placeholder="Description" required 
                         value={description}
                         onChange={handleInputChange(setDescription)}   />
                        <div className="flex flex-row space-x-1 m-1 w-full">
                        <input className="mb-2 p-2 border border-primary-accent dark:border-dark-accent rounded-lg w-1/2 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text"  type="date"
                        value={date}
                        onChange={handleInputChange(setDate)}/>
                        <input className="mb-2 p-2 border border-primary-accent dark:border-dark-accent rounded-lg w-1/2 focus:ring-2 focus:ring-primary-accent dark:focus:ring-dark-accent bg-white dark:bg-dark-gray text-primary-dark dark:text-dark-text"  type="time"
                          value={time}
                          onChange={handleInputChange(setTime)}  />
                        </div>
                        <div className="flex flex-row space-x-2 w-full justify-between mt-2">
                        <button className="p-2 bg-primary-red dark:bg-dark-red text-white border-none shadow-md rounded-lg hover:bg-red-400 dark:hover:bg-red-500 w-1/2"  type="button"
                         onClick={clearInputs}   >
                        Clear
                        </button>
                        <button className="p-2 bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text border-none shadow-md rounded-lg hover:bg-green-500 dark:hover:bg-green-600 w-1/2"  type="button"
                         onClick={handleAddTodo}   >
                        Add
                        </button>
                        </div>
                </div>
            </div>
            <div className="w-7/10 bg-primary-gray dark:bg-dark-gray rounded-lg flex flex-col w-full shadow-lg">{/*work todo and Todolist*/}
                <div className="flex justify-between font-serif font-medium m-2 p-2 bg-primary-accent dark:bg-dark-accent text-white rounded-lg shadow-lg items-center">
                            <h1 className="flex text-3xl p-2">Work To Do</h1>
                            <div className="flex items-center space-x-3">
                                {/* Dark mode toggle */}
                                <button
                                    onClick={toggleDarkMode}
                                    className="p-2 bg-primary-yellow dark:bg-dark-yellow text-primary-dark dark:text-dark-text rounded-lg hover:bg-yellow-400 dark:hover:bg-yellow-500 transition-colors"
                                >
                                    {isDarkMode ? '☀️' : '🌙'}
                                </button>
                                {/* Email Todos Button */}
                                <button
                                    className="p-2 bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text rounded-lg hover:bg-teal-400 dark:hover:bg-teal-500 transition-colors border-none flex items-center min-w-[140px] justify-center"
                                    onClick={handleSendTodosToEmail}
                                    disabled={sending}
                                >
                                    {sending && <span className="animate-spin mr-2 w-5 h-5 border-2 border-t-transparent border-primary-dark dark:border-dark-text rounded-full inline-block"></span>}
                                    Email My Todos
                                </button>
                                {!isLoggedIn ? (
                                    <div className="flex space-x-3">
                                        <button className="bg-primary-green dark:bg-dark-green text-primary-dark dark:text-dark-text px-4 py-2 border-none rounded hover:bg-green-400 dark:hover:bg-green-600"
                                        onClick={() => { setShowLogIn(true) }}>
                                            Login
                                        </button>
                                        <button
                                        className="bg-primary-teal dark:bg-dark-teal text-primary-dark dark:text-dark-text px-4 py-2 rounded hover:bg-teal-400 dark:hover:bg-teal-500"
                                        onClick={() => { setShowSignUp(true) }}>
                                        Signup
                                       </button>
                                    </div>
                                ):(<>
                                    <div className="flex space-x-2 flex-end py-1">
                                        <div className="flex bg-primary-yellow dark:bg-dark-yellow border-none rounded-lg p-2 text-primary-dark dark:text-dark-text">
                                            Hi, {showUserName}!
                                        </div>
                                        <button
                                        className="flex bg-primary-red dark:bg-dark-red text-white px-4 py-2 rounded hover:bg-red-400 dark:hover:bg-red-500"
                                        onClick={handleLogOut}>
                                        Logout
                                        </button>
                                    </div>
                                    </>
                                )}
                            </div>
                </div>
                <div className="overflow-y-auto font-serif font-medium m-2 p-2 bg-primary-card dark:bg-dark-card rounded-lg shadow-lg h-full">
                    {/* login Model */}
                    {showlogin && (
                        <Login
                        className='flex justify-center items-center'
                         onLogin={handleLogIn}
                        onCancel={() => { setShowLogIn(false) }} />
                    )}
                    {/* Signup Modal */}
                    {showsignup && (
                    <Signup
                    onSignup={handleSignUp}
                    onCancel={() => setShowSignUp(false)}/>
            )}
                    {todos.map((todo) => (
                        <div key={todo._id} className={`p-2 m-1 rounded shadow-lg flex flex-col transition-colors duration-200 ${todo.done ? 'bg-primary-green/70 dark:bg-dark-green/70' : 'bg-white dark:bg-dark-card'}`}>
                            <div className="flex justify-between items-center"> {/*div containing title and data/time */}
                            <div className="py-0.5 border-2 border-primary-accent dark:border-dark-accent rounded-lg p-1 text-primary-dark dark:text-dark-text bg-primary-gray dark:bg-dark-gray">{todo.title}</div>
                            <div className="flex space-x-2">
                            <div className="p-0.5 border-2 border-primary-accent dark:border-dark-accent rounded bg-primary-bg dark:bg-dark-bg text-primary-dark dark:text-dark-text">{todo.date}</div>
                            <div className="p-0.5 border-2 border-primary-accent dark:border-dark-accent rounded bg-primary-bg dark:bg-dark-bg text-primary-dark dark:text-dark-text">{todo.time}</div>
                            </div>
                            </div>
                            <div className="p-2 flex justify-between rounded-lg items-center">
                                <span className="text-primary-dark dark:text-dark-text">{todo.description}</span>
                                <div className="flex flex-row space-x-1">
                                <button className="flex p-0.5 bg-primary-green dark:bg-dark-green text-white shadow-md rounded-lg hover:bg-green-500 dark:hover:bg-green-600 self-end px-3" onClick={() => markAsDone(todo._id)}>
                                    Done</button>
                                <button className="flex p-0.5 bg-primary-red dark:bg-dark-red text-white shadow-md rounded-lg hover:bg-red-400 dark:hover:bg-red-500 self-end px-3" onClick={() => deleteTodo(todo._id)}>
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
