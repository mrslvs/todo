"use strict";

const form = document.getElementById("form");
const formInputText = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

class App {
    constructor() {
        // load item from application data
        form.addEventListener("submit", this._addItem.bind(this));
        console.log("created instance of App");
    }

    _addItem(e) {
        // prevent page from reloading
        e.preventDefault();

        // create instance of Item if text is entered
        if (formInputText.value.length === 0) return;

        const item = new Item(formInputText.value);

        //save item to local storage

        //display item (refresh)
        this._displayItem(item);
    }

    _displayItem(item) {
        let html = `
            <div class="todo-item">
                <p class="todo-text">${item.text}</p>
                <button class="item-button">✅</button>
                <button class="item-button">🚮</button>
            </div>
        `;

        list.insertAdjacentHTML("afterbegin", html);
    }
}

class Item {
    text;
    createdDate;
    finishedDate;

    constructor(text) {
        this.createdDate = Date.now();
        this.text = text + "";
        console.log("created instance of Item");
    }

    _finishTask() {
        this.finishedDate = Date.now();
    }
}

const app = new App();
