import { useEffect, useState } from 'react';
import Draggable from "react-draggable";
import {
  loginWithGoogle,
  logout,
} from './utils/firebase-auth';
import {
  createTodo,
  readTodos,
  updateTodo,
  deleteTodo,
} from './utils/firebase-db';

const App = () => {
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [showEdit, setEdit] = useState(false);
  const [currentId, setId] = useState("");
  const [currentTitle, setTitle] = useState("");
  const [currentDate , setDate] = useState("");
  const [currentPriority, setPriority] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    console.log('user useEffect');

    if (user) {
      readTodos(user.uid).then(todos => {
        setTodos(todos);
      });
    } else if (storedUser) {
      setUser(storedUser);
      readTodos(storedUser.uid).then(todos => {
        setTodos(todos);
      });
    }
  }, []);

  useEffect(() => {
    user
      ? localStorage.setItem('user', JSON.stringify(user))
      : localStorage.removeItem('user');
  }, [user]);

  const handleGoogleLogin = () => {
    loginWithGoogle()
      .then(user => {
        setUser({
          uid: user.uid,
          name: user.displayName,
          photoURL: user.photoURL,
        });
      })
      .catch(error => {
        console.log(error);
      });
  };


  const handleLogout = () => {
    logout()
      .then(() => {
        setUser(null);
        setTodos([]);
      })
      .catch(error => {
        console.log(error);
      });
  };

  const handleStop = (e, data, todoId) => {
    //get x and y from data object 
    console.log(data);
    const x = data.x;
    const y = data.y;
    console.log(x,y)
    updateTodo(todoId, { x: x, y: y,})
  }

  const handleTodoEdit = (event) => {
    event.preventDefault();
    const todoTitle = event.target.titleedit.value;
    const todoDate = event.target.dateedit.value;
    const todoId = event.target.id.value;
    updateTodo(todoId, { title: todoTitle, date: todoDate })
    readTodos(user.uid).then(todos => {
      setTodos(todos);
    });
    setEdit(false);
    }

  const handleTodoAdd = event => {
    const todoTitle = event.target.title.value;
    const todoDate = event.target.date.value;
    const priority = event.target.priority.value;
    event.preventDefault();

    if (todoTitle) {
      const newTodo = {
        title: todoTitle,
        date: todoDate,
        priority: priority,
        completed: false,
        userRef: user.uid,
        x: 0,
        y: 0
      };

      createTodo(newTodo).then(todoId => {
        setTodos([
          ...todos,
          {
            id: todoId,
            ...newTodo,
          },
        ]);
      });
    }

    event.target.title.value = '';
  };

  return user ? (
    <div>
      <header>
        <h1>Hello {user.name}</h1>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <form onSubmit={handleTodoAdd} className='container'>
        <input type='text' required maxLength={30} placeholder='Enter todo' name='title' id='title' />
        <input type='date' required placeholder='Enter date' name='date' id='date' />
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority">
          <option value="extreme">Extreme</option>
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </select>
        <button type='submit'>Add</button>
      </form>
      {showEdit &&
      <form onSubmit={handleTodoEdit} className='container'>
        <input type='textedit' maxLength={30} placeholder='Enter todo' name='titleedit' id='titleedit' value={currentTitle} onChange={(e)=> setTitle(e.target.value)} />
        <input type='text' required placeholder={currentId} name='id' id='id' value={currentId}  onChange={(e)=> setId(e.target.value)} />
        <input type='date' placeholder='Enter date' name='dateedit' id='dateedit' value={currentDate}  onChange={(e)=> setDate(e.target.value)} />
        <label htmlFor="priority">Priority</label>
        <select id="priority" name="priority" value={currentPriority} onChange={(e)=> setPriority(e.target.value)}>
          <option value="extreme">Extreme</option>
          <option value="large">Large</option>
          <option value="medium">Medium</option>
          <option value="small">Small</option>
        </select>
        <button type='submit'>Edit</button>
      </form>
      }
      <ul className='container'>
        {todos.map(todo => (
           <Draggable defaultPosition={{x: 0, y: todo.y}} bounds={{left: 0, top: 0, right: 100, bottom: 200}} axis="y" grid={[25, 25]} onStop={(event, data) => handleStop(event, data, todo.id)}>
          <li key={todo.id} style={{backgroundColor: todo.priority === "small" ? "green" : todo.priority === "medium" ? "orange" : todo.priority === "high" ? "red" : "red"}}>
            {todo.completed ? <div>{todo.completed ? '✅' : '❌'}<s> {todo.title}</s></div> : <span>{todo.completed ? '✅' : '❌'} {todo.title}</span>}
            <span>for the {todo.date}</span>
            <div className='todo-btns'>
              <button
                onClick={() => {
                  updateTodo(todo.id, { completed: !todo.completed }).then(
                    () => {
                      setTodos(
                        todos.map(t =>
                          t.id === todo.id
                            ? { ...t, completed: !todo.completed }
                            : t,
                        ),
                      );
                    },
                  );
                }}
              >
                {todo.completed ? 'Uncomplete' : 'Complete'}
              </button>
              <button
                onClick={() => {
                  deleteTodo(todo.id).then(() => {
                    setTodos(todos.filter(t => t.id !== todo.id));
                  });
                }}
              >
                Delete
              </button>
              <button onClick={() => {setEdit(true), setId(todo.id), setDate(todo.date), setTitle(todo.title), setPriority(todo.priority)}}>Edit</button>
            </div>
          </li>
          </Draggable>
        ))}
      </ul>
    </div>
  ) : (
    <div>
      <header>
        <h1>Login</h1>
      </header>
      <div className='login-btns'>
        <button onClick={handleGoogleLogin}>Login with Google</button>
      </div>
    </div>
  );
};

export default App;
