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
        Codigo3D.addComentario('Lectura de number');
        Codigo3D.add(`${temporal} = ${this.valor};`);
        return new Control({temporal, tipo: this.tipo});
      case TIPO_DATO.INT:
        Codigo3D.addComentario('Lectura de int');
        Codigo3D.add(`${temporal} = ${this.valor};`);
        return new Control({temporal, tipo: this.tipo});
      case TIPO_DATO.FLOAT:
        Codigo3D.addComentario('Lectura de float');
        Codigo3D.add(`${temporal} = ${this.valor};`);
        return new Control({temporal, tipo: this.tipo});
      case TIPO_DATO.STRING:
        Codigo3D.addComentario('Lectura de String');
        //Capturo la posicion libre del Heap
        Codigo3D.add(`${temporal} = H; //Punto donde inicia la cadena`);
        //Lleno las posiciones correspondientes
        for(let i = 0; i < this.valor.length; i++){
          let ascii = this.valor.charCodeAt(i);
          Codigo3D.add(`Heap[(int)H] = ${ascii};`);
          Codigo3D.add(`H = H + 1;`);
        }
        //Asigno caracter de escape
        Codigo3D.add(`Heap[(int)H] = -1;`);
        Codigo3D.add(`H = H + 1;`);
        return new Control({temporal, tipo: this.tipo});
    }

  }
}
