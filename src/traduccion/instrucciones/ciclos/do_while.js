"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DoWhile = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
const tipos_1 = require("../../generales/tipos");
const control_funcion_1 = require("../../utils/control_funcion");
const display_1 = require("../../utils/display");
class DoWhile extends nodoAST_1.NodoAST {
    constructor(linea, condicion, instrucciones) {
        super(linea);
        Object.assign(this, { condicion, instrucciones });
    }
    calcularTamaño() {
        for (const inst of this.instrucciones) {
            inst.calcularTamaño();
        }
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Traduccion DO_WHILE`);
        const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
        //Registramos el ciclo nuevo en el DISPLAY
        control_funcion_1.ControlFuncion.pushDisplay(new display_1.Display([], lbl_ciclo, true));
        codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
        //Ejecutamos las instrucciones
        const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
        for (const inst of this.instrucciones) {
            inst.traducir(ts_local);
        }
        //Evaluamos la condición
        const control = this.condicion.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condición del DO_WHILE` }));
            return;
        }
        if (!tipos_1.isTipoBoolean(control.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La expresión en el DO_WHILE no es de tipo BOOLEAN` }));
            return;
        }
        //Si el control trae etiquetas
        if (control.hasEtiquetas()) {
            //Imprimo etiquetas verdades
            for (const etiqueta of control.verdaderas) {
                codigo3D_1.Codigo3D.add(`${etiqueta}:`);
            }
            codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
            //Imprimo etiquetas falsas
            for (const etiqueta of control.falsas) {
                codigo3D_1.Codigo3D.add(`${etiqueta}:`);
            }
        }
        //Si no trae etiquetas
        else {
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            //REMUEVO TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
            codigo3D_1.Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_ciclo};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        }
        const display = control_funcion_1.ControlFuncion.popDisplay();
        if (!display)
            return;
        for (const br of display.breaks) {
            codigo3D_1.Codigo3D.add(`${br}:`);
        }
    }
}
exports.DoWhile = DoWhile;
