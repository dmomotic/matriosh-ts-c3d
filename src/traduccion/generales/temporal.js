"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Temporal = void 0;
class Temporal {
    constructor() {
        this.index = 0;
    }
    static getInstance() {
        if (!Temporal.instance)
            Temporal.instance = new Temporal();
        return Temporal.instance;
    }
    static getSiguiente() {
        return `t${Temporal.getInstance().index++}`;
    }
    static clear() {
        Temporal.getInstance().index = 0;
    }
    static getIndex() {
        return Temporal.getInstance().index;
    }
}
exports.Temporal = Temporal;
