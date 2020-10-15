import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";

export class Primitivo extends NodoAST{
  linea: string;
  valor: string;
  tipo: TIPO_DATO;

  constructor(linea: string, valor: string, tipo: TIPO_DATO){
    super(linea);
    Object.assign(this, {valor, tipo});
  }

  traducir(ts: TablaSimbolos) {
    const temporal = Temporal.getSiguiente();
    switch(this.tipo){
      case TIPO_DATO.NUMBER:
        Codigo3D.addComentario('Lectura de primitivo');
        Codigo3D.add(`${temporal} = ${this.valor};`);
        return new Control({temporal, tipo: this.tipo});
    }
  }
}
