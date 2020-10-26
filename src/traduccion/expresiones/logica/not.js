"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Not = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
class Not extends nodoAST_1.NodoAST {
    constructor(linea, exp) {
        super(linea);
        Object.assign(this, { exp });
    }
    traducir(ts) {
        //Traduccion
        const control = this.exp.traducir(ts);
        //Validaciones
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando de la operacion NOT` }));
            return;
        }
        if (control.tipo != 2 /* BOOLEAN */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador de la operación NOT debe ser de tipo BOOLEAN y es de tipo ${tipos_1.getNombreDeTipo(control.tipo)}` }));
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Operacion AND`);
        let falsas = [];
        let verdaderas = [];
        if (control.hasEtiquetas()) {
            falsas = control.verdaderas;
            verdaderas = control.falsas;
            control.verdaderas = verdaderas;
            control.falsas = falsas;
            return control;
        }
        else {
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            falsas.push(lbl_true);
            verdaderas.push(lbl_false);
            codigo3D_1.Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            return new control_1.Control({ tipo: 2 /* BOOLEAN */, verdaderas, falsas });
        }
    }
}
exports.Not = Not;
