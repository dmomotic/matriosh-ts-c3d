"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Length = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Length extends nodoAST_1.NodoAST {
    constructor({ linea, id = null, exp = null }) {
        super(linea);
        Object.assign(this, { id, exp });
    }
    traducir(ts) {
        //Si solo es un id
        if (this.id && !this.exp) {
            //Busco la variable
            const variable = ts.getVariable(this.id);
            //Si no existe la variable
            if (!variable) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion length en el id: ${this.id} ya que no existe en la tabla de simbolos` }));
                return;
            }
            //Si no es de tipo string o array
            if (!tipos_1.isTipoString(variable.tipo) && !tipos_1.isTipoArray(variable.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion length en el id: ${this.id} por que es de tipo ${tipos_1.getNombreDeTipo(variable.tipo)}` }));
                return;
            }
            codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion LENGTH`);
            //Si es una variable global
            if (variable.isGlobal()) {
                //Si es tipo STRING
                if (tipos_1.isTipoString(variable.tipo)) {
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    const contador = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);
                    const pos = temporal_1.Temporal.getSiguiente();
                    //Poscicion en el HEAP que contiene el puntero a la cadena
                    codigo3D_1.Codigo3D.add(`${pos} = ${variable.posicion};`);
                    //Capturo el puntero de la cadena
                    const puntero = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
                    //Si el puntero es -1 es porque es una cadena null
                    codigo3D_1.Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
                    //Si llega aqui es porque el puntero es una posicion valida
                    const char = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
                    codigo3D_1.Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
                    codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    //GUARDO EL TEMPORAL
                    control_funcion_1.ControlFuncion.guardarTemporal(contador);
                    return new control_1.Control({ temporal: contador, tipo: 6 /* INT */ });
                }
                //Si es tipo ARRAY
                else if (tipos_1.isTipoArray(variable.tipo)) {
                    //TODO: implementar
                }
            }
            //Si es una variable local
            else {
                //Si es tipo STRING
                if (tipos_1.isTipoString(variable.tipo)) {
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    const contador = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);
                    const pos = temporal_1.Temporal.getSiguiente();
                    //Poscicion en el HEAP que contiene el puntero a la cadena
                    codigo3D_1.Codigo3D.add(`${pos} = P + ${variable.posicion};`);
                    //Capturo el puntero de la cadena
                    const puntero = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
                    //Si el puntero es -1 es porque es una cadena null
                    codigo3D_1.Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
                    //Si llega aqui es porque el puntero es una posicion valida
                    const char = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
                    codigo3D_1.Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
                    codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    //GUARDO EL TEMPORAL
                    control_funcion_1.ControlFuncion.guardarTemporal(contador);
                    return new control_1.Control({ temporal: contador, tipo: 6 /* INT */ });
                }
                //Si es tipo ARRAY
                else if (tipos_1.isTipoArray(variable.tipo)) {
                    //TODO: implementar
                }
            }
        }
        //Si solo es una exp
        else if (!this.id && this.exp) {
            const control = this.exp.traducir(ts);
            if (!control) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir la expresion para la operacion LENGTH` }));
                return;
            }
            //Si no es de tipo string o array
            if (!tipos_1.isTipoString(control.tipo) && !tipos_1.isTipoArray(control.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion length por que la expresion es de tipo ${tipos_1.getNombreDeTipo(control.tipo)}` }));
                return;
            }
            codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion LENGTH`);
            //REMUEVO EL TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control.temporal);
            //Si es tipo STRING
            if (tipos_1.isTipoString(control.tipo)) {
                //El temporal trae el puntero donde inicia la cadena
                const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                const contador = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);
                const puntero = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${puntero} = ${control.temporal}; //Puntero hacia la cadena`);
                //Si el puntero es -1 es porque es una cadena null
                codigo3D_1.Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
                //Si llega aqui es porque el puntero es una posicion valida
                const char = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
                codigo3D_1.Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
                codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                //GUARDO EL TEMPORAL
                control_funcion_1.ControlFuncion.guardarTemporal(contador);
                return new control_1.Control({ temporal: contador, tipo: 6 /* INT */ });
            }
            //Si es tipo ARRAY
            else if (tipos_1.isTipoArray(control.tipo)) {
                //TODO: implementar
            }
        }
    }
}
exports.Length = Length;
