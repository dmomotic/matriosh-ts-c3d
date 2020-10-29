import { TIPO_DATO } from "./tipos";
import { Variable } from "./variable";

export class Funcion {
  id: string;
  parametros: Variable[];
  tamaño: number;
  tipo: TIPO_DATO;
  referencia: string;
  tipo_de_arreglo: TIPO_DATO;
  dimensiones: number[];

  constructor({id, parametros = [], tamaño = 1, tipo = TIPO_DATO.VOID, referencia = null, tipo_de_arreglo = null, dimensiones = []} : {id: string, parametros: Variable[], tamaño?: number, tipo?: TIPO_DATO, referencia?: string, tipo_de_arreglo?: TIPO_DATO, dimensiones?: number[]}){
    Object.assign(this, {id, parametros, tamaño, tipo, referencia, tipo_de_arreglo, dimensiones});
  }

  getParametro(index: number) : Variable {
    return this.parametros[index];
  }

  hasParametros() : boolean {
    return this.parametros.length > 0;
  }

  hasReturn() : boolean {
    return this.tipo != TIPO_DATO.VOID;
  }

  hasReferencia() : boolean {
    return this.referencia != null;
  }

  hasTipoDeArreglo() : boolean {
    return this.tipo_de_arreglo != null;
  }

  hasDimensiones() : boolean {
    return this.dimensiones.length > 0;
  }

  getTamaño() : number {
    return this.tamaño;
  }
}
