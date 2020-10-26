"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.And = void 0;
const error_1 = require("../../../arbol/error");
const control_1 = require("../../utils/control");
const errores_1 = require("../../../arbol/errores");
const nodoAST_1 = require("../../generales/nodoAST");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const control_funcion_1 = require("../../utils/control_funcion");
const tipos_1 = require("../../generales/tipos");
class And extends nodoAST_1.NodoAST {
    constructor(linea, op_izq, op_der) {
        super(linea);
        Object.assign(this, { op_izq, op_der });
    }
    traducir(ts) {
        //Traduzo operador izquierdo
        const control_izq = this.op_izq.traducir(ts);
        //Validaciones
        if (!control_izq) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion AND` }));
            return;
        }
        if (control_izq.tipo != 2 /* BOOLEAN */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador izquierdo de la operación and debe ser de tipo BOOLEAN y es de tipo ${tipos_1.getNombreDeTipo(control_izq.tipo)}` }));
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Operacion AND`);
        let verdaderas = [];
        let falsas = [];
        //Si es temporal
        if (!control_izq.hasEtiquetas()) {
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            control_izq.verdaderas.push(lbl_true);
            control_izq.falsas.push(lbl_false);
            //Remuevo temporal utilizado
            control_funcion_1.ControlFuncion.removerTemporal(control_izq.temporal);
            codigo3D_1.Codigo3D.add(`if(${control_izq.temporal} == 1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        }
        //Imprimo todas las etiquetas verdaderas
        for (const lbl of control_izq.verdaderas) {
            codigo3D_1.Codigo3D.add(`${lbl}:`);
        }
        //Traduzco el operador derecho
        const control_der = this.op_der.traducir(ts);
        //Validaciones
        if (!control_der) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion AND` }));
            return;
        }
        if (control_der.tipo != 2 /* BOOLEAN */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador derecho de la operación AND debe ser de tipo BOOLEAN y es de tipo ${tipos_1.getNombreDeTipo(control_der.tipo)}` }));
            return;
        }
        //Si es temporal
        if (!control_der.hasEtiquetas()) {
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            control_der.verdaderas.push(lbl_true);
            control_der.falsas.push(lbl_false);
            //Remuevo temporal utilizado
            control_funcion_1.ControlFuncion.removerTemporal(control_der.temporal);
            codigo3D_1.Codigo3D.add(`if(${control_der.temporal} == 1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        }
        verdaderas = control_der.verdaderas;
        falsas = control_izq.falsas.concat(control_der.falsas);
        return new control_1.Control({ tipo: 2 /* BOOLEAN */, verdaderas, falsas });
    }
}
exports.And = And;
