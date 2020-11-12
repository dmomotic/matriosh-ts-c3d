"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimizador = void 0;
const optimizaciones_1 = require("./optimizaciones");
class Optimizador {
    constructor(instrucciones) {
        Object.assign(this, { instrucciones, codigo: '' });
    }
    optimizar() {
        optimizaciones_1.Optimizaciones.clear();
        let salida = '';
        for (const inst of this.instrucciones) {
            salida += inst.optimizar();
        }
        this.codigo = salida;
    }
    getCodigo() {
        return this.codigo;
    }
    getOptimizaciones() {
        return optimizaciones_1.Optimizaciones.getOptimizaciones();
    }
}
exports.Optimizador = Optimizador;
