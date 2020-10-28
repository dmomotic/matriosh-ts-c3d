"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamadaFuncion = void 0;
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const control_funcion_1 = require("../utils/control_funcion");
class LlamadaFuncion extends nodoAST_1.NodoAST {
    constructor(linea, id, argumentos = []) {
        super(linea);
        Object.assign(this, { id, argumentos });
    }
    traducir(ts) {
        const controles = [];
        //Guardo temporales no utilizados antes de la llamada
        codigo3D_1.Codigo3D.addComentario(`GUARDANDO TEMPORALES SIN UTILIZAR`);
        for (const t of control_funcion_1.ControlFuncion.getTemporales()) {
        }
    }
}
exports.LlamadaFuncion = LlamadaFuncion;
