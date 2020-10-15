"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
class Variable {
    constructor({ id, tipo, reasignable, posicion = -1, inicializado = false, tamaño = 1, global = false, referencia = null, tipo_de_arreglo = null }) {
        Object.assign(this, id, tipo, reasignable, posicion, inicializado, tamaño, global, referencia, tipo_de_arreglo);
    }
    setAsGlobal() {
        this.global = true;
    }
    isGlobal() {
        return this.global;
    }
    isArray() {
        return this.tipo == 4 /* ARRAY */;
    }
    isType() {
        return this.tipo == 3 /* TYPE */;
    }
    isPrimitivo() {
        return this.tipo == 1 /* NUMBER */ || this.tipo == 0 /* STRING */ || this.tipo == 2 /* BOOLEAN */;
    }
}
exports.Variable = Variable;
