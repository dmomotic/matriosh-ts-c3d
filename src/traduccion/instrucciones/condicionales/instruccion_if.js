"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstruccionIf = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const tablaSimbolos_1 = require("../../generales/tablaSimbolos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class InstruccionIf extends nodoAST_1.NodoAST {
    constructor(linea, ifs) {
        super(linea);
        Object.assign(this, { ifs });
    }
    traducir(ts) {
        codigo3D_1.Codigo3D.addComentario(`INICIO SENTENCIA IF`);
        const salidas = [];
        for (let inst_if of this.ifs) {
            //Si es un if
            if (!inst_if.isElse()) {
                const lbl_salida = etiqueta_1.Etiqueta.getSiguiente();
                salidas.push(lbl_salida);
                codigo3D_1.Codigo3D.addComentario('Condicion IF');
                const control_if = inst_if.condicion.traducir(ts);
                //Si hubo error al traducir condicion
                if (control_if == null) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Error al traducion condicion de sentencia if` }));
                    return;
                }
                //Validacion tipo control
                if (!(control_if instanceof control_1.Control)) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `El tipo de control retornado por la condicion del if, no es del tipo Control` }));
                    return;
                }
                //El control retornado debe ser boolean
                if (control_if.tipo != 2 /* BOOLEAN */) {
                    errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `La condición del if debe ser de tipo boolean` }));
                    return;
                }
                //Si el control recibido tiene etiquetas
                if (control_if.hasEtiquetas()) {
                    //Imprimo al inicio cada etiqueta verdade
                    for (let lbl of control_if.verdaderas) {
                        codigo3D_1.Codigo3D.add(`${lbl}:`);
                    }
                    //Creo la tabla de simbolo para mi nuevo entorno
                    const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
                    //Traduzco cada instruccion en el cuerpo de la instruccion if
                    inst_if.instrucciones.forEach((instruccion) => {
                        instruccion.traducir(ts_local);
                    });
                    //Imprimo etiqueta de salida
                    codigo3D_1.Codigo3D.add(`goto ${lbl_salida};`);
                    //Imprimo etiquetas falsas
                    for (let lbl of control_if.falsas) {
                        codigo3D_1.Codigo3D.add(`${lbl}:`);
                    }
                }
                //Si el control recibido no tiene etiquetas
                else {
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //REMUEVO EL TEMPORAL
                    control_funcion_1.ControlFuncion.removerTemporal(control_if.temporal);
                    codigo3D_1.Codigo3D.add(`if(${control_if.temporal} == 1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    //Tabla de simbolos para el nuevo entorno
                    const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
                    //Traduzco las intrucciones del if
                    inst_if.instrucciones.forEach((instruccion) => {
                        instruccion.traducir(ts_local);
                    });
                    codigo3D_1.Codigo3D.add(`goto ${lbl_salida};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                }
            }
            //Si es un else
            else {
                codigo3D_1.Codigo3D.addComentario('Condicion ELSE');
                //Tabla de simbolos del entorno nuevo
                const ts_local = new tablaSimbolos_1.TablaSimbolos(ts);
                inst_if.instrucciones.forEach((instruccion) => {
                    instruccion.traducir(ts_local);
                });
            }
        }
        //Imprimo etiquetas de salida
        for (const lbl of salidas) {
            codigo3D_1.Codigo3D.add(`${lbl}:`);
        }
        codigo3D_1.Codigo3D.addComentario(`FINAL SENTENCIA IF`);
    }
}
exports.InstruccionIf = InstruccionIf;
