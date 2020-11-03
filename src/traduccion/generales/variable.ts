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

  constructor({ id, tipo, reasignable, posicion = -1, inicializado = false, tamaño = 1, global = false, referencia = null, tipo_de_arreglo = null }: { id: string, tipo: TIPO_DATO, reasignable: boolean, posicion?: number, inicializado?: boolean, tamaño?: number, global?: boolean, referencia?: string, tipo_de_arreglo?: TIPO_DATO }) {
    Object.assign(this, {id, tipo, reasignable, posicion, inicializado, tamaño, global, referencia, tipo_de_arreglo});
  }

  setAsGlobal(): void {
    this.global = true;
  }

  isGlobal(): boolean {
    return this.global;
  }

  isArray(): boolean {
    return this.tipo == TIPO_DATO.ARRAY;
  }

  isType(): boolean {
    return this.tipo == TIPO_DATO.TYPE;
  }

  isPrimitivo(): boolean {
    return this.tipo == TIPO_DATO.NUMBER || this.tipo == TIPO_DATO.STRING || this.tipo == TIPO_DATO.BOOLEAN || this.tipo == TIPO_DATO.INT || this.tipo == TIPO_DATO.FLOAT;
  }

  isString() : boolean{
    return this.tipo === TIPO_DATO.STRING;
  }

  isNumeric(): boolean{
    return this.tipo === TIPO_DATO.INT || this.tipo === TIPO_DATO.FLOAT || this.tipo == TIPO_DATO.NUMBER;
  }

  isBoolean(): boolean{
    return this.tipo === TIPO_DATO.BOOLEAN;
  }

  isReasignable() : boolean {
    return this.reasignable;
  }
}
