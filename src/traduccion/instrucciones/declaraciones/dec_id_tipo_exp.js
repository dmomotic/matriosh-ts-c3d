"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecIdTipoExp = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const heap_1 = require("../../estructuras/heap");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const variable_1 = require("../../generales/variable");
class DecIdTipoExp extends nodoAST_1.NodoAST {
    constructor(linea, reasignable, id, tipo, exp, type_generador = null) {
        super(linea);
        Object.assign(this, { reasignable, id, tipo, exp, type_generador });
    }
    traducir(ts) {
        //Busco en tabla de simbolos
        let variable = ts.getVariable(this.id);
        //Si la variable no existe es un error
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna variable con el id: ${this.id} en este ambito` }));
            return;
        }
        //Obtengo objeto de tipo Control para mi expresion
        const control_exp = this.exp.traducir(ts);
        //Si mi objeto Control es null es un error
        if (!control_exp) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener los datos necesarios para la expresion en la asignacion del id: ${this.id} ` }));
            return;
        }
        //Compruebo que el tipo del cual debe ser el id sea igual al tipo retornado en mi control
        if (this.tipo != control_exp.tipo) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El tipo declarado y el tipo asignado del id: ${this.id} no son iguales` }));
            return;
        }
        //Si es una declaracion global
        if (ts.esGlobal()) {
            codigo3D_1.Codigo3D.addComentario(`INICIO DECLARACION ID: ${this.id}`);
            const pos = heap_1.Heap.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
            codigo3D_1.Codigo3D.add(`Heap[ ${temp_pos} ] = ${control_exp.temporal};`);
            //Registro la variable en la tabla de simbolos
            variable = new variable_1.Variable({ id: this.id, reasignable: this.reasignable, tipo: this.tipo, global: true, inicializado: true, posicion: pos });
            ts.setVariable(variable);
        }
        //Si no es una declaracion global
        else {
        }
    }
}
exports.DecIdTipoExp = DecIdTipoExp;
