"use strict";

const form = document.getElementById("form");
const formInputText = document.getElementById("todo-input");
const list = document.getElementById("todo-list");

class App {
    items = [];

    constructor() {
        // load item from application data
        this._loadItems();

        // handle submitting new item
        form.addEventListener("submit", this._addItem.bind(this));
    }

    _addItem(e) {
        // prevent page from reloading
        e.preventDefault();

        // create instance of Item if text is entered
        if (formInputText.value.length === 0) return;
        const item = new Item(formInputText.value);

        //save item to local storage
        this.items.push(item);
        localStorage.setItem("todo-items", JSON.stringify(this.items));

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

    _loadItems() {
        const items = JSON.parse(localStorage.getItem("todo-items"));

        if (!items) return;

        this.items = items;

        this.items.forEach(item => {
            this._displayItem(item);
        });
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
