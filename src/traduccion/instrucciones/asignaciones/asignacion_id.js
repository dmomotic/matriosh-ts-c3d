"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionId = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_funcion_1 = require("../../utils/control_funcion");
class AsignacionId extends nodoAST_1.NodoAST {
    constructor(linea, id, tipo_igual, exp) {
        super(linea);
        Object.assign(this, { id, tipo_igual, exp });
    }
    traducir(ts) {
        const variable = ts.getVariable(this.id);
        //Validaciones
        if (!variable) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontro ninguna variable con el id ${this.id} para realizar la asignación` }));
            return;
        }
        if (!variable.isReasignable()) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable con id ${this.id} no puede cambiar de valor ya que es constante` }));
            return;
        }
        if (!this.exp) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se obtuvo ninguna expresion valida para la asignacion de la variable ${this.id}` }));
            return;
        }
        const control = this.exp.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la expresion para la asignacion de la variable ${this.id}` }));
            return;
        }
        //Compruebo los tipos
        if (!this.validarTipos(variable.tipo, control.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede asignar un tipo ${tipos_1.getNombreDeTipo(control.tipo)} a la variable ${this.id} de tipo ${tipos_1.getNombreDeTipo(variable.tipo)}` }));
            return;
        }
        //Remuevo el temporal
        control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
        codigo3D_1.Codigo3D.addComentario(`Asignacion de variable ${this.id}`);
        const pos = temporal_1.Temporal.getSiguiente();
        //Si es una variable global
        if (variable.isGlobal()) {
            //Capturo la posicion en la que se encuentra
            codigo3D_1.Codigo3D.add(`${pos} = ${variable.posicion};`);
            //Si es una variable Number | Boolean | String
            if (tipos_1.isTipoNumber(variable.tipo) || tipos_1.isTipoBoolean(variable.tipo) || tipos_1.isTipoString(variable.tipo)) {
                codigo3D_1.Codigo3D.add(`Heap[(int)${pos}] = ${control.temporal};`);
            }
            //TODO: continuar con los demas tipos
        }
        //Si es una variable local
        else {
            //Capturo la posicion en la que se encuentra
            codigo3D_1.Codigo3D.add(`${pos} = P + ${variable.posicion};`);
            //Si es una variable Number | Boolean | String
            if (tipos_1.isTipoNumber(variable.tipo) || tipos_1.isTipoBoolean(variable.tipo) || tipos_1.isTipoString(variable.tipo)) {
                codigo3D_1.Codigo3D.add(`Stack[(int)${pos}] = ${control.temporal};`);
            }
            //TODO: continuar con los demas tipo
        }
    }
    validarTipos(t1, t2) {
        //number -> boolean -> string -> type -> array
        //number - number
        if (tipos_1.isTipoNumber(t1) && tipos_1.isTipoNumber(t2))
            return true;
        //boolean - boolean
        if (tipos_1.isTipoBoolean(t1) && tipos_1.isTipoBoolean(t2))
            return true;
        //string - string
        if (tipos_1.isTipoString(t1) && tipos_1.isTipoString(t2))
            return true;
        //type - type
        if (tipos_1.isTipoType(t1) && tipos_1.isTipoType(t2))
            return true;
        //array - array
        if (tipos_1.isTipoArray(t1) && tipos_1.isTipoArray(t2))
            return true;
        //string - null
        //type - null
        //array - null
        if ((tipos_1.isTipoString(t1) || tipos_1.isTipoType(t1) || tipos_1.isTipoArray(t1)) && tipos_1.isTipoNull(t2))
            return true;
        return false;
    }
}
exports.AsignacionId = AsignacionId;
