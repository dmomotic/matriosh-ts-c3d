"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForIn = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
const temporal_1 = require("../../generales/temporal");
const control_funcion_1 = require("../../utils/control_funcion");
const display_1 = require("../../utils/display");
class ForIn extends nodoAST_1.NodoAST {
    constructor(linea, id, declaracion, arr, instrucciones) {
        super(linea);
        Object.assign(this, { id, declaracion, arr, instrucciones });
    }
    calcularTamaño() {
        this.declaracion.calcularTamaño();
        for (const inst of this.instrucciones) {
            inst.calcularTamaño();
        }
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Traduccion FOR_IN`);
        const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
        //Traduccion declaracion
        this.declaracion.traducir(ts_local);
        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_modificacion = etiqueta_1.Etiqueta.getSiguiente();
        //Display del ciclo
        control_funcion_1.ControlFuncion.pushDisplay(new display_1.Display([], lbl_modificacion, true));
        const variable = ts_local.getVariable(this.id);
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable ${this.id} en la instruccion FOR_IN` }));
            return;
        }
        const posicion_iterador = temporal_1.Temporal.getSiguiente();
        //Si es global
        if (variable.isGlobal()) {
            codigo3D_1.Codigo3D.add(`${posicion_iterador} = ${variable.posicion};`);
        }
        //Si no es global
        else {
            codigo3D_1.Codigo3D.add(`${posicion_iterador} = P + ${variable.posicion};`);
        }
        //Posicion inicial del arreglo
        const pos_inicial_arreglo = temporal_1.Temporal.getSiguiente();
        const control_arr = this.arr.traducir(ts_local);
        if (!control_arr) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el arreglo solicitado en el FOR_IN` }));
            return;
        }
        //Remuevo el temporal
        control_funcion_1.ControlFuncion.removerTemporal(control_arr.temporal);
        //console.log('si llega');
        codigo3D_1.Codigo3D.add(`${pos_inicial_arreglo} = ${control_arr.temporal};`);
        //Capturo el tamaño del arreglo
        const aux_tam = temporal_1.Temporal.getSiguiente();
        const tamaño = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${aux_tam} = ${pos_inicial_arreglo} - 1;`);
        codigo3D_1.Codigo3D.add(`${tamaño} = Heap[(int)${aux_tam}];`);
        const val_iterador = temporal_1.Temporal.getSiguiente();
        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
        if (variable.isGlobal()) {
            codigo3D_1.Codigo3D.add(`${val_iterador} = Heap[(int)${posicion_iterador}];`);
        }
        else {
            codigo3D_1.Codigo3D.add(`${val_iterador} = Stack[(int)${posicion_iterador}];`);
        }
        codigo3D_1.Codigo3D.add(`if(${val_iterador} < ${tamaño}) goto ${lbl_true};`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
        for (const inst of this.instrucciones) {
            inst.traducir(ts_local);
        }
        const new_val = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_modificacion}:`);
        //Calculo el nuevo valor del iterador
        codigo3D_1.Codigo3D.add(`${new_val} = ${val_iterador} + 1;`);
        //Asigno el nuevo valor del iterador
        if (variable.isGlobal()) {
            codigo3D_1.Codigo3D.add(`Heap[(int)${posicion_iterador}] = ${new_val};`);
        }
        else {
            codigo3D_1.Codigo3D.add(`Stack[(int)${posicion_iterador}] = ${new_val};`);
        }
        codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        //Agregado por el break
        const display = control_funcion_1.ControlFuncion.popDisplay();
        if (!display)
            return;
        for (const br of display.breaks) {
            codigo3D_1.Codigo3D.add(`${br}:`);
        }
        codigo3D_1.Codigo3D.addComentario(`Fin intruccion FOR_IN`);
    }
}
exports.ForIn = ForIn;
