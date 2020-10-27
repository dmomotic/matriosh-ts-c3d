import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

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

    //GUARDO EL TEMPORAL
    ControlFuncion.guardarTemporal(temporal);

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
          //Si es una linea nueva \n
          if(this.valor.charAt(i) == '\\' && i + 1 < this.valor.length && this.valor.charAt(i+1) == 'n'){
            Codigo3D.add(`Heap[(int)H] = ${10};`);
            Codigo3D.add(`H = H + 1;`);
            i++;
          }
          else{
            let ascii = this.valor.charCodeAt(i);
            Codigo3D.add(`Heap[(int)H] = ${ascii};`);
            Codigo3D.add(`H = H + 1;`);
          }
        }
        //Asigno caracter de escape
        Codigo3D.add(`Heap[(int)H] = -1;`);
        Codigo3D.add(`H = H + 1;`);
        return new Control({temporal, tipo: this.tipo});
      case TIPO_DATO.BOOLEAN:
        Codigo3D.addComentario('Lectura de boolean');
        Codigo3D.add(`${temporal} = ${this.valor};`);
        return new Control({temporal, tipo: this.tipo});
      case TIPO_DATO.NULL:
        Codigo3D.addComentario(`Lectura de null`);
        Codigo3D.add(`${temporal} = -1 ;`);
        return new Control({temporal, tipo: this.tipo});
    }
  }
}
