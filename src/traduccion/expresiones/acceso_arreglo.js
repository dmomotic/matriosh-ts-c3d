"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccesoArreglo = void 0;
const nodoAST_1 = require("../generales/nodoAST");
class AccesoArreglo extends nodoAST_1.NodoAST {
    constructor(linea, id, lista_exps) {
        super(linea);
        Object.assign(this, { id, lista_exps });
    }
    traducir(ts) {
    }
}
exports.AccesoArreglo = AccesoArreglo;
