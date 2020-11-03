"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LlamadaFuncion = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const stack_1 = require("../estructuras/stack");
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class LlamadaFuncion extends nodoAST_1.NodoAST {
    constructor(linea, id, argumentos = []) {
        super(linea);
        Object.assign(this, { id, argumentos });
    }
    traducir(ts) {
        const funcion = ts.getFuncion(this.id);
        //Compruebo que exista la funcion
        if (!funcion) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna funcion con el id: ${this.id}` }));
            return;
        }
        const controles = [];
        //Guardo temporales no utilizados antes de la llamada
        codigo3D_1.Codigo3D.addComentario(`GUARDANDO TEMPORALES SIN UTILIZAR`);
        for (const temp of control_funcion_1.ControlFuncion.getTemporales()) {
            const temp_guardar = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_guardar} = P + ${stack_1.Stack.getSiguiente()};`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${temp_guardar}] = ${temp};`);
        }
        codigo3D_1.Codigo3D.addComentario(`FIN DE GUARDADO DE TEMPORALES`);
        codigo3D_1.Codigo3D.addComentario(`LLamando a funcion ${this.id}`);
        //Realizo la traduccion de los argumentos que recibe la funcion
        for (const argumento of this.argumentos) {
            const control = argumento.traducir(ts);
            //Validación de traduccion
            if (!control) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir el parametro de la funcion` }));
                return;
            }
            controles.push(control);
        }
        const temp_cambio = temporal_1.Temporal.getSiguiente();
        //Cambio simulado de ambito
        codigo3D_1.Codigo3D.add(`${temp_cambio} = P + ${stack_1.Stack.getIndex()};`);
        //Preparacion de argumentos para llamada de funcion
        for (let i = 0; i < controles.length; i++) {
            const control = controles[i];
            const parametro = funcion.getParametro(i);
            const temp_pos = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_cambio} + ${parametro.posicion};`);
            codigo3D_1.Codigo3D.add(`Stack[(int)${temp_pos}] = ${control.temporal};`);
            //Remover temporales de controles generados en la traduccion
            control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
        }
        //Cambio real de ambito
        codigo3D_1.Codigo3D.add(`P = P + ${stack_1.Stack.getIndex()};`);
        codigo3D_1.Codigo3D.add(`${this.id}();`);
        const pos_retorno = temporal_1.Temporal.getSiguiente();
        const temp_retorno = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.addComentario(`Capturando retorno de funcion`);
        codigo3D_1.Codigo3D.add(`${pos_retorno} = P + 0;`);
        codigo3D_1.Codigo3D.add(`${temp_retorno} = Stack[(int)${pos_retorno}];`);
        const control = new control_1.Control({ temporal: temp_retorno, tipo: funcion.tipo, referencia: funcion.referencia });
        //Regreso al ambito
        codigo3D_1.Codigo3D.add(`P = P - ${stack_1.Stack.getIndex()};`);
        //Recupero los temporales guardados antes de la llamada
        codigo3D_1.Codigo3D.addComentario(`RECUPERANDO TEMPORALES GUARDADOS`);
        //Regreso el puntero a antes de guardar
        stack_1.Stack.setIndex(stack_1.Stack.getIndex() - control_funcion_1.ControlFuncion.getTemporalesLength());
        for (const temp of control_funcion_1.ControlFuncion.getTemporales()) {
            const temp_recuperado = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temp_recuperado} = P + ${stack_1.Stack.getSiguiente()};`);
            codigo3D_1.Codigo3D.add(`${temp} = Stack[(int)${temp_recuperado}];`);
        }
        codigo3D_1.Codigo3D.addComentario(`FIN RECUPERACION TEMPORALES GUARDADOS`);
        //Reduzco puntero del stack luego de recuperar
        for (const t in control_funcion_1.ControlFuncion.getTemporales()) {
            stack_1.Stack.getAnterior();
        }
        if (funcion.hasReturn()) {
            control_funcion_1.ControlFuncion.guardarTemporal(temp_retorno);
        }
        return control;
    }
}
exports.LlamadaFuncion = LlamadaFuncion;
