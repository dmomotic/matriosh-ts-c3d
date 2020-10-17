"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Id = void 0;
const error_1 = require("../../arbol/error");
const errores_1 = require("../../arbol/errores");
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
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
            //Si es de tipo numerico
            if (variable.isNumeric()) {
                codigo3D_1.Codigo3D.addComentario(`Acceso a la variable global con id: ${variable.id} (numero)`);
                const pos = variable.posicion;
                const temp_pos = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_pos} = ${pos};`);
                const temp = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp} = Heap[(int)${temp_pos}];`);
                return new control_1.Control({ temporal: temp, tipo: variable.tipo });
            }
        }
    }
}
exports.Id = Id;
