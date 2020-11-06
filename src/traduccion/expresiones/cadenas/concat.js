"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Concat = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Concat extends nodoAST_1.NodoAST {
    constructor({ linea, id = null, cad1 = null, cad2 }) {
        super(linea);
        Object.assign(this, { id, cad1, cad2 });
    }
    traducir(ts) {
        const control_cadena2 = this.cad2.traducir(ts);
        if (!control_cadena2) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la cadena a concatenar` }));
            return;
        }
        if (!tipos_1.isTipoString(control_cadena2.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La expresion enviada no es de tipo STRING` }));
            return;
        }
        //REMUEVO EL TEMPORAL
        control_funcion_1.ControlFuncion.removerTemporal(control_cadena2.temporal);
        //Globales
        const pos_cad1 = temporal_1.Temporal.getSiguiente();
        const pos_cad2 = temporal_1.Temporal.getSiguiente();
        //Si se esta concatenando con un id
        if (this.id && this.cad2) {
            const variable = ts.getVariable(this.id);
            if (!variable) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontró la variable ${this.id}` }));
                return;
            }
            if (!tipos_1.isTipoString(variable.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} no es de tipo STRING` }));
                return;
            }
            //Si es una variable global
            if (variable.isGlobal()) {
                codigo3D_1.Codigo3D.add(`${pos_cad1} = Heap[(int)${variable.posicion}];`);
            }
            //Si no es variable global
            else {
                const pos_aux = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${pos_aux} = P + ${variable.posicion};`);
                codigo3D_1.Codigo3D.add(`${pos_cad1} = Stack[(int)${pos_aux}];`);
            }
        }
        //Si son dos cadenas directamente
        else if (this.cad1 && this.cad2) {
            const control_cad1 = this.cad1.traducir(ts);
            if (!control_cad1) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la primer cadena` }));
                return;
            }
            if (!tipos_1.isTipoString(control_cad1.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La primer cadena no es un STRING` }));
                return;
            }
            //Solo capturo la posicion de la cadena 1
            codigo3D_1.Codigo3D.add(`${pos_cad1} = ${control_cad1.temporal};`);
        }
        else {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal en la instruccion CONCAT` }));
            return;
        }
        /*** CODIGO VALIDO PARA TODOS LOS CASOS ***/
        codigo3D_1.Codigo3D.add(`${pos_cad2} = ${control_cadena2.temporal};`);
        //Temporal donde inicia la nueva cadena
        const puntero = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${puntero} = H;`);
        const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_final = etiqueta_1.Etiqueta.getSiguiente();
        const char = temporal_1.Temporal.getSiguiente();
        //Valido si alguna de las 2 es null, la concatenacion sera null
        const lbl_null = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`if(${pos_cad1} == -1) goto ${lbl_null};`);
        codigo3D_1.Codigo3D.add(`if(${pos_cad2} != -1) goto ${lbl_inicial};`);
        codigo3D_1.Codigo3D.add(`${lbl_null}:`);
        codigo3D_1.Codigo3D.add(`${puntero} = -1;`);
        const lbl_end = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`goto ${lbl_end};`);
        //Concateno cadena 1
        codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
        codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${pos_cad1}];`);
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${char};`);
        codigo3D_1.Codigo3D.add(`if(${char} == -1) goto ${lbl_final};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${pos_cad1} = ${pos_cad1} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
        codigo3D_1.Codigo3D.add(`${lbl_final}:`);
        //Concateno cadena 2
        const lbl_inicial2 = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_final2 = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_inicial2}:`);
        codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${pos_cad2}];`);
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${char};`);
        codigo3D_1.Codigo3D.add(`if(${char} == -1) goto ${lbl_final2};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${pos_cad2} = ${pos_cad2} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_inicial2};`);
        codigo3D_1.Codigo3D.add(`${lbl_final2}:`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${lbl_end}:`);
        //GUARDO EL TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(puntero);
        return new control_1.Control({ temporal: puntero, tipo: 0 /* STRING */ });
    }
}
exports.Concat = Concat;
