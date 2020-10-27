"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Tamaño = void 0;
class Tamaño {
    constructor() {
        this.index = 1;
    }
    static getInstance() {
        if (!Tamaño.instance)
            Tamaño.instance = new Tamaño();
        return Tamaño.instance;
    }
    static aumentar() {
        Tamaño.getInstance().index++;
    }
    static reducir() {
        Tamaño.getInstance().index--;
    }
    static clear() {
        Tamaño.getInstance().index = 1;
    }
    static getValor() {
        return Tamaño.getInstance().index;
    }
}
exports.Tamaño = Tamaño;
