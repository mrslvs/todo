"use strict";

// to-do
//      types of tasks (home, work, sport, ...)
//      do not add duplicates

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
        let tasksStorage = JSON.parse(localStorage.getItem("todo-tasks"));
        let finishedTasksStorage = JSON.parse(
            localStorage.getItem("finished-tasks")
        );

        if (tasksStorage) {
            // from parsed JSON objects create instances of Task & save to variable
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

    _displayTask(task) {
        let html = `
            <div class="todo-task">
                <p class="todo-text">${task.text}</p>
        `;

        if (task.finishedDate) {
            html += `
            <button class="task-button delete-task">❌</button>
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

    _displayTasks(taskArray) {
        taskArray.forEach(task => {
            this._displayTask(task);
        });
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

        // display new item
        this._displayTask(task);

        // clear input field
        formInputText.value = "";
        formInputText.focus();
    }

    _handleButtonClick(e) {
        const clicked = e.target;

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
                tsk = this.#finishedTasks.find(
                    tsk =>
                        tsk.text
                            .replace("<strike>", "")
                            .replace("</strike>", "") === taskText
                );
            }

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

        // update local storage
        localStorage.setItem("todo-tasks", JSON.stringify(this.#tasks));
        localStorage.setItem(
            "finished-tasks",
            JSON.stringify(this.#finishedTasks)
        );

        this._displayTasks(this.#tasks);
        this._displayTasks(this.#finishedTasks);
    }

    _deleteTask(task) {
        if (task.finishedDate) {
            this.#finishedTasks.splice(this.#finishedTasks.indexOf(task), 1); // delete task usin splice method
        }
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
