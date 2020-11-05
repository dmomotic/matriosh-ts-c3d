"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharAt = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class CharAt extends nodoAST_1.NodoAST {
    constructor({ linea, id = null, exp = null, pos }) {
        super(linea);
        Object.assign(this, { id, exp, pos });
    }
    traducir(ts) {
        const control_numero = this.pos.traducir(ts);
        if (!control_numero) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la posicion de la operacion CHAR_AT` }));
            return;
        }
        //Si no es una posicion de tipo number
        if (!tipos_1.isTipoNumber(control_numero.tipo)) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se envio una posicion valida para la instruccion CHAR_AT` }));
            return;
        }
        //REMUEVO EL TEMPORAL
        control_funcion_1.ControlFuncion.removerTemporal(control_numero.temporal);
        //Globales
        const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_and_true = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_and_false = etiqueta_1.Etiqueta.getSiguiente();
        const end = etiqueta_1.Etiqueta.getSiguiente();
        const posicion = temporal_1.Temporal.getSiguiente(); //Posicion donde inicia el caracter que será retornado
        const contador = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${contador} = 0; //Contador auxiliar "CHAR_AT"`);
        const pos = temporal_1.Temporal.getSiguiente();
        const puntero = temporal_1.Temporal.getSiguiente();
        //Si solo es un id
        if (this.id && !this.exp) {
            //Busco la variable
            const variable = ts.getVariable(this.id);
            //Si no existe la variable
            if (!variable) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion charAt en el id: ${this.id} ya que no existe en la tabla de simbolos` }));
                return;
            }
            //Si no es de tipo string
            if (!tipos_1.isTipoString(variable.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion charAt en el id: ${this.id} por que es de tipo ${tipos_1.getNombreDeTipo(variable.tipo)}` }));
                return;
            }
            codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion CHAR_AT`);
            //Si es una variable global
            if (variable.isGlobal()) {
                //Compruebo que la posicion solicitada no sea negativa
                codigo3D_1.Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);
                //Poscicion en el HEAP que contiene el puntero a la cadena
                codigo3D_1.Codigo3D.add(`${pos} = ${variable.posicion};`);
                //Capturo el puntero de la cadena
                codigo3D_1.Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
            }
            //Si es una variable local
            else {
                //Compruebo que la posicion solicitada no sea negativa
                codigo3D_1.Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);
                //Poscicion en el STACK que contiene el puntero a la cadena
                codigo3D_1.Codigo3D.add(`${pos} = P + ${variable.posicion};`);
                //Capturo el puntero de la cadena
                codigo3D_1.Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
            }
        }
        //Si solo es una exp
        else if (!this.id && this.exp) {
            const control_cadena = this.exp.traducir(ts);
            if (!control_cadena) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir cadena de la operacion CHAR_AT` }));
                return;
            }
            //Si no es una posicion de tipo number
            if (!tipos_1.isTipoString(control_cadena.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se envio una cadena valida para la instruccion CHAR_AT` }));
                return;
            }
            //REMUEVO EL TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control_cadena.temporal);
            //Compruebo que la posicion solicitada no sea negativa
            codigo3D_1.Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);
            //Capturo el puntero de la cadena
            codigo3D_1.Codigo3D.add(`${puntero} = ${control_cadena.temporal}; //Puntero hacia la cadena`);
        }
        //Error
        else {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal en la instruccion CHAR_AT` }));
            return;
        }
        /***** CODIGO GENERAL PARA LOS CASOS VALIDOS ********/
        //Si el puntero es -1 es porque es una cadena null
        codigo3D_1.Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
        //Si llega aqui es porque el puntero es una posicion valida
        const char = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
        codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
        codigo3D_1.Codigo3D.add(`if(${char} != -1) goto ${lbl_and_true};`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
        //Ciclo while con para comprobar que el contador sea distinto a la posicion solicitada y que no se haya excedido el limite de la cadena
        codigo3D_1.Codigo3D.add(`${lbl_and_true}:`);
        codigo3D_1.Codigo3D.add(`if(${contador} != ${control_numero.temporal}) goto ${lbl_true};`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_and_false};`);
        codigo3D_1.Codigo3D.add(`${lbl_true}:`);
        codigo3D_1.Codigo3D.add(`${contador} = ${contador} + 1;`);
        codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
        //Si llega a esta etiqueta es porque la cadena es null
        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        codigo3D_1.Codigo3D.add(`${posicion} = -1;`);
        codigo3D_1.Codigo3D.add(`goto ${end};`);
        //Cuando venga a esta etiqueta es porque trae el valor o excede el tamaño de la cadena
        codigo3D_1.Codigo3D.add(`${lbl_and_false}:`);
        //Almaceno el caracter el el HEAP
        codigo3D_1.Codigo3D.add(`${posicion} = H;`);
        codigo3D_1.Codigo3D.add(`Heap[(int)${posicion}] = ${char};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Coloco -1 en la siguiente posicion ya que lo estoy manejando como un string
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        codigo3D_1.Codigo3D.add(`${end}:`);
        //GUARDO EL TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(posicion);
        return new control_1.Control({ temporal: posicion, tipo: 0 /* STRING */ });
    }
}
exports.CharAt = CharAt;
