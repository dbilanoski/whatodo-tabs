/* 

Todo lists will handle todo list item creation

Todo tasks will handle todo task item creation

Storage will handle saveTo and getFrom LS

UI will hanlde render methods, clock and input configurations

-> Added theme change component to toggle between light and dark mode
-> Refractored code to write single data object to local storage
  * Object contains todo lists, user settings and UI parameters
  * Storage methods are no longer in need of parameters for chosing storage key, there is only one
  * Render methods and event listeners functions are updated to use new data object
  * Some methods were obsolete and are removed

--> Issue with memory build up resolved by removing setInterval()

*/

// UI Elements

const themeToggleButton = document.querySelector(".toggle-theme-button"),
  userName = document.querySelector(".user-name"),
  userThoughts = document.querySelector(".user-thoughts"),
  todoListInputForm = document.querySelector(".new-list-form"),
  todoListContainer = document.querySelector(".lists-container"),
  todoTasksSection = document.querySelector(".todo-tasks"),
  todoTaskInputForm = document.querySelector(".new-task-form"),
  todoTaskContainer = document.querySelector(".tasks-body"),
  todoListTitle = document.querySelector(".list-name"),
  todoTaskCounter = document.querySelector(".task-counter"),
  buttonClearCompleted = document.querySelector(".clear-completed-tasks"),
  buttonDeleteList = document.querySelector(".remove-list");

let clockDOM = document.querySelector(".clock"),
  dateDOM = document.querySelector(".date");

// Local storage keys
const LOCAL_STORAGE_DATA = "wahtodo.data";

const template = {
  todos: [],
  userName: "{ your name.. }",
  userThoughts: "Your thoughts..",
  uiParameters: {
    theme: "dark",
    activeListID: ""
  }
};

let storageObject =
  JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA)) || template;

/*[{name: "List 1", ID: 1, content: {name: "Todo 1", ID: 1, completed: false}}];*/

class TodoLists {
  constructor(name) {
    this.name = name;
    this.id = Date.now().toString();
    this.content = [];
  }
}

class TodoTasks {
  constructor(name) {
    this.name = name;
    this.id = Date.now().toString();
    this.complete = false;
  }
}

class Storage {
  static save() {
    if (localStorage.getItem(LOCAL_STORAGE_DATA)) {
      localStorage.removeItem(LOCAL_STORAGE_DATA);
    }
    localStorage.setItem(LOCAL_STORAGE_DATA, JSON.stringify(storageObject));
  }

  static getStorageData() {
    let storageData = JSON.parse(localStorage.getItem(LOCAL_STORAGE_DATA));
    return storageData;
  }
}

class UI {
  // Clear DOM elements
  clearElement(element) {
    if (element.typeOf === "object") {
      element.forEach(function(current) {
        while (current.firstElementChild) {
          current.firstElementChild.remove();
        }
      });
    } else {
      element.textContent = "";
    }
  }

  clearElements() {
    const textElements = document.querySelectorAll("[contentEditable='true']");
    textElements.forEach(function(current) {
      current.textContent = "";
    });

    const itemElements = document.querySelectorAll(
      ".lists-container, .tasks-body"
    );

    itemElements.forEach(function(current) {
      while (current.firstElementChild) {
        current.firstElementChild.remove();
      }
    });
  }

  // Clear Inputs
  clearInput(field) {
    field.value = "";
  }

  // Alert user
  alertUser(message, element, type = "info") {
    const inputField = element.querySelector("input");
    inputField.placeholder = message;

    if (type === "error") {
      inputField.classList.add("error");
    }

    let i = setTimeout(function() {
      inputField.placeholder = "";
    }, 5000);
  }

  // Theme toggle function
  themeToggle() {
    const theme = storageObject.uiParameters.theme;
    const root = document.documentElement;
    const themeTitle = document.querySelector(".toggle-theme-title");

    if (storageObject.uiParameters.theme === "dark") {
      root.style.setProperty("--dark", "#02111b");
      root.style.setProperty("--light", "#fcf7f8");
      themeTitle.innerText = "Too " + theme + "?";

      themeToggleButton.classList.remove("clicked");
    } else {
      root.style.setProperty("--dark", "#fcf7f8");
      root.style.setProperty("--light", "#02111b");
      themeTitle.innerText = "Too bright?";
      themeToggleButton.classList.add("clicked");
    }
  }

  // Render methods
  renderUserName() {
    let currentUserName = storageObject.userName;

    if (currentUserName == null || currentUserName == "") {
      userName.innerText = "{ your name.. }";
    } else {
      userName.textContent = currentUserName;
    }
  }

  renderUserThoughts() {
    let currentUserThoughts = storageObject.userThoughts;

    if (currentUserThoughts == null || currentUserThoughts == "") {
      userThoughts.innerText = "Your thoughts..";
    } else {
      userThoughts.textContent = currentUserThoughts;
    }
  }

