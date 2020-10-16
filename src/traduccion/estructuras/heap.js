"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Heap = void 0;
class Heap {
    constructor() {
        this.index = 0;
    }
    static getInstance() {
        if (!Heap.instance)
            Heap.instance = new Heap();
        return Heap.instance;
    }
    static getSiguiente() {
        return Heap.getInstance().index++;
    }
    static getIndex() {
        return Heap.getInstance().index;
    }
    static clear() {
        Heap.getInstance().index = 0;
    }
}
exports.Heap = Heap;
