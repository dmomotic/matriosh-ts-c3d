"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stack = void 0;
class Stack {
    constructor() {
        this.index = 0;
    }
    static getInstance() {
        if (!Stack.instance)
            Stack.instance = new Stack();
        return Stack.instance;
    }
    static getIndex() {
        return Stack.getInstance().index;
    }
    static setIndex(value) {
        Stack.getInstance().index = value;
    }
    static getSiguiente() {
        return Stack.getInstance().index++;
    }
    static getAnterior() {
        return Stack.getInstance().index--;
    }
    static clear() {
        Stack.getInstance().index = 0;
    }
}
exports.Stack = Stack;
