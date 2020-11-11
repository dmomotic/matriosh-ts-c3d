"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Variable = void 0;
const tipos_1 = require("./tipos");
class Variable {
    constructor({ id, tipo, reasignable, posicion = -1, inicializado = false, tamaño = 1, global = false, referencia = null, tipo_de_arreglo = null }) {
        Object.assign(this, { id, tipo, reasignable, posicion, inicializado, tamaño, global, referencia, tipo_de_arreglo });
    }
    toString() {
        let salida = `Variable: ${this.id} - Global: ${this.global ? 'Si' : 'No'} - Tipo: ${tipos_1.getNombreDeTipo(this.tipo)} - Const: ${this.reasignable ? 'No' : 'Si'} - Pos: ${this.posicion} - Valor asignado: ${this.inicializado ? 'Si' : 'No'}`;
        if (tipos_1.isTipoArray(this.tipo)) {
            salida += ` - Tipo Array: ${tipos_1.getNombreDeTipo(this.tipo_de_arreglo)}`;
        }
        return salida;
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
        return this.tipo == 1 /* NUMBER */ || this.tipo == 0 /* STRING */ || this.tipo == 2 /* BOOLEAN */ || this.tipo == 6 /* INT */ || this.tipo == 7 /* FLOAT */;
    }
    isString() {
        return this.tipo === 0 /* STRING */;
    }
    isNumeric() {
        return this.tipo === 6 /* INT */ || this.tipo === 7 /* FLOAT */ || this.tipo == 1 /* NUMBER */;
    }
    isBoolean() {
        return this.tipo === 2 /* BOOLEAN */;
    }
    isReasignable() {
        return this.reasignable;
    }
}
exports.Variable = Variable;
