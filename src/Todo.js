import { readFile, writeFile } from "fs";
import { promisify } from "util";

const readFileAsync = promisify(readFile);

export class Todo {
  //? Array to hold all todos
  static todos = [];

  /*
   ? Read all todos from the json file 
   */
  static async loadTodosFromFile() {
    const data = await readFileAsync("./src/todos.json");
    try {
      Todo.todos = data ? JSON.parse(data) : [];
    } catch (error) {
      Todo.todos = [];
    }
  }

  /*
   ? Write the todos to the json file
   */
  static async saveTodosToFile() {
    writeFile("./src/todos.json", JSON.stringify(Todo.todos), (err) => {
      if (err) {
        return false;
      }
      return true;
    });
  }

  /**
   * Crate new todo and save it to the json file
   * @param {String} title
   * @param {String} description
   * @returns true if created, false otherwise
   */
  static createTodo({ title, description }) {
    //* Generate random id
    const id = Math.floor(Math.random() * 500);
    const todo = { id, title, description, completed: false };

    Todo.todos.push(todo);
    const success = Todo.saveTodosToFile();
    return { success, todoId: id };
  }

  /**
   * Remove todo from the array of todos and update the json file
   * @param {Number} todoId
   * @returns
   */
  static removeTodo(todoId) {
    //* Get the todo index by id
    const todoIndex = Todo.todos.findIndex((todo) => todo.id === todoId);

    //? Check if the todo exists
    if (todoIndex > -1) {
      Todo.todos.splice(todoIndex, 1);
      Todo.saveTodosToFile();
      return true;
    }
    return false;
  }

  /**
   * Toggle todo completed status
   * @param {Number} todoId
   * @returns true if toggled, false otherwise
   */
  static toggle(todoId) {
    //* Get the todo index by id
    const todoIndex = Todo.todos.findIndex((todo) => todo.id === todoId);

    //? Check if the todo exists
    if (todoIndex > -1) {
      Todo.todos.at(todoIndex).completed = !Todo.todos.at(todoIndex).completed;
      Todo.saveTodosToFile();
      return true;
    }
    return false;
  }

  /**
   * Search for todo
   * @param {number | string} searchCriteria
   * @returns todo if found
   */
  static searchForTodo(searchCriteria) {
    if (typeof searchCriteria === "number") {
      return Todo.todos.find((todo) => todo.id === searchCriteria);
    } else if (typeof searchCriteria === "string") {
      return Todo.todos.find((todo) => todo.title.includes(searchCriteria));
    }
  }

  /**
   * @returns List of completed todos
   */
  static getAllCompletedTodos() {
    return Todo.todos.filter((todo) => todo.completed === true);
  }

  /**
   * @returns List of not completed todos
   */
  static getAllRemainingTodos() {
    const todos = Todo.todos.filter((todo) => todo.completed !== true);
    return todos;
  }

  /**
   * Get all saved todos
   * @returns list of all todos
   */
  static getAllTodos() {
    return Todo.todos;
  }
}
