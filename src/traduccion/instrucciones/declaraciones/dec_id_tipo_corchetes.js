"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecIdTipoCorchetes = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const heap_1 = require("../../estructuras/heap");
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const variable_1 = require("../../generales/variable");
const tama_o_1 = require("../../utils/tama\u00F1o");
class DecIdTipoCorchetes extends nodoAST_1.NodoAST {
    constructor(linea, reasignable, id, tipo, dimensiones, type_generador = null) {
        super(linea);
        Object.assign(this, { reasignable, id, tipo, dimensiones, type_generador });
    }
    calcularTamaño() {
        tama_o_1.Tamaño.aumentar();
    }
    traducir(ts) {
        //Busco en tabla de simbolos
        let variable = ts.getVariable(this.id);
        //Si la variable ya existe es un error
        if (variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una variable con el id: ${this.id} en este ambito` }));
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} es un ARRAY tipo ${tipos_1.getNombreDeTipo(this.tipo)}`);
        //Si es una declaracion global
        if (ts.esGlobal()) {
            const pos = heap_1.Heap.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
            codigo3D_1.Codigo3D.add(`Heap[ (int)${temp_pos} ] = -1;`);
            variable = new variable_1.Variable({ id: this.id, tipo: 4 /* ARRAY */, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: true, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
            ts.setVariable(variable);
        }
        //Si no es una declaracion global
        else {
            const pos = stack_1.Stack.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${pos};`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${temp_pos}] = -1;`);
            variable = new variable_1.Variable({ id: this.id, tipo: 4 /* ARRAY */, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: false, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
            ts.setVariable(variable);
        }
    }
}
exports.DecIdTipoCorchetes = DecIdTipoCorchetes;
