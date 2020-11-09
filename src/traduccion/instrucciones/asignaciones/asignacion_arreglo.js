"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionArreglo = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const control_funcion_1 = require("../../utils/control_funcion");
class AsignacionArreglo extends nodoAST_1.NodoAST {
    constructor(linea, asignacion, tipo_igual, exp) {
        super(linea);
        Object.assign(this, { asignacion, tipo_igual, exp });
    }
    traducir(ts) {
        const control = this.asignacion.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la asignacion del arreglo` }));
            return;
        }
        if (!control.hasPosicion()) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal durante la asignacion del arreglo` }));
            return;
        }
        if (this.tipo_igual = '=') {
            const control_exp = this.exp.traducir(ts);
            if (!control_exp) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posibre traducir la expresion para la asignacion del array` }));
                return;
            }
            //REMUEVO EL TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control_exp.temporal);
            codigo3D_1.Codigo3D.add(`Heap[(int)${control.posicion}] = ${control_exp.temporal};`);
        }
    }
}
exports.AsignacionArreglo = AsignacionArreglo;
