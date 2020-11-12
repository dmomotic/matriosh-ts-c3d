"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Optimizaciones = void 0;
class Optimizaciones {
    constructor() {
        this.optimizaciones = [];
    }
    static getInstance() {
        if (!Optimizaciones.instance)
            Optimizaciones.instance = new Optimizaciones();
        return Optimizaciones.instance;
    }
    static clear() {
        Optimizaciones.getInstance().optimizaciones = [];
    }
    static add(optimizacion) {
        Optimizaciones.getInstance().optimizaciones.push(optimizacion);
    }
    static getOptimizaciones() {
        return Optimizaciones.getInstance().optimizaciones;
    }
}
exports.Optimizaciones = Optimizaciones;
