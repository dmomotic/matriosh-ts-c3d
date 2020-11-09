"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecIdTipoCorchetesExp = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const heap_1 = require("../../estructuras/heap");
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const variable_1 = require("../../generales/variable");
const control_funcion_1 = require("../../utils/control_funcion");
const tama_o_1 = require("../../utils/tama\u00F1o");
class DecIdTipoCorchetesExp extends nodoAST_1.NodoAST {
    constructor(linea, reasignable, id, tipo, dimensiones, exp, type_generador = null) {
        super(linea);
        Object.assign(this, { reasignable, id, tipo, dimensiones, exp, type_generador });
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
        //Obtengo objeto de tipo Control para mi expresion
        const control_exp = this.exp.traducir(ts);
        if (!control_exp) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener los datos necesarios para la expresion en la asignacion del id: ${this.id} ` }));
            return;
        }
        //El tipo a asignar debe ser array o null
        if (!tipos_1.isTipoArray(control_exp.tipo) && !tipos_1.isTipoNull(control_exp.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No puede asignar un tipo ${tipos_1.getNombreDeTipo(control_exp.tipo)} a un ARRAY` }));
            return;
        }
        //REMUEVO TEMPORAL GUARDADO
        control_funcion_1.ControlFuncion.removerTemporal(control_exp.temporal);
        codigo3D_1.Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} es un ARRAY tipo ${tipos_1.getNombreDeTipo(this.tipo)}`);
        //Si es una declaracion global
        if (ts.esGlobal()) {
            const pos = heap_1.Heap.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
            codigo3D_1.Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${control_exp.temporal};`);
            //Si el valor que vienes en la expresion es array
            if (control_exp.deboAsignarValorPorDefectoAlArray()) {
                //Si es un array de Numeros o Boolean
                const contador = temporal_1.Temporal.getSiguiente();
                const pos_tamaño = temporal_1.Temporal.getSiguiente();
                const tamaño = temporal_1.Temporal.getSiguiente();
                const puntero = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${contador} = 0;`);
                codigo3D_1.Codigo3D.add(`${puntero} = ${control_exp.temporal};`);
                //Asigne la posicion de los arreglos una casilla antes en el HEAP
                codigo3D_1.Codigo3D.add(`${pos_tamaño} = ${control_exp.temporal} - 1;`);
                codigo3D_1.Codigo3D.add(`${tamaño} = Heap[(int) ${pos_tamaño}];`);
                //Ciclo para asignar valores por defecto
                const lbl_inicio = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.add(`${lbl_inicio}:`);
                codigo3D_1.Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                if (tipos_1.isTipoNumber(this.tipo) || tipos_1.isTipoBoolean(this.tipo)) {
                    codigo3D_1.Codigo3D.add(`Heap[(int)${puntero}] = 0;`);
                }
                else {
                    codigo3D_1.Codigo3D.add(`Heap[(int)${puntero}] = -1;`);
                }
                codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
                codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_inicio};`);
                codigo3D_1.Codigo3D.add(`${lbl_false}:`);
            }
            variable = new variable_1.Variable({ id: this.id, tipo: 4 /* ARRAY */, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: true, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
            ts.setVariable(variable);
        }
        //Si no es una declaracion global
        else {
            const pos = stack_1.Stack.getSiguiente();
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${pos};`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${temp_pos}] = ${control_exp.temporal};`);
            //Si el valor que vienes en la expresion es array
            if (control_exp.deboAsignarValorPorDefectoAlArray()) {
                //Si es un array de Numeros o Boolean
                const contador = temporal_1.Temporal.getSiguiente();
                const pos_tamaño = temporal_1.Temporal.getSiguiente();
                const tamaño = temporal_1.Temporal.getSiguiente();
                const puntero = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${contador} = 0;`);
                codigo3D_1.Codigo3D.add(`${puntero} = ${control_exp.temporal};`);
                //Asigne la posicion de los arreglos una casilla antes en el HEAP
                codigo3D_1.Codigo3D.add(`${pos_tamaño} = ${control_exp.temporal} - 1;`);
                codigo3D_1.Codigo3D.add(`${tamaño} = Heap[(int) ${pos_tamaño}];`);
                //Ciclo para asignar valores por defecto
                const lbl_inicio = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.add(`${lbl_inicio}:`);
                codigo3D_1.Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                if (tipos_1.isTipoNumber(this.tipo) || tipos_1.isTipoBoolean(this.tipo)) {
                    codigo3D_1.Codigo3D.add(`Heap[(int)${puntero}] = 0;`);
                }
                else {
                    codigo3D_1.Codigo3D.add(`Heap[(int)${puntero}] = -1;`);
                }
                codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
                codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_inicio};`);
                codigo3D_1.Codigo3D.add(`${lbl_false}:`);
            }
            variable = new variable_1.Variable({ id: this.id, tipo: 4 /* ARRAY */, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: false, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
            ts.setVariable(variable);
        }
    }
}
exports.DecIdTipoCorchetesExp = DecIdTipoCorchetesExp;
