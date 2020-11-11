"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Instruccion = void 0;
class Instruccion {
    constructor(linea, codigo) {
        Object.assign(this, { linea: +linea, codigo });
    }
}
exports.Instruccion = Instruccion;
