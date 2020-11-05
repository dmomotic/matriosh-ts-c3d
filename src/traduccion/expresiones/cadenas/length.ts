import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoArray, isTipoString, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Length extends NodoAST {

  linea: string;
  id: string;
  exp: NodoAST;

  constructor({linea, id = null, exp = null } : {linea : string, id? : string, exp?: NodoAST}){
    super(linea);
    Object.assign(this, {id, exp});
  }

  traducir(ts: TablaSimbolos) {
    //Si solo es un id
    if(this.id && !this.exp){
      //Busco la variable
      const variable = ts.getVariable(this.id);
      //Si no existe la variable
      if(!variable){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se puede efectuar la operacion length en el id: ${this.id} ya que no existe en la tabla de simbolos`}));
        return;
      }
      //Si no es de tipo string o array
      if(!isTipoString(variable.tipo) && !isTipoArray(variable.tipo)){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion length en el id: ${this.id} por que es de tipo ${getNombreDeTipo(variable.tipo)}`}));
        return;
      }

      Codigo3D.addComentario(`Traduccion instruccion LENGTH`);

      //Si es una variable global
      if(variable.isGlobal()){
        //Si es tipo STRING
        if(isTipoString(variable.tipo)){
          const lbl_inicial = Etiqueta.getSiguiente();
          const lbl_true = Etiqueta.getSiguiente();
          const lbl_false = Etiqueta.getSiguiente();

          const contador = Temporal.getSiguiente();
          Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);
          const pos = Temporal.getSiguiente();
          //Poscicion en el HEAP que contiene el puntero a la cadena
          Codigo3D.add(`${pos} = ${variable.posicion};`);
          //Capturo el puntero de la cadena
          const puntero = Temporal.getSiguiente();
          Codigo3D.add(`${puntero} = Heap[(int)${pos}]; //Puntero hacia la cadena`);
          //Si el puntero es -1 es porque es una cadena null
          Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
          //Si llega aqui es porque el puntero es una posicion valida
          const char = Temporal.getSiguiente();
          Codigo3D.add(`${lbl_inicial}:`);
          Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
          Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
          Codigo3D.add(`goto ${lbl_false};`);
          Codigo3D.add(`${lbl_true}:`);
          Codigo3D.add(`${contador} = ${contador} + 1;`);
          Codigo3D.add(`${puntero} = ${puntero} + 1;`);
          Codigo3D.add(`goto ${lbl_inicial};`);

          Codigo3D.add(`${lbl_false}:`);

          //GUARDO EL TEMPORAL
          ControlFuncion.guardarTemporal(contador);
          return new Control({temporal: contador, tipo: TIPO_DATO.INT});
        }
        //Si es tipo ARRAY
        else if(isTipoArray(variable.tipo)){
          //TODO: implementar
        }
      }
      //Si es una variable local
      else {
        //Si es tipo STRING
        if(isTipoString(variable.tipo)){
          const lbl_inicial = Etiqueta.getSiguiente();
          const lbl_true = Etiqueta.getSiguiente();
          const lbl_false = Etiqueta.getSiguiente();

          const contador = Temporal.getSiguiente();
          Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);
          const pos = Temporal.getSiguiente();
          //Poscicion en el HEAP que contiene el puntero a la cadena
          Codigo3D.add(`${pos} = P + ${variable.posicion};`);
          //Capturo el puntero de la cadena
          const puntero = Temporal.getSiguiente();
          Codigo3D.add(`${puntero} = Stack[(int)${pos}]; //Puntero hacia la cadena`);
          //Si el puntero es -1 es porque es una cadena null
          Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);
          //Si llega aqui es porque el puntero es una posicion valida
          const char = Temporal.getSiguiente();
          Codigo3D.add(`${lbl_inicial}:`);
          Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
          Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
          Codigo3D.add(`goto ${lbl_false};`);
          Codigo3D.add(`${lbl_true}:`);
          Codigo3D.add(`${contador} = ${contador} + 1;`);
          Codigo3D.add(`${puntero} = ${puntero} + 1;`);
          Codigo3D.add(`goto ${lbl_inicial};`);

          Codigo3D.add(`${lbl_false}:`);

          //GUARDO EL TEMPORAL
          ControlFuncion.guardarTemporal(contador);
          return new Control({temporal: contador, tipo: TIPO_DATO.INT});
        }
        //Si es tipo ARRAY
        else if(isTipoArray(variable.tipo)){
          //TODO: implementar
        }
      }
    }
    //Si solo es una exp
    else if(!this.id && this.exp){
      const control : Control = this.exp.traducir(ts);
      if(!control){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir la expresion para la operacion LENGTH`}));
        return;
      }
      //Si no es de tipo string o array
      if(!isTipoString(control.tipo) && !isTipoArray(control.tipo)){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar la operacion length por que la expresion es de tipo ${getNombreDeTipo(control.tipo)}`}));
        return;
      }

      Codigo3D.addComentario(`Traduccion instruccion LENGTH`);
      //REMUEVO EL TEMPORAL
      ControlFuncion.removerTemporal(control.temporal);
      //Si es tipo STRING
      if(isTipoString(control.tipo)){
        //El temporal trae el puntero donde inicia la cadena
        const lbl_inicial = Etiqueta.getSiguiente();
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();

        const contador = Temporal.getSiguiente();
        Codigo3D.add(`${contador} = 0; //Contador inicial "length"`);

        const puntero = Temporal.getSiguiente();
        Codigo3D.add(`${puntero} = ${control.temporal}; //Puntero hacia la cadena`);
        //Si el puntero es -1 es porque es una cadena null
        Codigo3D.add(`if(${puntero} == -1) goto ${lbl_false};`);

        //Si llega aqui es porque el puntero es una posicion valida
        const char = Temporal.getSiguiente();
        Codigo3D.add(`${lbl_inicial}:`);
        Codigo3D.add(`${char} = Heap[(int)${puntero}];`);
        Codigo3D.add(`if(${char} != -1) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);
        Codigo3D.add(`${lbl_true}:`);
        Codigo3D.add(`${contador} = ${contador} + 1;`);
        Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        Codigo3D.add(`goto ${lbl_inicial};`);

        Codigo3D.add(`${lbl_false}:`);

        //GUARDO EL TEMPORAL
        ControlFuncion.guardarTemporal(contador);
        return new Control({temporal: contador, tipo: TIPO_DATO.INT});
      }
      //Si es tipo ARRAY
      else if(isTipoArray(control.tipo)){
        //TODO: implementar
      }
    }
  }

}
