"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
class Variable {
    constructor({ id, tipo, reasignable, posicion, inicializado = false, tamaño = 1, global = false, referencia = null, tipo_de_arreglo = null }) {
        Object.assign(this, id, tipo_de_arreglo);
    }
}
exports.Variable = Variable;
