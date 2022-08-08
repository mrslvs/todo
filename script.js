"use strict";

const form = document.getElementById("form");
const formInputText = document.getElementById("todo-input");

class App {
    constructor() {
        // load item from application data
        form.addEventListener("submit", this._addItem);
        console.log("created instance of App");
    }

    _addItem(e) {}
}

class Item {
    text;
    createdDate;
    finishedDate;

    constructor(text) {
        this.createdDate = Date.now();
        this.text = text + "";
    }

    _finishTask() {
        this.finishedDate = Date.now();
    }
}

const app = new App();
