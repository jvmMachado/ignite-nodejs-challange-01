const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const userIndex = users.findIndex(user => user.username === username);

  if (userIndex !== -1) {
    request.userIndex = userIndex;
    return next();
  } else {
    return response.status(404).json({error: "user does not exist!"});
  }
}

app.post('/users', (request, response) => {
  const {name, username} = request.body;

  const userNameExists = users.some(user => user.username === username);

  if(userNameExists) return response.status(400).json({error: "username already exists!"});

  const newUser = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  }

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const userIndex = request.userIndex;

  const userTodos = users[userIndex].todos;

  return response.json(userTodos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const userIndex = request.userIndex;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline), 
    created_at: new Date(),
  }

  users[userIndex].todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const userIndex = request.userIndex;
  const userTodos = users[userIndex].todos;
  
  const userTodoToChange = userTodos.find(todo => todo.id === id);

  if(userTodoToChange !== undefined) {
    userTodoToChange.title = title;
    userTodoToChange.deadline = deadline;

    return response.status(200).json(userTodoToChange);
  } else {
    return response.status(404).json({error: "no todo found with this ID"});
  }

  
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const userIndex = request.userIndex;
  const userTodos = users[userIndex].todos;
  
  const userTodoToChange = userTodos.find(todo => todo.id === id);

  if(userTodoToChange !== undefined) {
    userTodoToChange.done = true;
    return response.status(200).json(userTodoToChange);
  } else {
    return response.status(404).json({error: "no todo found with this ID"});
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const userIndex = request.userIndex;
  const userTodos = users[userIndex].todos;

  const userTodoIndex = userTodos.findIndex(todo => todo.id === id);

  if(userTodoIndex !== -1) {
    userTodos.splice(userTodoIndex, 1);
    return response.status(204).send();
  } else {
    return response.status(404).json({error: "no todo found with this ID"});
  }
});

// app.listen(3333, () => console.log('app running and listening on port 3333'));

module.exports = app;