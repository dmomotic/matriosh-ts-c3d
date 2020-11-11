"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionDosDirecciones = void 0;
const instruccion_con_optimizacion_1 = require("./instruccion_con_optimizacion");
class AsignacionDosDirecciones extends instruccion_con_optimizacion_1.InstruccionConOptimizacion {
    constructor(linea, codigo, dir1, dir2) {
        super(linea, codigo);
        Object.assign(this, { dir1: dir1.toLowerCase(), dir2: dir2.toLowerCase() });
    }
    optimizar() {
        return this.codigo;
    }
}
exports.AsignacionDosDirecciones = AsignacionDosDirecciones;
