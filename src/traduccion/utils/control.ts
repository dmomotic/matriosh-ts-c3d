import { TIPO_DATO } from "../generales/tipos";

export class Control{
  temporal: string;
  tipo: TIPO_DATO;
  referencia: string;
  verdaderas: string[];
  falsas: string[];

  constructor({temporal = null, tipo = null, referencia = null, verdaderas = [], falsas = []}: {temporal?: string, tipo?: TIPO_DATO, referencia?: string, verdaderas?: string[], falsas?: string[]}){
    Object.assign(this, {temporal, tipo, referencia, verdaderas, falsas});
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
}
