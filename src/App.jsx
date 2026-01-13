import { useEffect, useState } from 'react'
import './App.css'
import api from './utils/api';
import { TodoList } from './component/Todolist'
import GuestLimitModal from './component/GuestLimitModal';
import SocialButtons from './component/SocialButtons';

function App() {
  const [todos, setTodos] = useState(() => {
    const storedTodos = JSON.parse(localStorage.getItem('todos'));
    return Array.isArray(storedTodos) ? storedTodos : [];
  });
  const [showGuestLimitModal, setShowGuestLimitModal] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  // Check for dark mode preference on app load
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save todos to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  // adding the todo to the database 
  const addTodoToDB = async (newTodo) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await api.post('/api/todos', newTodo);
        const savedTodo = response.data;
        setTodos([...todos, savedTodo]);
      } catch (error) {
        console.log('error in the adding the todo to the DB', error);
      }
    } else {
      // Guest limit logic: only allow up to 5 todos
      if (todos.length >= 5) {
        setShowGuestLimitModal(true);
        return;
      } else {
        // Allow guest to add todo locally
        setTodos([...todos, newTodo]);
      }
    }
  }

  // mark it as a Done
  const markAsDone = async (_id) => {
    const token=localStorage.getItem('token');
    if (token) {
      try {
        await api.put(`/api/todos/${_id}`);
        const updatedTodos = todos.map((todo => todo._id === _id ? { ...todo, done: true } : todo));
        setTodos(updatedTodos);
      } catch (error) {
        console.log('error in the marking todo is ', error);
      }
    } else {
      // For guests, just update local todos
      const updatedTodos = todos.map((todo => todo._id === _id ? { ...todo, done: true } : todo));
      setTodos(updatedTodos);
    }
  }

  // Deleting the todo  from local storage and DB
  const deleteTodo = async (_id) => {
    const token=localStorage.getItem('token');
    if (token) {
      try {
        await api.delete(`/api/todos/${_id}`);
      const updatedTodos = todos.filter(todo => todo._id !== _id);
      setTodos(updatedTodos);
      } catch (error) {
        console.log('error message while deleting is', error)
        console.log(_id)
      }
    } else {
      // For guests, just update local todos
      const updatedTodos = todos.filter(todo => todo._id !== _id);
      setTodos(updatedTodos);
    }
  }

  return (
    <div className="min-h-screen bg-primary-bg dark:bg-dark-bg transition-colors duration-200">
      <TodoList todos={todos} addTodoToDS={addTodoToDB} 
      deleteTodo={deleteTodo} markAsDone={markAsDone}
       setTodos={setTodos} />
      {showGuestLimitModal && (
        <GuestLimitModal
          onLogin={() => { setShowGuestLimitModal(false); setShowLogin(true); }}
          onSignup={() => { setShowGuestLimitModal(false); setShowSignup(true); }}
          onClose={() => setShowGuestLimitModal(false)}
        />
      )}
      <SocialButtons />
    </div>
  )
}

export default App
