"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Goto = void 0;
const Instruccion_1 = require("./Instruccion");
class Goto extends Instruccion_1.Instruccion {
    constructor(linea, codigo) {
        super(linea, codigo);
    }
    optimizar() {
        return this.codigo;
    }
}
exports.Goto = Goto;
