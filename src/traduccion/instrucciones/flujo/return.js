"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Return = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const control_funcion_1 = require("../../utils/control_funcion");
class Return extends nodoAST_1.NodoAST {
    constructor(linea, exp = null) {
        super(linea);
        Object.assign(this, { exp });
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Traducción return`);
        //Si la funcion retorna y no tengo expresion de retorno
        if (control_funcion_1.ControlFuncion.hasReturn() && !this.exp) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La función ${control_funcion_1.ControlFuncion.getId()} debe tener un valor de retorno` }));
            return;
        }
        //Si la funcion no retornoa y tego expresion de retorno
        if (!control_funcion_1.ControlFuncion.hasReturn() && this.exp) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La función ${control_funcion_1.ControlFuncion.getId()} no debe tener un valor de retorno` }));
            return;
        }
        //Si el return trae alguna expresion
        const temp_return = temporal_1.Temporal.getSiguiente();
        if (this.exp) {
            const control = this.exp.traducir(ts);
            //Validacion de traduccion
            if (!control) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir el return de la función` }));
                return;
            }
            //TODO: Creo que debo hacer validaciones de tipos
            if (control.tipo != null) {
                // const salida_return = Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.addComentario(`RETURN CON VALOR`);
                codigo3D_1.Codigo3D.add(`${temp_return} =  P + 0;`);
                codigo3D_1.Codigo3D.add(`Stack[(int)${temp_return}] = ${control.temporal};`);
                //Remuevo el temporal utilizado
                control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
                codigo3D_1.Codigo3D.add(`return;`);
            }
        }
        //Si solo es un return
        else {
            codigo3D_1.Codigo3D.add(`return;`);
        }
        codigo3D_1.Codigo3D.addComentario(`Fin traducción return`);
    }
}
exports.Return = Return;
