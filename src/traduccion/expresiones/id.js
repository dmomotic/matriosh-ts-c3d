"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Id = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const tipos_1 = require("../generales/tipos");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class Id extends nodoAST_1.NodoAST {
    constructor(linea, id) {
        super(linea);
        Object.assign(this, { id });
    }
    traducir(ts) {
        const variable = ts.getVariable(this.id);
        //Si la variable no existe es un error
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable con el id: ${this.id}` }));
            return;
        }
        //Si es una variable global
        if (variable.isGlobal()) {
            //Si es de tipo numerico o string o boolean
            if (variable.isNumeric() || variable.isString() || variable.isBoolean()) {
                codigo3D_1.Codigo3D.addComentario(`Acceso a la variable global con id: ${variable.id} (${tipos_1.getNombreDeTipo(variable.tipo)})`);
                const temp_pos = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_pos} = ${variable.posicion};`);
                const temp = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp} = Heap[(int)${temp_pos}];`);
                //GUARDO EL TEMPORAL
                control_funcion_1.ControlFuncion.guardarTemporal(temp);
                return new control_1.Control({ temporal: temp, tipo: variable.tipo });
            }
        }
        //TODO: Si no es una variable global
        else {
            //Si es de tipo numerico
            if (variable.isNumeric() || variable.isString() || variable.isBoolean()) {
                codigo3D_1.Codigo3D.addComentario(`Acceso a la variable con id: ${variable.id} (${tipos_1.getNombreDeTipo(variable.tipo)})`);
                const temp_ref = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_ref} = ${variable.posicion};`);
                const temp_pos = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_pos} = P + ${temp_ref};`);
                const temp_real = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_real} = Stack[(int)${temp_pos}];`);
                //GUARDO EL TEMPORAL
                control_funcion_1.ControlFuncion.guardarTemporal(temp_real);
                return new control_1.Control({ temporal: temp_real, tipo: variable.tipo });
            }
        }
    }
}
exports.Id = Id;
