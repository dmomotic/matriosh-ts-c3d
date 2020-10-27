"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecIdTipoExp = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const heap_1 = require("../../estructuras/heap");
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const variable_1 = require("../../generales/variable");
const control_funcion_1 = require("../../utils/control_funcion");
const tama_o_1 = require("../../utils/tama\u00F1o");
class DecIdTipoExp extends nodoAST_1.NodoAST {
    constructor(linea, reasignable, id, tipo, exp, type_generador = null) {
        super(linea);
        Object.assign(this, { reasignable, id, tipo, exp, type_generador });
    }
    calcularTamaño() {
        tama_o_1.Tamaño.aumentar();
    }
    traducir(ts) {
        //Busco en tabla de simbolos
        let variable = ts.getVariable(this.id);
        //Si la variable ya existe es un error
        if (variable) {
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
        //Compruebo la compatibilidad entre tipos
        if (!tipos_1.tiposValidos(this.tipo, control_exp.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El tipo declarado y el tipo asignado del id: ${this.id} no son iguales` }));
            return;
        }
        //REMUEVO TEMPORAL GUARDADO
        control_funcion_1.ControlFuncion.removerTemporal(control_exp.temporal);
        //Si es una declaracion global
        if (ts.esGlobal()) {
            //Si es number o boolean o string
            if (this.tipo == 1 /* NUMBER */ || this.tipo == 2 /* BOOLEAN */ || this.tipo == 0 /* STRING */) {
                //Validacion para strings
                const tipo = this.tipo == 0 /* STRING */ ? 0 /* STRING */ : control_exp.tipo;
                codigo3D_1.Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} tipo ${tipos_1.getNombreDeTipo(tipo)}`);
                const pos = heap_1.Heap.getSiguiente();
                const temp_pos = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
                codigo3D_1.Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${control_exp.temporal};`);
                //Registro la variable en la tabla de simbolos
                variable = new variable_1.Variable({ id: this.id, reasignable: this.reasignable, tipo, global: true, inicializado: true, posicion: pos });
                ts.setVariable(variable);
            }
        }
        //Si no es una declaracion global
        else {
            //Si es number o bolean o string
            if (this.tipo === 1 /* NUMBER */ || this.tipo === 2 /* BOOLEAN */ || this.tipo == 0 /* STRING */) {
                //Validacion para strings
                const tipo = this.tipo == 0 /* STRING */ ? 0 /* STRING */ : control_exp.tipo;
                codigo3D_1.Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} tipo ${tipos_1.getNombreDeTipo(tipo)}`);
                const pos = stack_1.Stack.getSiguiente();
                const temp_pos = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${pos};`);
                codigo3D_1.Codigo3D.add(`Stack[(int)${temp_pos}] = ${control_exp.temporal};`);
                variable = new variable_1.Variable({ id: this.id, tipo, reasignable: this.reasignable, posicion: pos, inicializado: true, global: false });
                ts.setVariable(variable);
            }
        }
    }
}
exports.DecIdTipoExp = DecIdTipoExp;
