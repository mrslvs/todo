"use strict";

// to-do
//      types of tasks (home, work, sport, ...)
//      do not add duplicates
//      merge _displayTasks() to one
//      localStorage to instance of class

const form = document.getElementById("form");
const formInputText = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const finishedList = document.getElementById("done-list");

class App {
    #tasks = [];
    #finishedTasks = [];

    constructor() {
        // load Tasks from localStorage (+display them)
        this._loadTasks();

        // handle submitting new task
        form.addEventListener("submit", this._addTask.bind(this));

        // handle button click (finish/delete task)
        document.addEventListener("click", this._handleButtonClick.bind(this));
    }

    _loadTasks() {
        console.log("_loadTasks()");
        let tasksStorage = JSON.parse(localStorage.getItem("todo-tasks"));
        let finishedTasksStorage = JSON.parse(
            localStorage.getItem("finished-tasks")
        );

        console.log(finishedTasksStorage);

        if (tasksStorage) {
            tasksStorage.forEach(task => {
                // from parsed objects create instances of Task
                let t = Object.assign(new Task(), task);
                this.#tasks.push(t);
            });

            this.#tasks.forEach(task => {
                this._displayTask(task);
            });
        }

        if (finishedTasksStorage) {
            finishedTasksStorage.forEach(fTask => {
                let fT = Object.assign(new Task(), fTask);
                this.#finishedTasks.push(fT);
            });

            this.#finishedTasks.forEach(fTask => {
                this._displayTask(fTask);
            });
        }
    }

    _displayTask(task) {
        let html = `
            <div class="todo-task">
                <p class="todo-text">${task.text}</p>
        `;

        if (task.finishedDate) {
            html += `
            </div>
            `;
            finishedList.insertAdjacentHTML("afterbegin", html);
        } else {
            html += `
                <button class="task-button finish-task">✅</button>
                <button class="task-button delete-task">❌</button>
            </div>
            `;
            list.insertAdjacentHTML("afterbegin", html);
        }
    }

    _addTask(e) {
        // prevent page from reloading
        e.preventDefault();

        // create instance of Item if text is entered
        if (formInputText.value.length === 0) return;
        const task = new Task(formInputText.value);

        // save item to local storage
        this.#tasks.push(task);
        localStorage.setItem("todo-tasks", JSON.stringify(this.#tasks));

        // display item
        this._displayTask(task);

        // clear input field
        formInputText.value = "";
        formInputText.focus();
    }

    _handleButtonClick(e) {
        const clicked = e.target;

        if (clicked.classList.contains("task-button")) {
            // get .todo-text (sibling element)
            //      1. choose parent element
            //      2. search for the child by class (.todo-text)
            const taskText =
                clicked.parentElement.querySelector(".todo-text").textContent;

            // get instance by searching for text (assuming no duplicate tasks are present)
            const tsk = this.#tasks.find(tsk => tsk.text === taskText);

            // finishing or deleting? :
            if (clicked.classList.contains("finish-task")) {
                this._finishTask(tsk);
            }

            if (clicked.classList.contains("delete-task")) {
                console.log("you wish to delete task:");
                console.log(tsk);
            }
        }
    }

    _finishTask(task) {
        task = task.finishTask();

        // from array remove passed task
        this.#tasks.splice(this.#tasks.indexOf(task), 1);

        // add this task to finished tasks
        this.#finishedTasks.push(task);

        console.log(this.#tasks);
        console.log(this.#finishedTasks);

        // update local storage
        localStorage.setItem("todo-tasks", JSON.stringify(this.#tasks));
        localStorage.setItem(
            "finished-tasks",
            JSON.stringify(this.#finishedTasks)
        );
    }
}

class Task {
    id;
    text;
    createdDate;
    finishedDate;

    constructor(text) {
        this.id = (Date.now() + "").slice(-10); // last 10 digits
        this.createdDate = Date.now();
        this.text = text + "";
    }

    finishTask() {
        this.finishedDate = Date.now();
        this.text = this.text.strike();

        return this;
    }
}

const app = new App();
