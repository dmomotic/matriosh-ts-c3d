"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlFuncion = void 0;
const tama_o_1 = require("./tama\u00F1o");
class ControlFuncion {
    constructor({ id = null, tipo = 8 /* NULL */, referencia = null, arreglo = false, temporales = [], displays = [] }) {
        Object.assign(this, { id, tipo, referencia, arreglo, temporales, displays });
    }
    static setId(id) {
        ControlFuncion.getInstance().id = id;
    }
    static setTipo(tipo) {
        ControlFuncion.getInstance().tipo = tipo;
    }
    static setReferencia(referencia) {
        ControlFuncion.getInstance().referencia = referencia;
    }
    static getInstance() {
        if (!ControlFuncion.instance)
            ControlFuncion.instance = new ControlFuncion({});
        return ControlFuncion.instance;
    }
    static clear() {
        ControlFuncion.instance = new ControlFuncion({});
        tama_o_1.Tamaño.clear();
    }
    static getTemporales() {
        return ControlFuncion.getInstance().temporales;
    }
    static getTemporalesLength() {
        return ControlFuncion.getTemporales().length;
    }
    static guardarTemporal(temp) {
        if (!ControlFuncion.getInstance().temporales.includes(temp)) {
            tama_o_1.Tamaño.aumentar();
            ControlFuncion.getInstance().temporales.push(temp);
        }
    }
    static removerTemporal(temp) {
        const index = ControlFuncion.getInstance().temporales.indexOf(temp);
        if (index >= 0) {
            tama_o_1.Tamaño.reducir();
            ControlFuncion.getInstance().temporales.splice(index, 1);
        }
    }
    static hasReturn() {
        return ControlFuncion.getInstance().tipo != 5 /* VOID */;
    }
    static getId() {
        return ControlFuncion.getInstance().id;
    }
    static getTipo() {
        return ControlFuncion.getInstance().tipo;
    }
    static pushDisplay(display) {
        ControlFuncion.getInstance().displays.push(display);
    }
    static popDisplay() {
        return ControlFuncion.getInstance().displays.pop();
    }
    static getDisplayLength() {
        return ControlFuncion.getInstance().displays.length;
    }
}
exports.ControlFuncion = ControlFuncion;
