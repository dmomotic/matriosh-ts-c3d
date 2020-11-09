"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.For = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
const tipos_1 = require("../../generales/tipos");
const control_funcion_1 = require("../../utils/control_funcion");
const display_1 = require("../../utils/display");
class For extends nodoAST_1.NodoAST {
    constructor(linea, init, condicion, modificacion, instrucciones) {
        super(linea);
        Object.assign(this, { init, condicion, modificacion, instrucciones });
    }
    calcularTamaño() {
        for (const inst of this.instrucciones) {
            inst.calcularTamaño();
        }
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion FOR`);
        const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
        //Traduccion de la sentencia inicial del FOR
        this.init.traducir(ts_local);
        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
        //Display del ciclo
        control_funcion_1.ControlFuncion.pushDisplay(new display_1.Display([], lbl_ciclo, true));
        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
        const control_for = this.condicion.traducir(ts_local);
        if (!control_for) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condiciòn del ciclo FOR` }));
            return;
        }
        if (!tipos_1.isTipoBoolean(control_for.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La condicion del ciclo FOR debe ser de tipo BOOLEAN` }));
            return;
        }
        //Si trae etiquetas
        if (control_for.hasEtiquetas()) {
            //Imprimo etiquetas verdaderas
            for (const lbl of control_for.verdaderas) {
                codigo3D_1.Codigo3D.add(`${lbl}:`);
            }
            //Traduzco las instrucciones
            for (const inst of this.instrucciones) {
                inst.traducir(ts_local);
            }
            this.modificacion.traducir(ts_local);
            codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
            //Imprimo las etiquetas falsas
            for (const lbl of control_for.falsas) {
                codigo3D_1.Codigo3D.add(`${lbl}:`);
            }
        }
        //Si no trae etiquetas
        else {
            //Es un temporal true o false
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            //Remuevo el temporal
            control_funcion_1.ControlFuncion.removerTemporal(control_for.temporal);
            codigo3D_1.Codigo3D.add(`if(${control_for.temporal} == 1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            codigo3D_1.Codigo3D.add(`${lbl_true}:`);
            for (const inst of this.instrucciones) {
                inst.traducir(ts_local);
            }
            this.modificacion.traducir(ts_local);
            codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
            codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        }
        codigo3D_1.Codigo3D.addComentario(`Fin instruccion FOR`);
    }
}
exports.For = For;
