"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstruccionSinOptimizacion = void 0;
const Instruccion_1 = require("./Instruccion");
class InstruccionSinOptimizacion extends Instruccion_1.Instruccion {
    constructor(linea, codigo) {
        super(linea, codigo);
    }
    optimizar() {
        return this.codigo;
    }
}
exports.InstruccionSinOptimizacion = InstruccionSinOptimizacion;
