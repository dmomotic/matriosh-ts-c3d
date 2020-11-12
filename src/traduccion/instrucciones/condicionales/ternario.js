"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ternario = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Ternario extends nodoAST_1.NodoAST {
    constructor(linea, condicion, inst_true, inst_false) {
        super(linea);
        Object.assign(this, { condicion, inst_true, inst_false });
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`Traduccion operador TERNARIO`);
        const control = this.condicion.traducir(ts);
        if (!control) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condición del op ternario` }));
            return;
        }
        //Si la condicion trae etiquetas
        if (control.hasEtiquetas()) {
            const lbl_salida = etiqueta_1.Etiqueta.getSiguiente();
            //Imprimo al inicio cada etiqueta verdadera
            for (let lbl of control.verdaderas) {
                codigo3D_1.Codigo3D.add(`${lbl}:`);
            }
            //Traduzco la instruccion verdadera
            const control_true = this.inst_true.traducir(ts);
            //Remuevo el tempora
            control_funcion_1.ControlFuncion.removerTemporal(control_true.temporal);
            const temporal = temporal_1.Temporal.getSiguiente();
            codigo3D_1.Codigo3D.add(`${temporal} = ${control_true.temporal};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_salida};`);
            //Imprimo las etiquetas falsas
            for (let lbl of control.falsas) {
                codigo3D_1.Codigo3D.add(`${lbl}:`);
            }
            const control_false = this.inst_false.traducir(ts);
            //Remuevo el temporal
            control_funcion_1.ControlFuncion.removerTemporal(control_false.temporal);
            codigo3D_1.Codigo3D.add(`${temporal} = ${control_false.temporal};`);
            codigo3D_1.Codigo3D.add(`${lbl_salida}:`);
            //Guardo el tempora
            control_funcion_1.ControlFuncion.guardarTemporal(temporal);
            return new control_1.Control({ temporal, tipo: control_true.tipo, tipo_de_arreglo: control_true.tipo_de_arreglo });
        }
        //Si no trae etiquetas
        else {
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            const temporal = temporal_1.Temporal.getSiguiente();
            const lbl_salida = etiqueta_1.Etiqueta.getSiguiente();
            //REMUEVO EL TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
            codigo3D_1.Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            codigo3D_1.Codigo3D.add(`${lbl_true}:`);
            //Traduzco la instruccion verdadera
            const control_true = this.inst_true.traducir(ts);
            //Remuevo el tempora
            control_funcion_1.ControlFuncion.removerTemporal(control_true.temporal);
            codigo3D_1.Codigo3D.add(`${temporal} = ${control_true.temporal};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_salida};`);
            codigo3D_1.Codigo3D.add(`${lbl_false}:`);
            const control_false = this.inst_false.traducir(ts);
            //Remuevo el temporal
            control_funcion_1.ControlFuncion.removerTemporal(control_false.temporal);
            codigo3D_1.Codigo3D.add(`${temporal} = ${control_false.temporal};`);
            codigo3D_1.Codigo3D.add(`${lbl_salida}:`);
            //Guardo el temporal
            control_funcion_1.ControlFuncion.guardarTemporal(temporal);
            return new control_1.Control({ temporal, tipo: control_true.tipo, tipo_de_arreglo: control_true.tipo_de_arreglo });
        }
    }
}
exports.Ternario = Ternario;
