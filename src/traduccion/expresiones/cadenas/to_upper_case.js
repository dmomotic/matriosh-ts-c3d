"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToUpperCase = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class ToUpperCase extends nodoAST_1.NodoAST {
    constructor({ linea, id = null, exp = null }) {
        super(linea);
        Object.assign(this, { id, exp });
    }
    traducir(ts) {
        //Globales
        const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_null = etiqueta_1.Etiqueta.getSiguiente();
        const lbl_end = etiqueta_1.Etiqueta.getSiguiente();
        const pos = temporal_1.Temporal.getSiguiente();
        const puntero = temporal_1.Temporal.getSiguiente();
        //Si solo es un id
        if (this.id && !this.exp) {
            //Busco la variable
            const variable = ts.getVariable(this.id);
            //Si no existe la variable
            if (!variable) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion TO_UPPER_CASE en el id: ${this.id} ya que no existe en la tabla de simbolos` }));
                return;
            }
            //Si no es de tipo string
            if (!tipos_1.isTipoString(variable.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion TO_UPPER_CASE en el id: ${this.id} por que es de tipo ${tipos_1.getNombreDeTipo(variable.tipo)}` }));
                return;
            }
            codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion TO_UPPER_CASE`);
            //Si es una variable global
            if (variable.isGlobal()) {
                //Poscicion en el HEAP que contiene el puntero a la cadena
                codigo3D_1.Codigo3D.add(`${pos} = ${variable.posicion};`);
                //Capturo el puntero de la cadena
                codigo3D_1.Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
            }
            //Si es una variable local
            else {
                //Poscicion en el HEAP que contiene el puntero a la cadena
                codigo3D_1.Codigo3D.add(`${pos} = P + ${variable.posicion};`);
                //Capturo el puntero de la cadena
                codigo3D_1.Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
            }
        }
        //Si solo es una exp
        else if (!this.id && this.exp) {
            const control_cadena = this.exp.traducir(ts);
            if (!control_cadena) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir la expresion para la operacion TO_UPPER_CASE` }));
                return;
            }
            //Si no es de tipo string o array
            if (!tipos_1.isTipoString(control_cadena.tipo)) {
                errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion TO_UPPER_CASE por que la expresion es de tipo ${tipos_1.getNombreDeTipo(control_cadena.tipo)}` }));
                return;
            }
            codigo3D_1.Codigo3D.addComentario(`Traduccion instruccion TO_UPPER_CASE`);
            //REMUEVO EL TEMPORAL
            control_funcion_1.ControlFuncion.removerTemporal(control_cadena.temporal);
            //Poscicion en el HEAP que contiene el puntero a la cadena
            codigo3D_1.Codigo3D.add(`${pos} = ${control_cadena.temporal};`);
            //Capturo el puntero de la cadena
            codigo3D_1.Codigo3D.add(`${puntero} = ${pos}; //Puntero hacia la cadena`);
        }
        else {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal al realizar operacion TO_UPPER_CASE` }));
            return;
        }
        /**** CODIGO VALIDO PARA AMBOS CASOS *****/
        //Si el puntero es -1 es porque es una cadena null
        codigo3D_1.Codigo3D.add(`if(${puntero} == -1) goto ${lbl_null};`);
        // Posicion donde iniciara la nueva cadena
        const posicion = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${posicion} = H;`);
        //Cantidad a restar para conversion
        const cantidad = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${cantidad} = 32;`);
        //Temporales que representan el ascii de las letras iniciales
        const a = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${a} = ${'a'.charCodeAt(0)}; //a`);
        const z = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${z} = ${'z'.charCodeAt(0)}; //z`);
        //Si llega aqui es porque el puntero es una posicion valida
        const char = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
        codigo3D_1.Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
        //Si es un caracter null
        codigo3D_1.Codigo3D.add(`if(${char} == -1) goto ${lbl_end};`);
        codigo3D_1.Codigo3D.add(`if(${char} < ${a} ) goto ${lbl_false};`);
        codigo3D_1.Codigo3D.add(`if(${char} > ${z} ) goto ${lbl_false};`);
        //Si llega aqui es porque debo restar 32 para convertir a mayusculas
        const new_char = temporal_1.Temporal.getSiguiente();
        codigo3D_1.Codigo3D.add(`${new_char} = ${char} - ${cantidad};`);
        //Almaceno el nuevo caracter
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${new_char};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Aumento el puntero de la cadena original
        codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
        //Si llega aqui es porque no es una letra y solo copio el caracter
        codigo3D_1.Codigo3D.add(`${lbl_false}:`);
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${char};`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        //Aumento el puntero de la cadena original
        codigo3D_1.Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
        //Si es una cadena null
        codigo3D_1.Codigo3D.add(`${lbl_null}:`);
        codigo3D_1.Codigo3D.add(`${posicion} = -1;`);
        //Si ya recorri toda la cadena original
        codigo3D_1.Codigo3D.add(`${lbl_end}:`);
        //Agrego el final de cadena sea null o no
        codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
        codigo3D_1.Codigo3D.add(`H = H + 1;`);
        return new control_1.Control({ temporal: posicion, tipo: 0 /* STRING */ });
    }
}
exports.ToUpperCase = ToUpperCase;
