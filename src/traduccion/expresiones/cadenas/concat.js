"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Concat = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const nodoAST_1 = require("../../generales/nodoAST");
const tipos_1 = require("../../generales/tipos");
const control_funcion_1 = require("../../utils/control_funcion");
class Concat extends nodoAST_1.NodoAST {
    constructor({ linea, id = null, cad1 = null, cad2 }) {
        super(linea);
        Object.assign(this, { id, cad1, cad2 });
    }
    traducir(ts) {
        const control_numero = this.cad2.traducir(ts);
        if (!control_numero) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la segunda cadena de la operacion CONCAT` }));
            return;
        }
        //Si no es una cadena
        if (!tipos_1.isTipoString(control_numero.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La segunda cadena no es valida para la instruccion CONCAT` }));
            return;
        }
        //REMUEVO EL TEMPORAL
        control_funcion_1.ControlFuncion.removerTemporal(control_numero.temporal);
    }
}
exports.Concat = Concat;
