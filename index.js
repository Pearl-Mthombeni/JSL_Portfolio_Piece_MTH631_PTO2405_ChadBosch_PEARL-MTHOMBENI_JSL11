import { initialData } from "./initialData.js";
import {
  getTasks,
  createNewTask,
  patchTask,
  putTask,
  deleteTask,
} from "./utils/taskFunctions.js";

// Function checks if local storage already has data, if not it loads initialData to localStorage
function initializeData() {
  if (!localStorage.getItem("tasks")) {
    localStorage.setItem("tasks", JSON.stringify(initialData));
    localStorage.setItem("showSideBar", "true");
  } else {
    console.log("Data already exists in localStorage");
  }
}

// TASK: Get elements from the DOM
const elements = {
  headerBoardName: document.getElementById("header-board-name"),
  filterDiv: document.getElementById("filterDiv"),
  columnDivs: document.querySelectorAll(".column-div"),
  hideSideBarBtn: document.getElementById("hide-side-bar-btn"),
  showSideBarBtn: document.getElementById("show-side-bar-btn"),
  themeSwitch: document.getElementById("switch"),
  editTaskModal: document.getElementById("edit-btn"),
  createNewTaskBtn: document.getElementById("add-new-task-btn"),
  modalWindow: document.querySelector(".modal-window"),
  editTaskModal: document.querySelector(".edit-task-modal-window"),
  createNewBoardModal: document.getElementById("new-board-modal-window"),
  createNewBoardBtn: document.getElementById("create-board-btn"),
  saveNewBoardBtn: document.getElementById("save-board-btn"),
  cancelAddTaskBtn: document.getElementById("cancel-add-task-btn"),
  cancelNewBoard: document.getElementById("cancel-add-board-btn"),
  dropDownBtn: document.getElementById("dropdownBtn"),
};

let activeBoard = "";

// Extracts unique board names from tasks
function fetchAndDisplayBoardsAndTasks() {
  const tasks = getTasks();
  const boards = [...new Set(tasks.map((task) => task.board).filter(Boolean))];
  displayBoards(boards);
  if (boards.length > 0) {
    const localStorageBoard = JSON.parse(localStorage.getItem("activeBoard"));
    activeBoard = localStorageBoard ? localStorageBoard : boards[0];
    elements.headerBoardName.textContent = activeBoard;
    styleActiveBoard(activeBoard);
    refreshTasksUI();
  }
}

// Creates different boards in the DOM
function displayBoards(boards) {
  const boardsContainer = document.getElementById("boards-nav-links-div");
  boardsContainer.innerHTML = ""; // Clears the container
  boards.forEach((board) => {
    const boardElement = document.createElement("button");
    boardElement.textContent = board;
    boardElement.classList.add("board-btn");
    boardElement.addEventListener("click", () => {
      elements.headerBoardName.textContent = board;
      filterAndDisplayTasksByBoard(board);
      activeBoard = board; //assigns active board
      localStorage.setItem("activeBoard", JSON.stringify(activeBoard));
      styleActiveBoard(activeBoard);
    });
    boardsContainer.appendChild(boardElement);
  });
}

// Filters tasks corresponding to the board name and displays them on the DOM.
function filterAndDisplayTasksByBoard(boardName) {
  const tasks = getTasks(); // Fetch tasks from a simulated local storage function
  const filteredTasks = tasks.filter((task) => task.board === boardName);

  // Ensure the column titles are set outside of this function or correctly initialized before this function runs

  elements.columnDivs.forEach((column) => {
    const status = column.getAttribute("data-status");
    // Reset column content while preserving the column title
    column.innerHTML = `<div class="column-head-div">
                          <span class="dot" id="${status}-dot"></span>
                          <h4 class="columnHeader">${status.toUpperCase()}</h4>
                        </div>`;

    const tasksContainer = document.createElement("div");
    tasksContainer.classList.add("tasks-container");
    column.appendChild(tasksContainer);

    filteredTasks
      .filter((task) => task.status === status)
      .forEach((task) => {
        const taskElement = document.createElement("div");
        taskElement.classList.add("task-div");
        taskElement.textContent = task.title;
        taskElement.setAttribute("data-task-id", task.id);

        // Listen for a click event on each task and open a modal
        taskElement.addEventListener("click", () => {
          openEditTaskModal(task);
        });

        tasksContainer.appendChild(taskElement);
      });
  });
}

