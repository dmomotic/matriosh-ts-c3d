"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Continue = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const control_funcion_1 = require("../../utils/control_funcion");
class Continue extends nodoAST_1.NodoAST {
    constructor(linea) {
        super(linea);
    }
    traducir(ts) {
        if (control_funcion_1.ControlFuncion.getDisplayLength() <= 0) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La instruccion CONTINUE no se encuentra en un ambito valido` }));
            return;
        }
        const disp = control_funcion_1.ControlFuncion.popDisplay();
        if (!disp.valido) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La instruccion CONTINUE no esta dentro de una instruccion valida` }));
            return;
        }
        const salto = disp.salto_continue;
        if (!salto) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el destino de la instruccion CONTINUE` }));
            control_funcion_1.ControlFuncion.pushDisplay(disp);
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Instruccion CONTINUE`);
        codigo3D_1.Codigo3D.add(`goto ${salto};`);
        //Guardo display
        control_funcion_1.ControlFuncion.pushDisplay(disp);
    }
}
exports.Continue = Continue;
