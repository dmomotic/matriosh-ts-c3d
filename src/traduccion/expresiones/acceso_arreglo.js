"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccesoArreglo = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const etiqueta_1 = require("../generales/etiqueta");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const tipos_1 = require("../generales/tipos");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class AccesoArreglo extends nodoAST_1.NodoAST {
    constructor(linea, id, lista_exps) {
        super(linea);
        Object.assign(this, { id, lista_exps });
    }
    /******************************
     *
     * DE MOMENTO SOLO FUNCIONA PARA UNA DIMENSION SI ME DA TIEMPO LO HAGO DE VARIAS DIMENSIONES
     *
     *****************************/
    traducir(ts) {
        const variable = ts.getVariable(this.id);
        //Si la variable no existe es un error
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable con el id: ${this.id}` }));
            return;
        }
        //Si la variable no es un arreglo
        if (!tipos_1.isTipoArray(variable.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable con id ${this.id} no es de tipo ARRAY` }));
            return;
        }
        const temp_pos = temporal_1.Temporal.getSiguiente();
        const pos_inicial = temporal_1.Temporal.getSiguiente();
        //Si es una variable global
        if (variable.isGlobal()) {
            codigo3D_1.Codigo3D.add(`${temp_pos} = ${variable.posicion};`);
            codigo3D_1.Codigo3D.add(`${pos_inicial} = Heap[(int)${temp_pos}];`);
        }
        //Si es una variable local
        else {
            codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${variable.posicion};`);
            codigo3D_1.Codigo3D.add(`${pos_inicial} = Stack[(int)${temp_pos}];`);
        }
        //Codigo valido para ambos casos
        const resp = temporal_1.Temporal.getSiguiente();
        const posicion_exacta = temporal_1.Temporal.getSiguiente();
        const aux_tam = temporal_1.Temporal.getSiguiente();
        const tamaño = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${aux_tam} = ${pos_inicial} - 1;`);
        codigo3D_1.Codigo3D.add(`${tamaño} = Heap[(int)${aux_tam}];`);
        const lb_false = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_end = etiqueta_1.Etiqueta.getSiguiente();
        for (const exp of this.lista_exps) {
            const control_pos = exp.traducir(ts);
            if (!control_pos) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir una de las posiciones para el acceso de ${this.id}` }));
                return;
            }
            if (!tipos_1.isTipoNumber(control_pos.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede acceder a una posicion de tipo ${tipos_1.getNombreDeTipo(control_pos.tipo)}` }));
                return;
            }
            //Remuevo el tempora
            control_funcion_1.ControlFuncion.removerTemporal(control_pos.temporal);
            //Compruebo que sean posiciones validas
            codigo3D_1.Codigo3D.add(`if(${control_pos.temporal} < 0) goto ${lb_false};`);
            codigo3D_1.Codigo3D.add(`if(${control_pos.temporal} >= ${tamaño}) goto ${lb_false};`);
            codigo3D_1.Codigo3D.add(`${posicion_exacta} = ${pos_inicial} + ${control_pos.temporal};`);
        }
        codigo3D_1.Codigo3D.add(`${resp} = Heap[(int)${posicion_exacta}];`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_end};`);
        codigo3D_1.Codigo3D.add(`${lb_false}:`);
        codigo3D_1.Codigo3D.add(`${resp} = -1;`);
        codigo3D_1.Codigo3D.add(`${lbl_end}:`);
        //GUARDO EL TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(resp);
        return new control_1.Control({ temporal: resp, tipo: variable.tipo_de_arreglo, posicion: posicion_exacta });
    }
}
exports.AccesoArreglo = AccesoArreglo;