function refreshTasksUI() {
  filterAndDisplayTasksByBoard(activeBoard);
}

// Styles the active board by adding an active class

function styleActiveBoard(boardName) {
  document.querySelectorAll(".board-btn").forEach((btn) => {
    if (btn.textContent === boardName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });
}

function addTaskToUI(task) {
  const column = document.querySelector(
    `.column-div[data-status="${task.status}"]`
  );
  if (!column) {
    console.error(`Column not found for status: ${task.status}`);
    return;
  }

  let tasksContainer = column.querySelector(".tasks-container");
  if (!tasksContainer) {
    console.warn(
      `Tasks container not found for status: ${task.status}, creating one.`
    );
    tasksContainer = document.createElement("div");
    tasksContainer.className = "tasks-container";
    column.appendChild(tasksContainer);
  }

  const taskElement = document.createElement("div");
  taskElement.className = "task-div";
  taskElement.textContent = task.title; // Modify as needed
  taskElement.setAttribute("data-task-id", task.id);

  tasksContainer.appendChild(taskElement);
}

function setupEventListeners() {
  // Cancel editing task event listener
  const cancelEditBtn = document.getElementById("cancel-edit-btn");
  cancelEditBtn.addEventListener("click", () =>
    toggleModal(false, elements.editTaskModal)
  );

  // Cancel adding new task event listener
  const cancelAddTaskBtn = document.getElementById("cancel-add-task-btn");
  cancelAddTaskBtn.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Clicking outside the modal to close it
  elements.filterDiv.addEventListener("click", () => {
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
  });

  // Show sidebar event listener
  elements.hideSideBarBtn.addEventListener("click", () => toggleSidebar(false));
  elements.showSideBarBtn.addEventListener("click", () => toggleSidebar(true));

  // mobile sidebar
  elements.dropDownBtn.addEventListener("click", () => {
    if (localStorage.getItem("showSideBar") === "true") {
      toggleSidebar(false);
      document.getElementById("dropDownIcon").src =
        "./assets/icon-chevron-down.svg";
    } else {
      toggleSidebar(true);
      document.getElementById("dropDownIcon").src =
        "./assets/icon-chevron-up.svg";
    }
  });

  // Theme switch event listener
  elements.themeSwitch.addEventListener("change", toggleTheme);

  // Show Add New Task Modal event listener
  elements.createNewTaskBtn.addEventListener("click", () => {
    toggleModal(true);
    elements.filterDiv.style.display = "block"; // Also show the filter overlay
  });

  // Add new task form submission event listener
  elements.modalWindow.addEventListener("submit", (event) => {
    addTask(event);
  });
}
// Add new board form submission event listener
elements.createNewBoardModal.addEventListener("submit", (event) => {
  addBoard(event);
});

// Add new board form submission event listener

elements.createNewBoardBtn.addEventListener("click", () => {
  toggleModal(true, elements.createNewBoardModal);
  toggleSidebar(false);
  document.getElementById("dropDownIcon").src =
    "./assets/icon-chevron-down.svg";
});

// Cancel "Add New Board"
elements.cancelNewBoard.addEventListener("click", () => {
  toggleModal(false, elements.createNewBoardModal);
});

// Toggles tasks modal
function toggleModal(show, modal = elements.modalWindow) {
  modal.style.display = show ? "block" : "none";
}

/*************************************************************************************************************************************************
 * COMPLETE FUNCTION CODE
 * **********************************************************************************************************************************************/

function addTask(event) {
  event.preventDefault();
  //Assign user input to the task object
  const task = {
    title: document.getElementById("title-input").value,
    description: document.getElementById("desc-input").value,
    status: document.getElementById("select-status").value,
    board: activeBoard,
  };

  //Add task event //
  const newTask = createNewTask(task);
  if (newTask) {
    addTaskToUI(newTask);
    toggleModal(false);
    elements.filterDiv.style.display = "none"; // Also hide the filter overlay
    event.target.reset();
    refreshTasksUI();
  }
}
// Add board event //

function addBoard(event) {
  event.preventDefault();
  const idDate = new Date();
  const newBoard = document.getElementById("board-title-input").value;
  const defaultTask = {
    title: `Set up your first task for ${newBoard}`,
    decription: "",
    status: "todo",
    id: idDate,
    board: newBoard,
  };
  createNewTask(defaultTask);
  refreshTasksUI();
  event.target.reset();
  toggleModal(false, elements.createNewBoardModal);
  fetchAndDisplayBoardsAndTasks();
}

// toggleSidebar(show)

function toggleSidebar(show) {
  const sideBar = document.getElementById("side-bar-div");

  if (sideBar && elements.showSideBarBtn) {
    sideBar.style.display = show ? "flex" : "none";
    elements.showSideBarBtn.style.display = show ? "none" : "flex";
  }

  localStorage.setItem("showSideBar", show.toString());
}

// Toggle Theme // 
function toggleTheme() {
  const isLightTheme = document.body.classList.toggle("light-theme");
  const logo = document.getElementById("logo");

  if (isLightTheme) {
    localStorage.setItem("light-theme", "enabled");
    logo.src = "./assets/logo-light.svg";
    logo.alt = "logo-dark";
  } else {
    localStorage.setItem("light-theme", "disabled");
    logo.src = "./assets/logo-dark.svg";
    logo.alt = "logo-dark";
  }
}

let saveChangesListener = null;
let deleteTaskListner = null;

function openEditTaskModal(task) {
  // Set task details in modal inputs
  document.getElementById("edit-task-title-input").value = task.title;
  document.getElementById("edit-task-desc-input").value = task.description;
  document.getElementById("edit-select-status").value = task.status;
  const taskId = task.id;
  // Get button elements from the task modal
  const btnModalElements = {
    saveTask: document.getElementById("save-task-changes-btn"),
    deleteTask: document.getElementById("delete-task-btn"),
  };

  // removes event listners if there are pre existing

  if (saveChangesListener) {
    btnModalElements.saveTask.removeEventListener("click", saveChangesListener);
  }

  if (deleteTaskListner) {
    btnModalElements.deleteTask.removeEventListener("click", deleteTaskListner);
  }
  // Call saveTaskChanges upon click of Save Changes button

  saveChangesListener = () => saveTaskChanges(taskId);
  // Delete task using a helper function and close the task modal

  deleteTaskListner = () => {
    deleteTask(taskId);
    refreshTasksUI();
    fetchAndDisplayBoardsAndTasks();
    toggleModal(false, elements.editTaskModal);
  };
  // Calls the saveChanges listner function on click
  btnModalElements.saveTask.addEventListener("click", saveChangesListener);

  // Calls delete task listner function on click
  btnModalElements.deleteTask.addEventListener("click", deleteTaskListner);
  toggleModal(true, elements.editTaskModal); // Show the edit task modal
}

function saveTaskChanges(taskId) {
  // Get new user inputs
  const title = document.getElementById("edit-task-title-input").value;
  const description = document.getElementById("edit-task-desc-input").value;
  const status = document.getElementById("edit-select-status").value;
  // Create an object with the updated task details
  const updates = {
    title,
    description,
    status,
  };

  // Update task using a hlper functoin
  patchTask(taskId, updates);
  // Close the modal and refresh the UI to reflect the changes
  toggleModal(false, elements.editTaskModal);
  refreshTasksUI();
}

/*************************************************************************************************************************************************/

document.addEventListener("DOMContentLoaded", function () {
  init(); // init is called after the DOM is fully loaded
});

function init() {
  initializeData();
  setupEventListeners();
  const showSidebar = localStorage.getItem("showSideBar") === "true";
  toggleSidebar(showSidebar);
  if (showSidebar === true) {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-up.svg";
  } else {
    document.getElementById("dropDownIcon").src =
      "./assets/icon-chevron-down.svg";
  }
  const isLightTheme = localStorage.getItem("light-theme") === "enabled";
  document.body.classList.toggle("light-theme", isLightTheme);
  const logo = document.getElementById("logo");
  if (logo) {
    logo.src = isLightTheme
      ? "./assets/logo-light.svg"
      : "./assets/logo-dark.svg";
  }

  fetchAndDisplayBoardsAndTasks(); // Initial display of boards and tasks
}