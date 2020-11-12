"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArregloConValores = void 0;
const codigo3D_1 = require("../generales/codigo3D");
const etiqueta_1 = require("../generales/etiqueta");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class ArregloConValores extends nodoAST_1.NodoAST {
    constructor(linea, exps) {
        super(linea);
        Object.assign(this, { exps });
    }
    traducir(ts) {
        //Posicion que contendrá el tamaño del arreglo
        const pos_tamaño = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${pos_tamaño} = H;`);
        const tamaño = this.exps.length;
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${tamaño};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Posicion donde inicia el arreglo
        const posicion = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${posicion} = H;`);
        //Iterador
        const iterador = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${iterador} = 0;`);
        //Reservo las posiciones
        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
        codigo3D_1.Codigo3D.add(`if(${iterador} < ${tamaño}) goto ${lbl_true};`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${iterador} = ${iterador} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        //Voy a asignar un -1 al final solo por si acaso aunque creo que no es necesario por la forma en que lo programe
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Aqui debo traducir las expresiones y asignarlas al arreglo
        const controles = [];
        for (const exp of this.exps) {
            const control = exp.traducir(ts);
            control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
            controles.push(control);
        }
        const tipo = controles[0].tipo;
        const pos = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${iterador} = 0;`);
        for (const control of controles) {
            codigo3D_1.Codigo3D.add(`${pos} = ${posicion} + ${iterador};`);
            codigo3D_1.Codigo3D.add(`Heap[(int)${pos}] = ${control.temporal};`);
            codigo3D_1.Codigo3D.add(`${iterador} = ${iterador} + 1;`);
        }
        //Guardo el temporal
        control_funcion_1.ControlFuncion.guardarTemporal(posicion);
        return new control_1.Control({ temporal: posicion, tipo: 4 /* ARRAY */, tipo_de_arreglo: tipo });
    }
}
exports.ArregloConValores = ArregloConValores;
