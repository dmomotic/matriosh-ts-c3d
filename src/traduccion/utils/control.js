"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Control = void 0;
class Control {
    constructor({ temporal = null, tipo = null, referencia = null, verdaderas = [], falsas = [], tipo_de_arreglo = null, posicion = null }) {
        Object.assign(this, { temporal, tipo, referencia, verdaderas, falsas, tipo_de_arreglo, posicion });
    }
    hasTemporal() {
        return this.temporal != null && this.temporal.trim().length > 0;
    }
    hasEtiquetas() {
        return this.verdaderas.length > 0 || this.falsas.length > 0;
    }
    hasReferencia() {
        return this.referencia != null;
    }
    deboAsignarValorPorDefectoAlArray() {
        return this.tipo == 4 /* ARRAY */ && this.tipo_de_arreglo == null;
    }
    hasPosicion() {
        return this.posicion != null;
    }
}
exports.Control = Control;
