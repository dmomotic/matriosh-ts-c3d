import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoString, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class ToLowerCase extends NodoAST {
  linea: string;
  id: string;
  exp: NodoAST;

  constructor({ linea, id = null, exp = null }: { linea: string, id?: string, exp?: NodoAST }) {
    super(linea);
    Object.assign(this, { id, exp });
  }

  traducir(ts: TablaSimbolos) {
    //Globales
    const lbl_inicial = Etiqueta.getSiguiente();
    const lbl_false = Etiqueta.getSiguiente();
    const lbl_null = Etiqueta.getSiguiente();
    const lbl_end = Etiqueta.getSiguiente();
    const pos = Temporal.getSiguiente();
    const puntero = Temporal.getSiguiente();

    //Si solo es un id
    if (this.id && !this.exp) {
      //Busco la variable
      const variable = ts.getVariable(this.id);
      //Si no existe la variable
      if (!variable) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion TO_LOWER_CASE en el id: ${this.id} ya que no existe en la tabla de simbolos` }));
        return;
      }
      //Si no es de tipo string
      if (!isTipoString(variable.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion TO_LOWER_CASE en el id: ${this.id} por que es de tipo ${getNombreDeTipo(variable.tipo)}` }));
        return;
      }

      Codigo3D.addComentario(`Traduccion instruccion TO_LOWER_CASE`);

      //Si es una variable global
      if (variable.isGlobal()) {
        //Poscicion en el HEAP que contiene el puntero a la cadena
        Codigo3D.add(`${pos} = ${variable.posicion};`);
        //Capturo el puntero de la cadena
        Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
      }
      //Si es una variable local
      else {
        //Poscicion en el HEAP que contiene el puntero a la cadena
        Codigo3D.add(`${pos} = P + ${variable.posicion};`);
        //Capturo el puntero de la cadena
        Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
      }
    }
    //Si solo es una exp
    else if (!this.id && this.exp) {
      const control_cadena: Control = this.exp.traducir(ts);
      if (!control_cadena) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir la expresion para la operacion TO_LOWER_CASE` }));
        return;
      }
      //Si no es de tipo string o array
      if (!isTipoString(control_cadena.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion TO_LOWER_CASE por que la expresion es de tipo ${getNombreDeTipo(control_cadena.tipo)}` }));
        return;
      }

      Codigo3D.addComentario(`Traduccion instruccion TO_LOWER_CASE`);
      //REMUEVO EL TEMPORAL
      ControlFuncion.removerTemporal(control_cadena.temporal);

      //Poscicion en el HEAP que contiene el puntero a la cadena
      Codigo3D.add(`${pos} = ${control_cadena.temporal};`);
      //Capturo el puntero de la cadena
      Codigo3D.add(`${puntero} = ${pos}; //Puntero hacia la cadena`);
    }
    else {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal al realizar operacion TO_LOWER_CASE` }));
      return;
    }

    /**** CODIGO VALIDO PARA AMBOS CASOS *****/
    //Si el puntero es -1 es porque es una cadena null
    Codigo3D.add(`if(${puntero} == -1) goto ${lbl_null};`);

    // Posicion donde iniciara la nueva cadena
    const posicion = Temporal.getSiguiente();
    Codigo3D.add(`${posicion} = H;`);

    //Cantidad a restar para conversion
    const cantidad = Temporal.getSiguiente();
    Codigo3D.add(`${cantidad} = 32;`);

    //Temporales que representan el ascii de las letras iniciales
    const uA = Temporal.getSiguiente();
    Codigo3D.add(`${uA} = ${'A'.charCodeAt(0)}; //A`);
    const uZ = Temporal.getSiguiente();
    Codigo3D.add(`${uZ} = ${'Z'.charCodeAt(0)}; //Z`);

    //Si llega aqui es porque el puntero es una posicion valida
    const char = Temporal.getSiguiente();
    Codigo3D.add(`${lbl_inicial}:`);
    Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
    //Si es un caracter null
    Codigo3D.add(`if(${char} == -1) goto ${lbl_end};`);
    Codigo3D.add(`if(${char} < ${uA} ) goto ${lbl_false};`);
    Codigo3D.add(`if(${char} > ${uZ} ) goto ${lbl_false};`);
    //Si llega aqui es porque debo restar 32 para convertir a mayusculas
    const new_char = Temporal.getSiguiente();
    Codigo3D.add(`${new_char} = ${char} + ${cantidad};`);
    //Almaceno el nuevo caracter
    Codigo3D.add(`Heap[(int)H] = ${new_char};`);
    Codigo3D.add(`H = H + 1;`);
    //Aumento el puntero de la cadena original
    Codigo3D.add(`${puntero} = ${puntero} + 1;`);
    Codigo3D.add(`goto ${lbl_inicial};`);
    //Si llega aqui es porque no es una letra y solo copio el caracter
    Codigo3D.add(`${lbl_false}:`);
    Codigo3D.add(`Heap[(int)H] = ${char};`);
    Codigo3D.add(`H = H + 1;`);
    //Aumento el puntero de la cadena original
    Codigo3D.add(`${puntero} = ${puntero} + 1;`);
    Codigo3D.add(`goto ${lbl_inicial};`);

    //Si es una cadena null
    Codigo3D.add(`${lbl_null}:`);
    Codigo3D.add(`${posicion} = -1;`);
    //Si ya recorri toda la cadena original
    Codigo3D.add(`${lbl_end}:`);
    //Agrego el final de cadena sea null o no
    Codigo3D.add(`Heap[(int)H] = -1;`);
    Codigo3D.add(`H = H + 1;`);

    return new Control({ temporal: posicion, tipo: TIPO_DATO.STRING });
  }

}
