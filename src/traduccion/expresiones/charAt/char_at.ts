import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoNumber, isTipoString, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class CharAt extends NodoAST {
  linea: string;
  id: string;
  exp: NodoAST;
  pos: NodoAST;

  constructor({ linea, id = null, exp = null, pos }: { linea: string, id?: string, exp?: NodoAST, pos: NodoAST }) {
    super(linea);
    Object.assign(this, { id, exp, pos });
  }

  traducir(ts: TablaSimbolos) {
    const control_numero: Control = this.pos.traducir(ts);

    if (!control_numero) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la posicion de la operacion CHAR_AT` }));
      return;
    }

    //Si no es una posicion de tipo number
    if (!isTipoNumber(control_numero.tipo)) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se envio una posicion valida para la instruccion CHAR_AT` }));
      return;
    }

    //REMUEVO EL TEMPORAL
    ControlFuncion.removerTemporal(control_numero.temporal);

    //Globales
    const lbl_inicial = Etiqueta.getSiguiente();
    const lbl_true = Etiqueta.getSiguiente();
    const lbl_false = Etiqueta.getSiguiente();
    const lbl_and_true = Etiqueta.getSiguiente();
    const lbl_and_false = Etiqueta.getSiguiente();
    const end = Etiqueta.getSiguiente();

    const posicion = Temporal.getSiguiente(); //Posicion donde inicia el caracter que será retornado

    const contador = Temporal.getSiguiente();
    Codigo3D.add(`${contador} = 0; //Contador auxiliar "CHAR_AT"`);

    const pos = Temporal.getSiguiente();
    const puntero = Temporal.getSiguiente();

    //Si solo es un id
    if (this.id && !this.exp) {
      //Busco la variable
      const variable = ts.getVariable(this.id);

      //Si no existe la variable
      if (!variable) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion charAt en el id: ${this.id} ya que no existe en la tabla de simbolos` }));
        return;
      }
      //Si no es de tipo string
      if (!isTipoString(variable.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion charAt en el id: ${this.id} por que es de tipo ${getNombreDeTipo(variable.tipo)}` }));
        return;
      }

      Codigo3D.addComentario(`Traduccion instruccion CHAR_AT`);

      //Si es una variable global
      if (variable.isGlobal()) {
        //Compruebo que la posicion solicitada no sea negativa
        Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);

        //Poscicion en el HEAP que contiene el puntero a la cadena
        Codigo3D.add(`${pos} = ${variable.posicion};`);
        //Capturo el puntero de la cadena
        Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
      }
      //Si es una variable local
      else {
        //Compruebo que la posicion solicitada no sea negativa
        Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);

        //Poscicion en el STACK que contiene el puntero a la cadena
        Codigo3D.add(`${pos} = P + ${variable.posicion};`);
        //Capturo el puntero de la cadena
        Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
      }
    }
    //Si solo es una exp
    else if (!this.id && this.exp) {
      const control_cadena : Control = this.exp.traducir(ts);

      if (!control_cadena) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir cadena de la operacion CHAR_AT` }));
        return;
      }

      //Si no es una posicion de tipo number
      if (!isTipoString(control_cadena.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se envio una cadena valida para la instruccion CHAR_AT`}));
        return;
      }

      //REMUEVO EL TEMPORAL
      ControlFuncion.removerTemporal(control_cadena.temporal);

      //Compruebo que la posicion solicitada no sea negativa
      Codigo3D.add(`if(${control_numero.temporal} < ${contador}) goto ${lbl_false};`);

      //Capturo el puntero de la cadena
      Codigo3D.add(`${puntero} = ${control_cadena.temporal}; //Puntero hacia la cadena`);
    }
    //Error
    else {
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal en la instruccion CHAR_AT`}));
      return;
    }

    /***** CODIGO GENERAL PARA LOS CASOS VALIDOS ********/
    //Si el puntero es -1 es porque es una cadena null
    Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
    //Si llega aqui es porque el puntero es una posicion valida
    const char = Temporal.getSiguiente();
    Codigo3D.add(`${lbl_inicial}:`);
    Codigo3D.add(`${char} = Heap[(int)${puntero}];`);

    Codigo3D.add(`if(${char} != -1) goto ${lbl_and_true};`);
    Codigo3D.add(`goto ${lbl_false};`);

    //Ciclo while con para comprobar que el contador sea distinto a la posicion solicitada y que no se haya excedido el limite de la cadena
    Codigo3D.add(`${lbl_and_true}:`);
    Codigo3D.add(`if(${contador} != ${control_numero.temporal}) goto ${lbl_true};`);
    Codigo3D.add(`goto ${lbl_and_false};`);
    Codigo3D.add(`${lbl_true}:`);
    Codigo3D.add(`${contador} = ${contador} + 1;`);
    Codigo3D.add(`${puntero} = ${puntero} + 1;`);
    Codigo3D.add(`goto ${lbl_inicial};`);
    //Si llega a esta etiqueta es porque la cadena es null
    Codigo3D.add(`${lbl_false}:`);
    Codigo3D.add(`${posicion} = -1;`);
    Codigo3D.add(`goto ${end};`);
    //Cuando venga a esta etiqueta es porque trae el valor o excede el tamaño de la cadena
    Codigo3D.add(`${lbl_and_false}:`);
    //Almaceno el caracter el el HEAP
    Codigo3D.add(`${posicion} = H;`);
    Codigo3D.add(`Heap[(int)${posicion}] = ${char};`);
    Codigo3D.add(`H = H + 1;`);
    //Coloco -1 en la siguiente posicion ya que lo estoy manejando como un string
    Codigo3D.add(`Heap[(int)H] = -1;`);
    Codigo3D.add(`H = H + 1;`);
    Codigo3D.add(`${end}:`);
    //GUARDO EL TEMPORAL
    ControlFuncion.guardarTemporal(posicion);
    return new Control({temporal: posicion, tipo: TIPO_DATO.STRING});
  }

}
