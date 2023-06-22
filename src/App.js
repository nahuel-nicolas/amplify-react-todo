import './App.css';

import React, { useEffect, useState } from 'react';
import { API, graphqlOperation } from 'aws-amplify';
import { createTodo, createUser, deleteTodo, deleteUser } from './graphql/mutations';
import { listTodos, listUsers } from './graphql/queries';
import { Select, Form, Button, Container, Card } from 'semantic-ui-react';

function App() {
  const [todo, setTodo] = useState({
    name: '',
    description: '',
    todoUserId: ''
  });

  const [myUser, setUser] = useState({
    name: '',
    email: '',
  });

  const [todos, setTodos] = useState([]);
  const [myUsers, setUsers] = useState([]);
  const [myUsersOptions, setUsersOptions] = useState([]);

  useEffect(() => {
    fetchTodos();
    fetchUsers();
  }, []);

  async function fetchTodos() {
    try {
      const { data } = await API.graphql(graphqlOperation(listTodos));
      const todos = data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.error('Error fetching todos:', err);
    }
  }

  async function fetchUsers() {
    try {
      const { data } = await API.graphql(graphqlOperation(listUsers));
      const myUsers = data.listUsers.items;
      setUsers(myUsers);
      setUsersOptions(myUsers.map(myUser => ({
        value: myUser.id,
        text: myUser.name
      })));
    } catch (err) {
      console.error('Error fetching myUsers:', err);
    }
  }

  const handleSubmitTodo = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.graphql(graphqlOperation(createTodo, { input: todo }));
      const newTodo = data.createTodo;
      setTodos(prevTodos => [...prevTodos, newTodo]);
    } catch (err) {
      console.error('Error creating todo:', err);
    }

    setTodo({
      name: '',
      description: '',
      todoUserId: '',
    });
  };

  const handleChangeTodo = event => {
    const { name, value } = event.target;
    setTodo(prevTodo => ({
      ...prevTodo,
      [name]: value
    }));
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();

    try {
      const { data } = await API.graphql(graphqlOperation(createUser, { input: myUser }));
      const newUser = data.createUser;
      setUsers(prevUsers => [...prevUsers, newUser]);
    } catch (err) {
      console.error('Error creating myUser:', err);
    }

    setUser({
      name: '',
      email: '',
    });
  };

  const handleChangeUser = event => {
    const { name, value } = event.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSelectChangeTodo = (event, { name, value }) => {
    setTodo(prevTodo => ({
      ...prevTodo,
      [name]: value
    }));
  };

  const handleDeleteTodo = async (e) => {
    const todoId = e.target.value;
    try {
      await API.graphql(graphqlOperation(deleteTodo, { input: { id: todoId } }));
      setTodos(prevTodos => prevTodos.filter(todo => todo.id !== todoId));
    } catch (err) {
      console.error('Error deleting todo:', err);
    }
  };

  const handleDeleteUser = async (e) => {
    const myUserId = e.target.value;
    try {
      await API.graphql(graphqlOperation(deleteUser, { input: { id: myUserId } }));
      setUsers(prevUsers => prevUsers.filter(myUser => myUser.id !== myUserId));
    } catch (err) {
      console.error('Error deleting myUser:', err);
    }
  };

  const renderUserCards = () => {
    return myUsers.map(myUser => (
      <Card key={myUser.id}>
        <Card.Content>
          <Card.Header>{myUser.name}</Card.Header>
          <Card.Meta>{myUser.email}</Card.Meta>
          <Button basic color="red" value={myUser.id} onClick={handleDeleteUser}>Delete</Button>
        </Card.Content>
      </Card>
    ));
  };

  const renderTodoCards = () => {
    return todos.map(todo => (
      <Card key={todo.id}>
        <Card.Content>
          <Card.Header>{todo.name}</Card.Header>
          <Card.Meta>Assigned to: {todo.user?.name}</Card.Meta>
          <Card.Description>{todo.description}</Card.Description>
          <Button basic color="red" value={todo.id} onClick={handleDeleteTodo}>Delete</Button>
        </Card.Content>
      </Card>
    ));
  };

  return (
    <div className="App">
      <h2>Create User</h2>
      <Form className='myform' onSubmit={handleSubmitUser}>
        <Form.Input type="text" name="name" onChange={handleChangeUser} value={myUser.name} />
        <Form.Input type="text" name="email" onChange={handleChangeUser} value={myUser.email} />
        <Button type="submit">Submit</Button>
      </Form>
      <h2>Create Todo</h2>
      <Container>
        <Form className='myform' onSubmit={handleSubmitTodo}>
          <Form.Input type="text" name="name" onChange={handleChangeTodo} value={todo.name} />
          <Form.Input type="text" name="description" onChange={handleChangeTodo} value={todo.description} />
          <Select
            required
            label='Status'
            placeholder='Select task status'
            name="todoUserId"
            options={myUsersOptions}
            value={todo.todoUserId}
            onChange={handleSelectChangeTodo}
          />
          <br />
          <Button type="submit">Submit</Button>
        </Form>
      </Container>
      <h2>Users</h2>
      <Card.Group>{renderUserCards()}</Card.Group>
      <h2>Todos</h2>
      <Card.Group>{renderTodoCards()}</Card.Group>
    </div>
  );
}

export default App;
