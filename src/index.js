const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const username = request.get("username")

  if (users.find(user => user.username === username)) {
    request.body.username = username
    return next()
  }
  return response.status(404).send({ error: "Usuário não encontrado" })
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  if (users.filter(user => user.username === username).length === 0) {
    const new_user = {
      id: uuid(),
      name,
      username,
      todos: []
    }

    users.push(new_user)

    return response.status(201).send(new_user)
  }

  return response.status(400).send({ error: "Usuário já cadastrado" })
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.body
  const user = users.find(user => user.username === username)

  return response.status(200).send(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { username, title, deadline } = request.body
  const user = users.find(user => user.username === username)
  const todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username, title, deadline } = request.body
  const { id } = request.params
  const user = users.find(user => user.username === username)
  const todoIndexOf = user.todos.findIndex(todo => todo.id === id)

  if (todoIndexOf >= 0) {
    const todo = user.todos[todoIndexOf]
    todo.title = title
    todo.deadline = new Date(deadline)
    user.todos[todoIndexOf] = todo

    return response.status(200).send(todo)
  }

  return response.status(404).send({ error: "O usuário não tem um TODO com o ID especificado" })
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.body
  const { id } = request.params
  const user = users.find(user => user.username === username)
  const todoIndexOf = user.todos.findIndex(todo => todo.id === id)

  if (todoIndexOf >= 0) {
    const todo = user.todos[todoIndexOf]
    todo.done = true
    user.todos[todoIndexOf] = todo

    return response.status(200).send(todo)
  }

  return response.status(404).send({ error: "O usuário não tem um TODO com o ID especificado" })
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.body
  const { id } = request.params
  const user = users.find(user => user.username === username)
  const todoIndexOf = user.todos.findIndex(todo => todo.id === id)

  if (todoIndexOf >= 0) {
    user.todos.splice(todoIndexOf, 1)

    return response.status(204).end()
  }

  return response.status(404).send({ error: "O usuário não tem um TODO com o ID especificado" })
});

module.exports = app;