"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecFuncion = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const funcion_1 = require("../../generales/funcion");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
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
        //Busco si la funcion ya existe
        let funcion = ts.getFuncion(this.id);
        if (funcion) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una funcion declarada con el nombre ${this.id}` }));
            return;
        }
        //Global para el control en la traduccion
        codigo3D_1.Codigo3D.getInstance().traduciendo_funcion = true;
        codigo3D_1.Codigo3D.add(``);
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
        //Declaro asigno una posicion a cada parametro
        for (const parametro of this.parametros) {
            const pos_stack = stack_1.Stack.getSiguiente();
            parametro.posicion = pos_stack;
        }
        funcion = new funcion_1.Funcion({ id: this.id, parametros: this.parametros, tamaño: tama_o_1.Tamaño.getValor() + 1, referencia: this.referencia, tipo: this.tipo });
        ts.setFuncion(funcion);
        const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
        //Genero el codigo de la funcion
        codigo3D_1.Codigo3D.add(`void ${this.id}()\n{`);
        //Traduzco el cuerpo de la función
        for (const instruccion of this.instrucciones) {
            instruccion.traducir(ts_local);
        }
        codigo3D_1.Codigo3D.add(`return;`);
        codigo3D_1.Codigo3D.add(`}`);
        //Global para el control en la traduccion
        codigo3D_1.Codigo3D.getInstance().traduciendo_funcion = false;
    }
}
exports.DecFuncion = DecFuncion;
