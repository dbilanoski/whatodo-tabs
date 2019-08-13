/* 

Todo lists will handle todo list item creation

Todo tasks will handle todo task item creation

Storage will handle saveTo and getFrom LS

UI will hanlde render methods, clock and input configurations

*/

// UI Elements

const userName = document.querySelector(".user-name"),
  userThoughts = document.querySelector(".user-thoughts"),
  todoListInputForm = document.querySelector(".new-list-form"),
  todoListContainer = document.querySelector(".lists-container"),
  todoTasksSection = document.querySelector(".todo-tasks");
(todoTaskInputForm = document.querySelector(".new-task-form")),
  (todoTaskContainer = document.querySelector(".tasks-body")),
  (todoListTitle = document.querySelector(".list-name")),
  (todoTaskCounter = document.querySelector(".task-counter")),
  (buttonClearCompleted = document.querySelector(".clear-completed-tasks")),
  (buttonDeleteList = document.querySelector(".remove-list"));

let clockDOM = document.querySelector(".clock"),
  dateDOM = document.querySelector(".date");

// Local storage keys
const LOCAL_STORAGE_USER_NAME = "user.name",
  LOCAL_STORAGE_USER_THOUGHTS = "user.thoughts",
  LOCAL_STORAGE_TODO_LIST = "todo.lists",
  LOCAL_STORAGE_ACTIVE_LIST_ID = "todo.activeList";

let todos = JSON.parse(localStorage.getItem(LOCAL_STORAGE_TODO_LIST)) || [];
let activeListID = JSON.parse(
  localStorage.getItem(LOCAL_STORAGE_ACTIVE_LIST_ID)
);

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
  static save(name, key) {
    localStorage.setItem(key, JSON.stringify(name));
  }

  static getStorageData(key) {
    let storageData = JSON.parse(localStorage.getItem(key));
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
  alertUser(message, element) {
    const inputField = element.querySelector("input");
    inputField.placeholder = message;

    let i = setInterval(function() {
      inputField.placeholder = "";
    }, 5000);
  }

  // Render methods
  renderUserName() {
    let currentUserName = Storage.getStorageData(LOCAL_STORAGE_USER_NAME);

    if (currentUserName != null) {
      userName.textContent = currentUserName;
    } else {
      userName.innerText = "{your name}";
    }
  }

  renderUserThoughts() {
    let currentUserThoughts = Storage.getStorageData(
      LOCAL_STORAGE_USER_THOUGHTS
    );

    if (currentUserThoughts != null) {
      userThoughts.textContent = currentUserThoughts;
    } else {
      userThoughts.textContent = "Your thoughts..";
    }
  }

  renderClockAndDate() {
    let now = new Date();

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

    setInterval(this.renderClockAndDate, 1000);
  }

  renderLists() {
    this.clearElement(todoListContainer);

    todos.forEach(function(current) {
      // create list item
      const li = document.createElement("li");
      li.classList.add("lists-item");

      if (current.id === activeListID) {
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
          <input type="checkbox" ${checked} id="${
        current.id
      }" class="task-checkbox"/>
          <label for="${current.id}" class="task-label" id="${
        current.id
      }"> <span class="custom-checkbox"></span>${current.name}</label>
          `;

      todoTaskContainer.appendChild(div);
    });
  }

  // Todolist render
  todosRender() {
    this.clearElement(todoListContainer);
    this.renderLists();

    const activeList = todos.find(function(current) {
      return current.id === activeListID;
    });

    if (activeListID === null) {
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

// Instantiate needed objects
const ui = new UI();

// Name events
userName.addEventListener("keyup", function(e) {
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
  let name = userName.textContent;

  Storage.save(name, LOCAL_STORAGE_USER_NAME);
  ui.renderUserName();
});

// Thoughts events
userThoughts.addEventListener("keyup", function(e) {
  if (e.keyCode === 27 || e.key === "Escape") {
    userThoughts.blur();
  }
});

userThoughts.addEventListener("blur", function() {
  let thoughts = userThoughts.textContent;

  Storage.save(thoughts, LOCAL_STORAGE_USER_THOUGHTS);
  ui.renderUserThoughts();
});

// Tasklist events
todoListInputForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const newListInput = document.querySelector(".new-list");
  if (newListInput.value === "") {
    ui.alertUser("Enter list name.", e.target);
  } else {
    const listItem = new TodoLists(newListInput.value);
    todos.push(listItem);
    activeListID = listItem.id;

    Storage.save(todos, LOCAL_STORAGE_TODO_LIST);
    Storage.save(listItem.id, LOCAL_STORAGE_ACTIVE_LIST_ID);

    ui.clearInput(newListInput);
    newListInput.placeholder = "";
    ui.todosRender();
  }
});

// List item click event
todoListContainer.addEventListener("click", function(e) {
  if (e.target.tagName === "LI") {
    activeListID = e.target.dataset.id;
    Storage.save(activeListID, LOCAL_STORAGE_ACTIVE_LIST_ID);

    ui.todosRender();
  }
});

// Delete list click event
buttonDeleteList.addEventListener("click", function() {
  todos = todos.filter(function(current) {
    return current.id != activeListID;
  });

  activeListID = null;

  Storage.save(todos, LOCAL_STORAGE_TODO_LIST);
  Storage.save(activeListID, LOCAL_STORAGE_ACTIVE_LIST_ID);

  ui.todosRender();
});

// Todo list events
todoTaskInputForm.addEventListener("submit", function(e) {
  e.preventDefault();
  const input = document.querySelector(".new-task");

  if (input.value === "") {
    ui.alertUser("Write your task here.", e.target);
  } else {
    const taskItem = new TodoTasks(input.value);
    const activeList = todos.find(function(current) {
      return current.id === activeListID;
    });
    activeList.content.push(taskItem);
    Storage.save(todos, LOCAL_STORAGE_TODO_LIST);

    ui.clearInput(input);
    input.placeholder = "";
    ui.todosRender(activeList);
  }
});

// Todo item click
todoTaskContainer.addEventListener("change", function(e) {
  if ((e.target.tagName = "INPUT")) {
    const activeList = todos.find(function(current) {
      return current.id === activeListID;
    });
    const selectedTask = activeList.content.find(function(current) {
      return current.id === e.target.id;
    });

    selectedTask.complete = e.target.checked;

    Storage.save(todos, LOCAL_STORAGE_TODO_LIST);
    ui.renderTaskCount(activeList);
  }
});

// Clear completed tasks button
buttonClearCompleted.addEventListener("click", function() {
  let activeList = todos.find(function(current) {
    return current.id === activeListID;
  });

  activeList.content = activeList.content.filter(function(current) {
    return !current.complete;
  });

  Storage.save(todos, LOCAL_STORAGE_TODO_LIST);
  ui.todosRender();
});

// Main DOM render
ui.appRender();
