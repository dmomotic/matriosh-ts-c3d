"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstruccionConOptimizacion = void 0;
const Instruccion_1 = require("./Instruccion");
class InstruccionConOptimizacion extends Instruccion_1.Instruccion {
    constructor(linea, codigo) {
        super(linea, codigo);
    }
}
exports.InstruccionConOptimizacion = InstruccionConOptimizacion;
