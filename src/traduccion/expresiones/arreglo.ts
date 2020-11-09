import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { Etiqueta } from "../generales/etiqueta";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { isTipoNumber, TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class Arreglo extends NodoAST {
  linea: string;
  tamaño: NodoAST;

  constructor(linea: string, tamaño: NodoAST){
    super(linea);
    Object.assign(this, {tamaño});
  }

  traducir(ts: TablaSimbolos) {
    const control: Control = this.tamaño.traducir(ts);
    if(!control){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir el tamaño del Arreglo`}));
      return;
    }
    if(!isTipoNumber(control.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La expresion new Array solo acepta numeros como parametros`}));
      return;
    }

    //Temporal para asegurar que voy a trabajar con un entero
    const tamaño = Temporal.getSiguiente();
    Codigo3D.add(`${tamaño} = (int) ${control.temporal};`);
    //Guardare en la primera posicion el tamaño del arreglo
    Codigo3D.add(`Heap[(int)H] = ${tamaño};`);
    Codigo3D.add(`H = H + 1;`);
    //Posicion donde iniciará el arreglo
    const posicion_inicial = Temporal.getSiguiente();
    Codigo3D.add(`${posicion_inicial} = H;`);
    //Contador para poder reservar espacio en memoria
    const contador = Temporal.getSiguiente();
    Codigo3D.add(`${contador} = 0;`);
    //Ciclo para reservar espacios en memoria
    const lbl_ciclo = Etiqueta.getSiguiente();
    const lbl_true = Etiqueta.getSiguiente();
    const lbl_false = Etiqueta.getSiguiente();
    Codigo3D.add(`${lbl_ciclo}:`);
    Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
    Codigo3D.add(`goto ${lbl_false};`);
    Codigo3D.add(`${lbl_true}:`);
    Codigo3D.add(`H = H + 1;`);
    Codigo3D.add(`${contador} = ${contador} + 1;`);
    Codigo3D.add(`goto ${lbl_ciclo};`);
    Codigo3D.add(`${lbl_false}:`);

    //Guardo el temporal
    ControlFuncion.guardarTemporal(posicion_inicial);

    return new Control({temporal: posicion_inicial, tipo: TIPO_DATO.ARRAY});
  }

}
