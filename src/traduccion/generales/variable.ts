import { TIPO_DATO } from "./tipos";

export class Variable {
  id: string;
  tipo: TIPO_DATO;
  global: boolean;
  referencia: string; //refencia del struct (un array puede tener una referencia a struct)
  tipo_de_arreglo: TIPO_DATO; //utilizado solo en los arreglos para saber que tipo de datos va a manipular
  inicializado: boolean;
  reasignable: boolean;
  tamaño: number;
  posicion: number;

  constructor({id, tipo, reasignable, posicion, inicializado = false, tamaño = 1,  global = false, referencia = null, tipo_de_arreglo = null}){
    Object.assign(this,id,tipo_de_arreglo);
  }

}
