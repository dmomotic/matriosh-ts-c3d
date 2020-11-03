"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Break = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const control_funcion_1 = require("../../utils/control_funcion");
class Break extends nodoAST_1.NodoAST {
    constructor(linea) {
        super(linea);
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Inicio Instruccion BREAK`);
        //Valido que la instruccion este dentro de un ciclo valido
        if (control_funcion_1.ControlFuncion.getDisplayLength() <= 0) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La instruccion BREAK no esta en un entorno valido` }));
            return;
        }
        //Capturo el display actual
        const display = control_funcion_1.ControlFuncion.popDisplay();
        const salto_break = etiqueta_1.Etiqueta.getSiguiente();
        codigo3D_1.Codigo3D.add(`goto ${salto_break};`);
        codigo3D_1.Codigo3D.addComentario(`Fin Instruccion BREAK`);
        //Guardo el salto del break y el display
        if (display) {
            display.breaks.push(salto_break);
            control_funcion_1.ControlFuncion.pushDisplay(display);
        }
    }
}
exports.Break = Break;
