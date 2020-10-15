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
}
exports.Heap = Heap;
