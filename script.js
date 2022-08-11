"use strict";

// to-do
//      types of tasks (home, work, sport, ...)
//      remove all finished-tasks button

const form = document.getElementById("form");
const formInputText = document.getElementById("todo-input");
const list = document.getElementById("todo-list");
const finishedList = document.getElementById("done-list");
const errorField = document.querySelector(".error-message");

class App {
    #tasks = [];
    #finishedTasks = [];

    constructor() {
        this._loadTasks();
        form.addEventListener("submit", this._addTask.bind(this));
        document.addEventListener("click", this._handleButtonClick.bind(this));
    }

    _loadTasks() {
        // from parsed JSON objects create instance of Task, save it to array & display it

        let tasksStorage = JSON.parse(localStorage.getItem("todo-tasks"));
        let finishedTasksStorage = JSON.parse(
            localStorage.getItem("finished-tasks")
        );

        if (tasksStorage) {
            tasksStorage.forEach(task => {
                let t = Object.assign(new Task(), task);
                this.#tasks.push(t);
                this._displayTask(t);
            });
        }

        if (finishedTasksStorage) {
            finishedTasksStorage.forEach(fTask => {
                let fT = Object.assign(new Task(), fTask);
                this.#finishedTasks.push(fT);
                this._displayTask(fT);
            });
        }
    }

    _displayTask(task, animation = "") {
        // take Task as argument & insert it into HTML

        let html = `<div class="todo-task ${animation}">`;

        let htmlEnd = `<button class="task-button delete-task">❌</button>
            </div>`;

        if (task.finishedDate) {
            html += `<p class="todo-text"><strike>${task.text}</strike></p>
                <button class="task-button repeat-task">🔁</button>`;
            finishedList.insertAdjacentHTML("afterbegin", html + htmlEnd);
        } else {
            html += `<p class="todo-text">${task.text}</p>
                <button class="task-button finish-task">✅</button>`;
            list.insertAdjacentHTML("afterbegin", html + htmlEnd);
        }
    }

    _addTask(e) {
        // create new Task from <form> (+ save & display)

        // prevent page from reloading
        e.preventDefault();

        // create instance of Item or show error message
        if (formInputText.value.length === 0) {
            this._showErrorMessage("Enter text");
            return;
        }

        if (this._isDuplicate()) {
            this._showErrorMessage("Task already exists");
            return;
        }

        const task = new Task(formInputText.value);

        // save item to local storage
        this.#tasks.push(task);
        this._updateStorage();

        // display new item
        this._displayTask(task, "fadeInLeft");

        // clear input field
        formInputText.value = "";
        formInputText.focus();
    }

    _finishTask(task) {
        // hide Task, move it to #finishedTasks and display accordingly

        this._hideTask(task);
        this._removeTaskFromArray(task);

        task = task.finishTask(); // sets task.finishedDate

        this.#finishedTasks.push(task);
        this._updateStorage();

        this._displayTask(task, "fadeInLeft");
    }

    _deleteTask(task) {
        // hide & delete

        this._hideTask(task);
        this._removeTaskFromArray(task);
        this._updateStorage();
    }

    _repeatTask(task) {
        // move task back from finishedTasks to tasks & display accordingly

        this._hideTask(task);
        this._removeTaskFromArray(task);

        task = task.repeatTask(); //unsets task.finishedDate
        this.#tasks.push(task);

        this._updateStorage();
        this._displayTask(task, "fadeInLeft");
    }

    _hideTask(task) {
        // find parent element (<div class="todo-task">) of the Task by its text (text is unique) & remove <div> from html

        let searchIn = list; // all divs are childElements of list or finishedList

        if (task.finishedDate) {
            searchIn = finishedList; // if task has been finished, search in this node
        }

        const taskElements = searchIn.querySelectorAll(".todo-task");
        // ?-> cannot use: .find(el => el.querySelector(".todo-text").textContent === task.text);

        let nodeToRemove;

        taskElements.forEach(el => {
            if (el.querySelector(".todo-text").textContent === task.text) {
                nodeToRemove = el;
            }
        });

        nodeToRemove.classList.add("fadeOutRight"); // animate
        setTimeout(function () {
            nodeToRemove.remove(); // after animation (300ms)
        }, 300);
    }

    _removeTaskFromArray(task) {
        // remove task from its current array

        if (task.finishedDate) {
            this.#finishedTasks.splice(this.#finishedTasks.indexOf(task), 1);

            return;
        }

        this.#tasks.splice(this.#tasks.indexOf(task), 1);
    }

    _handleButtonClick(e) {
        // handle task-button click (finish, delete, repeat)

        const clicked = e.target; // what has been clicked

        if (clicked.classList.contains("task-button")) {
            // get .todo-text (sibling element of button)
            //      1. choose parent element
            //      2. get child by class (.todo-text)
            const taskText =
                clicked.parentElement.querySelector(".todo-text").textContent;

            // get instance of Task - search by text (text is unique)
            let tsk = this.#tasks.find(tsk => tsk.text === taskText);

            if (!tsk) {
                // if task wasn't found among #tasks, it's in #finishedTasks
                tsk = this.#finishedTasks.find(tsk => tsk.text === taskText);
            }

            if (clicked.classList.contains("finish-task")) {
                this._finishTask(tsk);
            }

            if (clicked.classList.contains("delete-task")) {
                this._deleteTask(tsk);
            }

            if (clicked.classList.contains("repeat-task")) {
                this._repeatTask(tsk);
            }
        }
    }

    _isDuplicate() {
        // check if task already exists

        let isDup = false;
        const texts = document.querySelectorAll(".todo-text");

        texts.forEach(txt => {
            if (txt.textContent === formInputText.value) {
                isDup = true;
            }
        });

        return isDup;
    }

    _updateStorage() {
        // update local storage

        localStorage.setItem("todo-tasks", JSON.stringify(this.#tasks));
        localStorage.setItem(
            "finished-tasks",
            JSON.stringify(this.#finishedTasks)
        );
    }

    _showErrorMessage(msg) {
        // if error message already exists -> remove it and show new error

        const oldError = document.getElementById("err-msg");
        if (oldError) {
            oldError.remove();
        }

        errorField.insertAdjacentHTML(
            "afterbegin",
            `<p id="err-msg">${msg}</p>`
        );
        errorField.classList.toggle("fade");

        setTimeout(() => {
            errorField.classList.toggle("fade");
        }, 1500);
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

        return this;
    }

    repeatTask() {
        this.finishedDate = undefined;

        return this;
    }
}

const app = new App();
