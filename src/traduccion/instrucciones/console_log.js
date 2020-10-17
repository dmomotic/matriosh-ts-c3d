"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsoleLog = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const control_1 = require("../utils/control");
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
                codigo3D_1.Codigo3D.addComentario('CONSOLE.LOG()');
                switch (control_exp.tipo) {
                    case 6 /* INT */:
                        codigo3D_1.Codigo3D.add(`printf("%d",(int)${control_exp.temporal});`);
                        break;
                    case 7 /* FLOAT */:
                        codigo3D_1.Codigo3D.add(`printf("%f",${control_exp.temporal});`);
                        break;
                }
            }
        }
    }
}
exports.ConsoleLog = ConsoleLog;
