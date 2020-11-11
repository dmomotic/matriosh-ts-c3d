import { getNombreDeTipo, isTipoArray, TIPO_DATO } from "./tipos";
import { Variable } from "./variable";

export class Funcion {
  id: string;
  parametros: Variable[];
  tamaño: number;
  tipo: TIPO_DATO;
  referencia: string;
  tipo_de_arreglo: TIPO_DATO;
  dimensiones: number[];

  public toString() : string{
    const parametros = this.parametros != null ? this.parametros.length : 0;
    let salida = `Funcion: ${this.id} - Tipo: ${getNombreDeTipo(this.tipo)} - Parametros: ${parametros} - Return Asignado: ${this.hasReturn()?'Si':'No'}`;
    return salida;
  }

  constructor({id, parametros = [], tamaño = 1, tipo = TIPO_DATO.VOID, referencia = null, tipo_de_arreglo = null, dimensiones = []} : {id: string, parametros: Variable[], tamaño?: number, tipo?: TIPO_DATO, referencia?: string, tipo_de_arreglo?: TIPO_DATO, dimensiones?: number[]}){
    Object.assign(this, {id, parametros, tamaño, tipo, referencia, tipo_de_arreglo, dimensiones});
  }

  getParametro(index: number) : Variable {
    return this.parametros[index];
  }

  hasParametro(id: string) : boolean{
    return this.parametros.some(item => item.id == id);
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
