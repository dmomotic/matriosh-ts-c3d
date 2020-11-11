"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Entornos = void 0;
const _ = require("lodash");
class Entornos {
    constructor() {
        this.lista = [];
    }
    static getInstance() {
        if (!Entornos.instance) {
            Entornos.instance = new Entornos();
        }
        return Entornos.instance;
    }
    static push(entorno) {
        Entornos.getInstance().lista.push(_.cloneDeep(entorno));
    }
    static clear() {
        Entornos.getInstance().lista = [];
    }
    static getLista() {
        return Entornos.getInstance().lista;
    }
}
exports.Entornos = Entornos;
