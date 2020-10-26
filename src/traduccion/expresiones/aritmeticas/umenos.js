"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMenos = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class UMenos extends nodoAST_1.NodoAST {
    constructor(linea, exp) {
        super(linea);
        Object.assign(this, { exp });
    }
    traducir(ts) {
        //Traduccion
        const control = this.exp.traducir(ts);
        //Validaciones
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando de la operacion UMENOS` }));
            return;
        }
        if (control.tipo != 7 /* FLOAT */ && control.tipo != 6 /* INT */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador de la operación UMENOS debe ser de tipo BOOLEAN y es de tipo ${tipos_1.getNombreDeTipo(control.tipo)}` }));
            return;
        }
        const temporal = temporal_1.Temporal.getSiguiente();
        //GUARDO EL TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(temporal);
        codigo3D_1.Codigo3D.add(`${temporal} = ${control.temporal} * -1;`);
        const tipo = control.tipo;
        return new control_1.Control({ temporal, tipo });
    }
}
exports.UMenos = UMenos;
