"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Etiqueta = void 0;
class Etiqueta {
    constructor() {
        this.index = 0;
    }
    static getInstance() {
        if (!Etiqueta.instance)
            Etiqueta.instance = new Etiqueta();
        return Etiqueta.instance;
    }
    static getSiguiente() {
        return `L${Etiqueta.getInstance().index++}`;
    }
    static clear() {
        Etiqueta.getInstance().index = 0;
    }
}
exports.Etiqueta = Etiqueta;
