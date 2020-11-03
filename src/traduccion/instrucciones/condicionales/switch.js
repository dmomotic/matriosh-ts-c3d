"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Switch = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
const tipos_1 = require("../../generales/tipos");
const control_funcion_1 = require("../../utils/control_funcion");
const display_1 = require("../../utils/display");
class Switch extends nodoAST_1.NodoAST {
    constructor(linea, exp, cases) {
        super(linea);
        Object.assign(this, { linea, exp, cases });
    }
    calcularTamaño() {
        for (const c of this.cases) {
            for (const inst of c.instrucciones) {
                inst.calcularTamaño();
            }
        }
    }
    traducir(ts) {
        const control = this.exp.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el objeto de tipo control de la expresión en la instruccion SWITCH` }));
            return;
        }
        //Si no es tipo boolean y tampoco es tipo number es un error
        if (!tipos_1.isTipoBoolean(control.tipo) && !tipos_1.isTipoNumber(control.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se permiten instrucciones del tipo ${tipos_1.getNombreDeTipo(control.tipo)} en la instruccion SWITCH` }));
            return;
        }
        codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion SWITCH`);
        const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
        let lbl_revision = etiqueta_1.Etiqueta.getSiguiente();
        //Creo un Display para toda la instruccion
        control_funcion_1.ControlFuncion.pushDisplay(new display_1.Display([], "", false));
        for (const caso of this.cases) {
            //Si es un case
            if (!caso.isDefault()) {
                codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion CASE`);
                const control_case = caso.exp.traducir(ts_local);
                //Compruebo que el tipo del control de case sea del mismo tipo que el switch
                if (control.tipo != control_case.tipo) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El tipo del case (${tipos_1.getNombreDeTipo(control_case.tipo)}) es diferente al tipo del switch (${tipos_1.getNombreDeTipo(control.tipo)})` }));
                    return;
                }
                const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.add(`if(${control.temporal} == ${control_case.temporal}) goto ${lbl_true};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                //Remuevo el temporal
                control_funcion_1.ControlFuncion.removerTemporal(control_case.temporal);
                //Destino del siguiente cuando no hay break
                codigo3D_1.Codigo3D.add(`${lbl_revision}:`);
                codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                //Instrucciones del case
                caso.instrucciones.forEach((instruccion) => {
                    instruccion.traducir(ts_local);
                });
                //Si no hay break, salto al siguiente case
                lbl_revision = etiqueta_1.Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.add(`goto ${lbl_revision};`);
                codigo3D_1.Codigo3D.add(`${lbl_false}:`);
            }
            //Si es un default
            else {
                codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion DEFAULT`);
                caso.instrucciones.forEach((instruccion) => {
                    instruccion.traducir(ts_local);
                });
            }
        }
        //Remuevo el temporal del switch (aunque creo que no lo guardo porque no se si es necesario o no)
        control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
        //Imprimo los breaks
        const disp = control_funcion_1.ControlFuncion.popDisplay();
        if (disp) {
            for (const lbl of disp.breaks) {
                codigo3D_1.Codigo3D.add(`${lbl}:`);
            }
        }
        codigo3D_1.Codigo3D.add(`${lbl_revision}:`);
    }
}
exports.Switch = Switch;
