"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecIdTipo = void 0;
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
class DecIdTipo extends nodoAST_1.NodoAST {
    constructor(linea, reasignable, id, tipo, type_generador) {
        super(linea);
        Object.assign(this, { reasignable, id, tipo, type_generador });
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
        //Si es const es un error ya que las varaibles cons deben tener un tipo asignado
        if (!this.reasignable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} es de tipo CONST por lo que debe tener un valor asignado` }));
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Declaracion de id: ${this.id} tipo ${tipos_1.getNombreDeTipo(this.tipo)}`);
        const temp_pos = temporal_1.Temporal.getSiguiente();
        const val_defecto = temporal_1.Temporal.getSiguiente();
        //Valores por defecto
        if (tipos_1.isTipoNumber(this.tipo) || tipos_1.isTipoBoolean(this.tipo)) {
            codigo3D_1.Codigo3D.add(`${val_defecto} = 0;`);
        }
        else if (tipos_1.isTipoString(this.tipo) || tipos_1.isTipoType(this.tipo) || tipos_1.isTipoArray(this.tipo)) {
            codigo3D_1.Codigo3D.add(`${val_defecto} = -1;`);
        }
        //Si es una declaracion global
        if (ts.esGlobal()) {
            const pos = heap_1.Heap.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
            codigo3D_1.Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${val_defecto};`);
            variable = new variable_1.Variable({ id: this.id, tipo: this.tipo, reasignable: this.reasignable, posicion: pos, inicializado: false, global: true });
        }
        //Si no es una declaracion global
        else {
            const pos = stack_1.Stack.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${pos};`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${temp_pos}] = ${val_defecto};`);
            variable = new variable_1.Variable({ id: this.id, tipo: this.tipo, reasignable: this.reasignable, posicion: pos, inicializado: false, global: false });
        }
        ts.setVariable(variable);
    }
}
exports.DecIdTipo = DecIdTipo;