  renderClockAndDate() {
    let now = new Date();
    let context = this;

    let hour = now.getHours() < 10 ? "0" + now.getHours() : now.getHours();
    let minutes =
      now.getMinutes() < 10 ? "0" + now.getMinutes() : now.getMinutes();

    let clock = hour + ":" + minutes;
    clockDOM.textContent = clock;

    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday"
    ];
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December"
    ];

    let weekDay = days[now.getDay()];
    let day = now.getDate();
    let month = months[now.getMonth()];
    let year = now.getFullYear();

    let date = `${weekDay}, ${day} ${month} ${year}`;
    dateDOM.textContent = date;

    //setInterval(this.renderClockAndDate, 1000);
    setTimeout(function() {
      context.renderClockAndDate();
    }, 1000);
  }

  renderLists() {
    this.clearElement(todoListContainer);

    storageObject.todos.forEach(function(current) {
      // create list item
      const li = document.createElement("li");
      li.classList.add("lists-item");

      if (current.id === storageObject.uiParameters.activeListID) {
        li.classList.add("active");
      } else {
        li.classList.remove("active");
      }

      li.dataset.id = current.id;
      li.textContent = current.name;
      todoListContainer.appendChild(li);
    });
  }

  renderTasks(list) {
    list.content.forEach(function(current) {
      /* <div class="task-item">
            <input type="checkbox" id="task1" class="task-checkbox"/>
            <label for="task1" class="task-label" id="task1"> <span class="custom-checkbox"></span>Task 1</label>
          </div> */

      const div = document.createElement("div");
      div.classList.add("task-item");

      const checked = current.complete ? "checked" : "";
      div.innerHTML = `
          <input type="checkbox" ${checked} id="${current.id}" class="task-checkbox"/>
          <label for="${current.id}" class="task-label" id="${current.id}"> <span class="custom-checkbox"></span>${current.name}</label>
          `;

      todoTaskContainer.appendChild(div);
    });
  }

  // Todolist render
  todosRender() {
    this.clearElement(todoListContainer);
    this.renderLists();

    const activeList = storageObject.todos.find(function(current) {
      return current.id === storageObject.uiParameters.activeListID;
    });

    if (
      storageObject.uiParameters.activeListID === null ||
      storageObject.uiParameters.activeListID === ""
    ) {
      todoTasksSection.style.display = "none";
    } else {
      todoTasksSection.style.display = "";
      todoListTitle.textContent = activeList.name;
      this.clearElement(todoTaskContainer);
      this.renderTasks(activeList);
      this.renderTaskCount(activeList);
    }
  }

  // Task Count render
  renderTaskCount(list) {
    const incompleteTasks = list.content.filter(function(current) {
      return current.complete === false;
    }).length;

    const grammar = incompleteTasks === 1 ? "task" : "tasks";
    todoTaskCounter.innerText = `${incompleteTasks} ${grammar} remaining.`;
  }

  // Main render
  appRender() {
    this.themeToggle();
    this.clearElements();
    this.renderUserName();
    this.renderUserThoughts();
    this.renderClockAndDate();
    this.todosRender();
  }
}

/* =========================
Event Listeners & Main logic 
============================ */

// Theme Changer
themeToggleButton.addEventListener("click", function() {
  storageObject.uiParameters.theme =
    storageObject.uiParameters.theme === "dark" ? "light" : "dark";

  Storage.save();
  ui.themeToggle();
});

// Instantiate needed objects
const ui = new UI();

// Name events
userName.addEventListener("keydown", function(e) {
  if (
    e.keyCode === 13 ||
    e.key === "Enter" ||
    e.keyCode === 27 ||
    e.key === "Escape"
  ) {
    userName.blur();
  }
});

userName.addEventListener("blur", function() {
  storageObject.userName = userName.textContent;

  Storage.save();
  ui.renderUserName();
});

// Thoughts events
userThoughts.addEventListener("keyup", function(e) {
  if (e.keyCode === 27 || e.key === "Escape") {
    userThoughts.blur();
  }
});

userThoughts.addEventListener("blur", function() {
  storageObject.userThoughts = userThoughts.textContent;

  Storage.save();
  ui.renderUserThoughts();
});

// Tasklist events
todoListInputForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const newListInput = document.querySelector(".new-list");
  if (newListInput.value === "") {
    ui.alertUser("Enter list name.", e.target, "error");
  } else {
    const listItem = new TodoLists(newListInput.value);
    storageObject.todos.push(listItem);
    storageObject.uiParameters.activeListID = listItem.id;

    Storage.save();

    ui.clearInput(newListInput);
    newListInput.placeholder = "";

    ui.todosRender();
  }
});

// List item click event
todoListContainer.addEventListener("click", function(e) {
  if (e.target.tagName === "LI") {
    storageObject.uiParameters.activeListID = e.target.dataset.id;

    Storage.save();
    ui.todosRender();
  }
});

// Delete list click event
buttonDeleteList.addEventListener("click", function() {
  storageObject.todos = storageObject.todos.filter(function(current) {
    return current.id != storageObject.uiParameters.activeListID;
  });

  storageObject.uiParameters.activeListID = null;

  Storage.save();
  ui.todosRender();
});

// Todo list events
todoTaskInputForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const input = document.querySelector(".new-task");

  if (input.value === "") {
    ui.alertUser("Write your task here.", e.target, "error");
  } else {
    const taskItem = new TodoTasks(input.value);
    const activeList = storageObject.todos.find(function(current) {
      return current.id === storageObject.uiParameters.activeListID;
    });
    activeList.content.push(taskItem);

    Storage.save();

    ui.clearInput(input);
    input.placeholder = "";

    ui.todosRender(activeList);
  }
});

// Todo item click
todoTaskContainer.addEventListener("change", function(e) {
  if ((e.target.tagName = "INPUT")) {
    const activeList = storageObject.todos.find(function(current) {
      return current.id === storageObject.uiParameters.activeListID;
    });
    const selectedTask = activeList.content.find(function(current) {
      return current.id === e.target.id;
    });

    selectedTask.complete = e.target.checked;

    Storage.save();
    ui.renderTaskCount(activeList);
  }
});

// Clear completed tasks button
buttonClearCompleted.addEventListener("click", function() {
  let activeList = storageObject.todos.find(function(current) {
    return current.id === storageObject.uiParameters.activeListID;
  });

  activeList.content = activeList.content.filter(function(current) {
    return !current.complete;
  });

  Storage.save();
  ui.todosRender();
});

// Main DOM render
ui.appRender();
