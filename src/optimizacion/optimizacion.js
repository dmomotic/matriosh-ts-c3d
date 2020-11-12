"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimizacion = void 0;
class Optimizacion {
    constructor(linea, antiguo, nuevo, regla) {
        const aux = +linea + 1;
        Object.assign(this, { linea: aux, antiguo, nuevo, regla });
    }
}
exports.Optimizacion = Optimizacion;
