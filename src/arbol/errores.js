"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Errores = void 0;
class Errores {
    constructor() {
        this.lista = [];
    }
    static getInstance() {
        if (!Errores.instance) {
            Errores.instance = new Errores();
        }
        return Errores.instance;
    }
    static push(error) {
        Errores.getInstance().lista.push(error);
    }
    static clear() {
        Errores.getInstance().lista = [];
    }
    static hasErrors() {
        return Errores.getInstance().lista.length > 0;
    }
    static getErrors() {
        return Errores.getInstance().lista;
    }
}
exports.Errores = Errores;
