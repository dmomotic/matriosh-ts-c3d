"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecFuncion = void 0;
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const tama_o_1 = require("../../utils/tama\u00F1o");
class DecFuncion extends nodoAST_1.NodoAST {
    constructor({ linea, id, tipo, referencia = null, parametros = [], instrucciones = [] }) {
        super(linea);
        Object.assign(this, { id, tipo, referencia, parametros, instrucciones });
    }
    calcularTamaño() {
        // for(const p in this.parametros){
        //   Tamaño.aumentar();
        // }
        // for(const i of this.instrucciones){
        //   i.calcularTamaño();
        // }
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`DECLARACIÓN DE FUNCION: ${this.id}`);
        //Reiniciamos el tamaño
        tama_o_1.Tamaño.clear();
        //Reiniciamos stack para retorno
        stack_1.Stack.clear();
        //Calculo el tamaño de la funcion
        for (const p in this.parametros) {
            tama_o_1.Tamaño.aumentar();
        }
        for (const i of this.instrucciones) {
            i.calcularTamaño();
        }
        //Imprimo solo para estar seguro
        codigo3D_1.Codigo3D.addComentario(`El tamaño de la funcion ${this.id} es de ${tama_o_1.Tamaño.getValor()}`);
    }
}
exports.DecFuncion = DecFuncion;
