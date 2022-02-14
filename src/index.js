import inquirer from "inquirer";
import chalk from "chalk";
import { createSpinner } from "nanospinner";
import { Todo } from "./Todo.js";

/**
 * ? Display welcome message to the user
 */
function welcome() {
  console.log(`
  ${chalk.bold.bgCyan.black("TODO APP")}
  I am a process on your computer.
  If you clicked ctrl+c, I will be ${chalk.bgRed.black("killed")}
  `);
}

/**
 * @purpose - Prompt the user with the options.
 * @returns User answer
 */
async function promptUserWithOptions() {
  const choices = [
    "Add Todo",
    "Remove Todo",
    "Toggle Todo",
    "Search for Todo",
    "Display all Todos",
    "Exit",
  ];
  const answer = await inquirer.prompt({
    name: "options",
    type: "list",
    message: "Choose action from the following:",
    choices,
  });
  return answer["options"];
}

/*
 ? Ask user for title and description
*/
const createNewTodo = async () => {
  const todoData = {};

  //? Read user inputs to get todo title and description
  let userInput = await inquirer.prompt({
    name: "title",
    type: "input",
    message: "Enter todo title:",
    default: "NO TITLE",
  });

  todoData.title = userInput["title"];

  userInput = await inquirer.prompt({
    name: "description",
    type: "input",
    message: "Enter todo description:",
    default: "NO DESCRIPTION",
  });

  todoData.description = userInput["description"];

  //* Create spinner
  await spin("Try to create a new Todo...");

  // Try to create a new Todo
  const { success, todoId } = Todo.createTodo(todoData);

  if (success) {
    console.log(
      chalk.green.bold(
        `Todo Created Successfully with Id ${chalk.cyan(todoId)}`
      )
    );
  } else {
    console.log(chalk.red.bold("Cannot create todos right now, come later."));
  }
};

/*
 ? Ask user to get todo id and try to remove it
 */
const removeTodo = async () => {
  //? Read user inputs to get todo id
  const todoId = await readTodoId();
  if (todoId < 0) {
    console.log(chalk.red("INVALID TODO ID"));
    return;
  }

  //* Create Spinner
  await spin("Try to remove Todo...");

  const success = await Todo.removeTodo(todoId);
  if (success) {
    console.log(
      chalk.green(`Todo with id ${chalk.cyan(todoId)} removed successfully.`)
    );
  } else {
    console.log(chalk.red(`Todo with id ${chalk.cyan(todoId)} Not Found.`));
  }
};

/*
 ? Toggle todo completed status  
 */
const toggleTodo = async () => {
  //? Read user inputs to get todo id
  const todoId = await readTodoId();
  if (todoId < 0) {
    console.log(chalk.red("INVALID TODO ID"));
    return;
  }

  //* Create Spinner
  await spin("Try to toggle Todo...");

  //* Try to toggle todo
  const success = Todo.toggle(todoId);
  if (success) {
    console.log(
      chalk.green(`Todo with id ${chalk.cyan(todoId)} toggled successfully.`)
    );
  } else {
    console.log(chalk.red(`Todo with id ${chalk.cyan(todoId)} Not Found.`));
  }
};

/*
 * Search for specified todo by id or keyword
 */
const searchForTodo = async () => {
  //? Ask user to search by id or keyword
  let userInput = await inquirer.prompt({
    name: "searchBy",
    type: "list",
    message: "Search By:",
    choices: ["Todo Id", "Keyword on title", "Completed Status"],
    default: "Todo Id",
  });

  //* Extract search method
  const searchMethod = userInput["searchBy"];

  switch (searchMethod) {
    case "Todo Id":
      await getTodoById();
      break;
    case "Keyword on title":
      await getTodoByKeyword();
      break;
    case "Completed Status":
      await getTodosByStatus();
      break;
  }
};

/*
 ? Get all todos and display them in nice format
 */
const displayTodos = async () => {
  //* Create spinner
  await spin("Loading todos...");

  //* Load todos
  const todos = Todo.getAllTodos();
  console.log(chalk.cyan.bold(`You have ${chalk.red(todos.length)} todos.`));

  //* Display todos in console
  todos.forEach((todo) => {
    //? Display the todo in nice format in console.
    displaySingleTodo(todo);
  });
};

//* UTILITY FUNCTIONS
/**
 * @purpose - Sleep for  a specified amount of time
 * @param {*} ms - The value to sleep in  milliseconds
 */
const sleep = (ms = 2000) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Create a new spinner for 2s
 * @param {String} message - Spinner message
 */
