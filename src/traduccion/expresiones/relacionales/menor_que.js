"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenorQue = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class MenorQue extends nodoAST_1.NodoAST {
    constructor(linea, op_izq, op_der) {
        super(linea);
        Object.assign(this, { op_izq, op_der });
    }
    traducir(ts) {
        const control_izq = this.op_izq.traducir(ts);
        const control_der = this.op_der.traducir(ts);
        //Validaciones
        if (!control_izq) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion menor que` }));
            return;
        }
        if (!control_der) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion menor que` }));
            return;
        }
        //Comprobacion de tipo
        const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
        if (tipo === 8 /* NULL */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una operacion menor que con los tipos ${tipos_1.getNombreDeTipo(control_izq.tipo)} y ${tipos_1.getNombreDeTipo(control_der.tipo)}` }));
            return;
        }
        const temporal = temporal_1.Temporal.getSiguiente();
        //REMUEVO TEMPORALES A UTILIZAR
        control_funcion_1.ControlFuncion.removerTemporal(control_izq.temporal);
        control_funcion_1.ControlFuncion.removerTemporal(control_der.temporal);
        //CREO LISTA DE ETIQUETAS VERDADERAS Y FALSAS
        let verdaderas = [];
        let falsas = [];
        switch (tipo) {
            case 2 /* BOOLEAN */:
                const lbl_verdadera = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_falsa = etiqueta_1.Etiqueta.getSiguiente();
                verdaderas.push(lbl_verdadera);
                falsas.push(lbl_falsa);
                codigo3D_1.Codigo3D.addComentario('Operacion menor que');
                codigo3D_1.Codigo3D.add(`if(${control_izq.temporal} < ${control_der.temporal}) goto ${lbl_verdadera};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_falsa};`);
                return new control_1.Control({ tipo, verdaderas, falsas });
        }
    }
    getTipoResultante(t1, t2) {
        if ((t1 == 7 /* FLOAT */ || t1 == 6 /* INT */) && (t2 == 7 /* FLOAT */ || t2 == 6 /* INT */))
            return 2 /* BOOLEAN */;
        //Cualquier otra combinacion
        return 8 /* NULL */;
    }
}
exports.MenorQue = MenorQue;
