"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLog = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const etiqueta_1 = require("../generales/etiqueta");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class ConsoleLog extends nodoAST_1.NodoAST {
    constructor(linea, exps) {
        super(linea);
        Object.assign(this, { exps });
    }
    traducir(ts) {
        if (this.exps != null && this.exps.length > 0) {
            for (let exp of this.exps) {
                const control_exp = exp.traducir(ts);
                if (!control_exp) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: 'Error al obtener traduccion de expresion a imprimir en funcion console_log()' }));
                    return;
                }
                if (!(control_exp instanceof control_1.Control)) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: 'Error al obtener clase control de la expresion a imprimir en funcion console_log()' }));
                    return;
                }
                //REMUEVO TEMPORAL GUARDADO
                if (!control_exp.hasEtiquetas()) {
                    control_funcion_1.ControlFuncion.removerTemporal(control_exp.temporal);
                }
                codigo3D_1.Codigo3D.addComentario('CONSOLE.LOG()');
                switch (control_exp.tipo) {
                    case 6 /* INT */:
                        codigo3D_1.Codigo3D.add(`printf("%d",(int)${control_exp.temporal});`);
                        break;
                    case 7 /* FLOAT */:
                        codigo3D_1.Codigo3D.add(`printf("%f",${control_exp.temporal});`);
                        break;
                    case 0 /* STRING */: {
                        //Validación inicial de string
                        const t1 = control_exp.temporal;
                        const lbl_null = etiqueta_1.Etiqueta.getSiguiente();
                        codigo3D_1.Codigo3D.add(`if(${t1} == -1) goto ${lbl_null};`);
                        //Ciclo while para iterar si el string no es null
                        //Etiqueta iterativa del ciclo while
                        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
                        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
                        //Capturo el ascii guardado en la posicion
                        const t2 = temporal_1.Temporal.getSiguiente();
                        codigo3D_1.Codigo3D.add(`${t2} = Heap[(int)${t1}];`);
                        //Condicion while
                        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                        codigo3D_1.Codigo3D.add(`if(${t2} != -1) goto ${lbl_true};`);
                        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                        //Inicio etiqueta verdadera
                        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                        codigo3D_1.Codigo3D.add(`printf("%c",(int)${t2});`);
                        codigo3D_1.Codigo3D.add(`${t1} = ${t1} + 1;`);
                        //Salto a etiqueta iteradora
                        codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
                        //Etiqueta si el string es null
                        codigo3D_1.Codigo3D.add(`${lbl_null}:`);
                        //Etiqueta final ciclo while
                        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                        break;
                    }
                    case 2 /* BOOLEAN */: {
                        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                        const lbl_fin = etiqueta_1.Etiqueta.getSiguiente();
                        codigo3D_1.Codigo3D.add(`if(${control_exp.temporal} == 1) goto ${lbl_true};`);
                        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                        //Imprimir true en consola
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'t'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'r'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'u'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'e'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`goto ${lbl_fin};`);
                        //Etiqueta false (imprimir false en consola)
                        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'f'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'a'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'l'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'s'.charCodeAt(0)});`);
                        codigo3D_1.Codigo3D.add(`printf("%c", ${'e'.charCodeAt(0)});`);
                        //Etiqueta fin
                        codigo3D_1.Codigo3D.add(`${lbl_fin}:`);
                    }
                }
            }
        }
    }
}
exports.ConsoleLog = ConsoleLog;
