"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Arreglo = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const etiqueta_1 = require("../generales/etiqueta");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const tipos_1 = require("../generales/tipos");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class Arreglo extends nodoAST_1.NodoAST {
    constructor(linea, tamaño) {
        super(linea);
        Object.assign(this, { tamaño });
    }
    traducir(ts) {
        const control = this.tamaño.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir el tamaño del Arreglo` }));
            return;
        }
        if (!tipos_1.isTipoNumber(control.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La expresion new Array solo acepta numeros como parametros` }));
            return;
        }
        //Temporal para asegurar que voy a trabajar con un entero
        const tamaño = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${tamaño} = ${control.temporal};`); //Aqui quite el (int)
        //Guardare en la primera posicion el tamaño del arreglo
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${tamaño};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Posicion donde iniciará el arreglo
        const posicion_inicial = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${posicion_inicial} = H;`);
        //Contador para poder reservar espacio en memoria
        const contador = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${contador} = 0;`);
        //Ciclo para reservar espacios en memoria
        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
        codigo3D_1.Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        //Guardo el temporal
        control_funcion_1.ControlFuncion.guardarTemporal(posicion_inicial);
        return new control_1.Control({ temporal: posicion_inicial, tipo: 4 /* ARRAY */ });
    }
}
exports.Arreglo = Arreglo;
