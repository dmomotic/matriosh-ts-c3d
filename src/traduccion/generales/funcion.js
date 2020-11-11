"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Funcion = void 0;
const tipos_1 = require("./tipos");
class Funcion {
    constructor({ id, parametros = [], tamaño = 1, tipo = 5 /* VOID */, referencia = null, tipo_de_arreglo = null, dimensiones = [] }) {
        Object.assign(this, { id, parametros, tamaño, tipo, referencia, tipo_de_arreglo, dimensiones });
    }
    toString() {
        const parametros = this.parametros != null ? this.parametros.length : 0;
        let salida = `Funcion: ${this.id} - Tipo: ${tipos_1.getNombreDeTipo(this.tipo)} - Parametros: ${parametros} - Return Asignado: ${this.hasReturn() ? 'Si' : 'No'}`;
        return salida;
    }
    getParametro(index) {
        return this.parametros[index];
    }
    hasParametro(id) {
        return this.parametros.some(item => item.id == id);
    }
    hasParametros() {
        return this.parametros.length > 0;
    }
    hasReturn() {
        return this.tipo != 5 /* VOID */;
    }
    hasReferencia() {
        return this.referencia != null;
    }
    hasTipoDeArreglo() {
        return this.tipo_de_arreglo != null;
    }
    hasDimensiones() {
        return this.dimensiones.length > 0;
    }
    getTamaño() {
        return this.tamaño;
    }
}
exports.Funcion = Funcion;
