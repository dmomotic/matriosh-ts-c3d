"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Funcion = void 0;
const instruccion_con_optimizacion_1 = require("./instruccion_con_optimizacion");
class Funcion extends instruccion_con_optimizacion_1.InstruccionConOptimizacion {
    constructor(linea, codigo, id, instrucciones) {
        super(linea, codigo);
        Object.assign(this, { id, instrucciones });
    }
    optimizar() {
        return '';
    }
}
exports.Funcion = Funcion;