const spin = async (message = "Loading") => {
  const spinner = createSpinner(chalk.yellow(message)).start();
  await sleep();
  spinner.stop();
  spinner.clear();
};

/**
 *
 * @returns todoId if valid, -1 otherwise
 */
const readTodoId = async () => {
  //? Read user inputs to get todo id
  let userInput = await inquirer.prompt({
    name: "todoId",
    type: "number",
    message: "Enter todo id:",
  });

  const todoId = userInput["todoId"];

  return todoId ? todoId : -1;
};

/*
 * Try to read todo id from the user and display the todo if found
 */
const getTodoById = async () => {
  //? Read user inputs to get todo id
  const todoId = await readTodoId();
  if (todoId < 0) {
    return console.log(chalk.red("INVALID TODO ID"));
  }

  //* Create spinner
  await spin("Searching for the todo...");

  //? Try to get the todo
  const todo = Todo.searchForTodo(todoId);

  //? Check if the todo exits
  if (todo) {
    displaySingleTodo(todo);
  } else {
    console.log(chalk.red(`Todo with id ${chalk.cyan(todoId)} Not Found.`));
  }
};

/*
 ? Search for todo by keyword 
 */
const getTodoByKeyword = async () => {
  //? Read user inputs to get todo id
  let userInput = await inquirer.prompt({
    name: "todoKeyword",
    type: "input",
    message: "Enter keyword:",
  });

  const todoKeyword = userInput["todoKeyword"];

  //* Create spinner
  await spin("Searching for the todo...");

  //* Try to get the todo
  const todo = Todo.searchForTodo(todoKeyword);

  //? Check if the todo exits
  if (todo) {
    displaySingleTodo(todo);
  } else {
    console.log(chalk.red(`Keyword ${todoKeyword} not matched with any todo.`));
  }
};

const getTodosByStatus = async () => {
  //? Read user inputs to get todo id
  let userInput = await inquirer.prompt({
    name: "completedStatus",
    type: "list",
    message: "Choose from the following:",
    choices: ["Remaining Todos", "Completed Todos"],
  });

  const todoStatus = userInput["completedStatus"];

  switch (todoStatus) {
    case "Remaining Todos":
      //* Get all todos that is not completed yet
      const remTodos = Todo.getAllRemainingTodos();
      //* Create spinner
      await spin("Retrieving remaining Todos...");

      if (remTodos.length === 0) {
        return console.log(
          chalk.red.bold("You are great one, no todos left for you")
        );
      }

      remTodos.forEach((todo) => {
        displaySingleTodo(todo);
      });
      break;
    case "Completed Todos":
      //* Get all todos that is completed
      const comTodos = Todo.getAllCompletedTodos();
      //* Create spinner
      await spin("Retrieving completed Todos...");

      if (comTodos.length === 0) {
        return console.log(chalk.red.bold("You have no completed Todos."));
      }

      //* Loop todos and display them
      comTodos.forEach((todo) => {
        displaySingleTodo(todo);
      });
      break;
  }
};

/**
 * Display todo in console with nice format
 * @param {Object} todo
 */
const displaySingleTodo = (todo) => {
  console.log(`-----------${chalk.cyan(`TODO ID ${todo.id}`)}------------`);
  console.log(chalk.green("Title: ") + chalk.red(`${todo.title}`));
  console.log(chalk.green("Description: ") + chalk.red(`${todo.description}`));
  if (todo.completed) {
    console.log(chalk.yellow("Status: ") + chalk.green("Completed"));
  } else {
    console.log(chalk.yellow("Status: ") + chalk.red("Not completed"));
  }
};

//? Run the app
(async function runApp() {
  welcome();

  //? Load previous saved todos
  await Todo.loadTodosFromFile();

  let selectedOption = await promptUserWithOptions();
  do {
    switch (selectedOption) {
      case "Add Todo":
        //* Create new todo
        await createNewTodo();
        break;
      case "Remove Todo":
        //* Remove existing todo
        await removeTodo();
        break;
      case "Toggle Todo":
        //* Toggle todo status
        await toggleTodo();
        break;
      case "Search for Todo":
        //* Search for todo
        await searchForTodo();
        break;
      case "Display all Todos":
        //* Display todos
        await displayTodos();
        break;
      case "Exit":
        console.log(chalk.red.bold("Good Bye User.."));
        process.exit(0);
    }
    //* Get new input from the user
    selectedOption = await promptUserWithOptions();
  } while (selectedOption != "Exit");
  if (selectedOption == "Exit") console.log(chalk.red.bold("Good Bye User.."));
})();
