import { TIPO_DATO } from "../generales/tipos";

export class Control{
  temporal: string;
  tipo: TIPO_DATO;
  referencia: string;
  verdaderas: string[];
  falsas: string[];
  tipo_de_arreglo: TIPO_DATO;

  constructor({temporal = null, tipo = null, referencia = null, verdaderas = [], falsas = [], tipo_de_arreglo = null}: {temporal?: string, tipo?: TIPO_DATO, referencia?: string, verdaderas?: string[], falsas?: string[], tipo_de_arreglo?: TIPO_DATO}){
    Object.assign(this, {temporal, tipo, referencia, verdaderas, falsas, tipo_de_arreglo});
  }

  hasTemporal(): boolean{
    return this.temporal != null && this.temporal.trim().length > 0;
  }

  hasEtiquetas(): boolean{
    return this.verdaderas.length > 0 || this.falsas.length > 0;
  }

  hasReferencia(): boolean{
    return this.referencia != null;
  }

  deboAsignarValorPorDefectoAlArray(): boolean {
    return this.tipo == TIPO_DATO.ARRAY && this.tipo_de_arreglo == null;
  }
}
