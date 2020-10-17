"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ControlFuncion = void 0;
const tama_o_1 = require("./tama\u00F1o");
class ControlFuncion {
    constructor({ id = null, retorna = false, saltos_return = [], tipo = 8 /* NULL */, referencia = null, arreglo = false, temporales = [], displays = [] }) {
        Object.assign(this, { id, retorna, saltos_return, tipo, referencia, arreglo, temporales, displays });
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
    static guardarTemporal(temp) {
        if (!ControlFuncion.instance.temporales.includes(temp)) {
            tama_o_1.Tamaño.aumentar();
            ControlFuncion.instance.temporales.push(temp);
        }
    }
    static removerTemporal(temp) {
        const index = ControlFuncion.instance.temporales.indexOf(temp);
        if (index >= 0) {
            tama_o_1.Tamaño.reducir();
            ControlFuncion.instance.temporales.splice(index, 1);
        }
    }
}
exports.ControlFuncion = ControlFuncion;
