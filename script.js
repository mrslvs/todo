"use strict";

// to-do
//      types of tasks (home, work, sport, ...)
//      remove all finished-tasks button
//      isDuplicate or 0 chars eneter? => show warning (html+css)

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
        // load data from localStorage and display it

        let tasksStorage = JSON.parse(localStorage.getItem("todo-tasks"));
        let finishedTasksStorage = JSON.parse(
            localStorage.getItem("finished-tasks")
        );

        if (tasksStorage) {
            // from parsed JSON objects create instances of Task & save to array
            tasksStorage.forEach(task => {
                let t = Object.assign(new Task(), task);
                this.#tasks.push(t);
            });

            this._displayTasks(this.#tasks);
        }

        if (finishedTasksStorage) {
            finishedTasksStorage.forEach(fTask => {
                let fT = Object.assign(new Task(), fTask);
                this.#finishedTasks.push(fT);
            });

            this._displayTasks(this.#finishedTasks);
        }
    }

    _displayTasks(taskArray) {
        // take array of tasks and display each one

        taskArray.forEach(task => {
            this._displayTask(task);
        });
    }

    _displayTask(task) {
        // take Task as argument & insert it into HTML

        let html = `<div class="todo-task">`;
        let htmlEnd = `
                <button class="task-button delete-task">❌</button>
            </div>
        `;

        if (task.finishedDate) {
            html += `            
                <p class="todo-text"><strike>${task.text}</strike></p>
                <button class="task-button repeat-task">🔁</button>
            `;
            finishedList.insertAdjacentHTML("afterbegin", html + htmlEnd);
        } else {
            html += `
                <p class="todo-text">${task.text}</p>
                <button class="task-button finish-task">✅</button>
            `;
            list.insertAdjacentHTML("afterbegin", html + htmlEnd);
        }
    }

    _addTask(e) {
        // create new task from FORM, save it into local storage and display it

        // prevent page from reloading
        e.preventDefault();

        // this._isDuplicate();

        // create instance of Item if text is entered and is not duplicate
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
        this._displayTask(task);

        // clear input field
        formInputText.value = "";
        formInputText.focus();
    }

    _finishTask(task) {
        // take task, hide it, finish it (move it ot #finishedTasks) and display accordingly

        this._hideTask(task);
        this._removeTaskFromArray(task);
        task = task.finishTask();

        console.log(task);
        this.#finishedTasks.push(task);

        this._updateStorage();

        this._displayTask(task);
    }

    _deleteTask(task) {
        this._hideTask(task);

        if (task.finishedDate) {
            this._removeTaskFromArray(task);
            this._updateStorage();

            return;
        }

        this._removeTaskFromArray(task);
        this._updateStorage();
    }

    _repeatTask(task) {
        this._hideTask(task);
        this._removeTaskFromArray(task);

        task = task.repeatTask();
        this.#tasks.push(task);

        this._updateStorage();
        this._displayTask(task);
    }

    _hideTask(task) {
        // take task, find its parent element <div class="todo-task"> (find by task.text) and remove it from html

        // all divs are childElements of list or finishedList
        let searchIn = list;

        if (task.finishedDate) {
            // if task has been finished, search in this node
            searchIn = finishedList;
        }

        const taskElements = searchIn.querySelectorAll(".todo-task"); // all <div class="todo-task">
        // ? cannot use: .find(el => el.querySelector(".todo-text").textContent === task.text);

        let nodeToRemove;

        taskElements.forEach(el => {
            if (el.querySelector(".todo-text").textContent === task.text) {
                nodeToRemove = el;
            }
        });

        nodeToRemove.remove();
    }

    _removeTaskFromArray(task) {
        if (task.finishedDate) {
            this.#finishedTasks.splice(this.#finishedTasks.indexOf(task), 1);

            return;
        }

        this.#tasks.splice(this.#tasks.indexOf(task), 1);
    }

    _handleButtonClick(e) {
        // handle task-button click (finish, delete, repeat)

        const clicked = e.target; // which button has been clicked

        if (clicked.classList.contains("task-button")) {
            // get .todo-text (sibling element of button)
            //      1. choose parent element
            //      2. search for the child by class (.todo-text)
            const taskText =
                clicked.parentElement.querySelector(".todo-text").textContent;

            // get instance of Task by searching for text (assuming no duplicate tasks are present)
            let tsk = this.#tasks.find(tsk => tsk.text === taskText);

            if (!tsk) {
                // if task wasn't found among #tasks, it's in #finishedTasks
                // finished tasks contain <strike> & </strike> tags, need to remove them
                tsk = this.#finishedTasks.find(tsk => tsk.text === taskText);
            }

            // finishing or deleting? :
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
        // checks if task already exists

        const texts = document.querySelectorAll(".todo-text");

        let isDup = false;

        texts.forEach(txt => {
            if (txt.textContent === formInputText.value) {
                isDup = true;
            }
        });

        return isDup;
    }

    _updateStorage() {
        // updates local storage

        localStorage.setItem("todo-tasks", JSON.stringify(this.#tasks));
        localStorage.setItem(
            "finished-tasks",
            JSON.stringify(this.#finishedTasks)
        );
    }

    _showErrorMessage(msg) {
        // if error message exists -> remove it and show new error

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
