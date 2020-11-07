"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Incremento = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Incremento extends nodoAST_1.NodoAST {
    constructor(linea, id, instruccion = false) {
        super(linea);
        Object.assign(this, { id, instruccion });
    }
    traducir(ts) {
        /******************************
         * ACCESO SIMPLE DEL TIPO: id++
         ******************************/
        const variable = ts.getVariable(this.id);
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible encontra la variable ${this.id} para la operación ++` }));
            return;
        }
        if (!variable.isReasignable()) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} es de tipo CONSTANTE` }));
            return;
        }
        if (!variable.isNumeric()) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'sematico', linea: this.linea, descripcion: `La variable ${this.id} no es de tipo number` }));
            return;
        }
        const posicion = temporal_1.Temporal.getSiguiente();
        const valor = temporal_1.Temporal.getSiguiente();
        const incremento = temporal_1.Temporal.getSiguiente();
        //Si es una variable global
        if (variable.isGlobal()) {
            codigo3D_1.Codigo3D.add(`${posicion} = ${variable.posicion};`);
            codigo3D_1.Codigo3D.add(`${valor} = Heap[(int) ${posicion}];`);
            codigo3D_1.Codigo3D.add(`${incremento} = ${valor} + 1;`);
            codigo3D_1.Codigo3D.add(`Heap[(int)${posicion}] = ${incremento};`);
        }
        //Si es una variable local
        else {
            codigo3D_1.Codigo3D.add(`${posicion} = P + ${variable.posicion};`);
            codigo3D_1.Codigo3D.add(`${valor} = Stack[(int) ${posicion}];`);
            codigo3D_1.Codigo3D.add(`${incremento} = ${valor} + 1;`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${posicion}] = ${incremento};`);
        }
        //Solo si es una expresion
        if (!this.instruccion) {
            //GUARDO EL TEMPORAL
            control_funcion_1.ControlFuncion.guardarTemporal(incremento);
            return new control_1.Control({ temporal: valor, tipo: variable.tipo });
        }
    }
}
exports.Incremento = Incremento;
