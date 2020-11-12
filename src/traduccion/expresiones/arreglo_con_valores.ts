import { Codigo3D } from "../generales/codigo3D";
import { Etiqueta } from "../generales/etiqueta";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class ArregloConValores extends NodoAST {

  linea: string;
  exps: NodoAST[];

  constructor(linea: string, exps: NodoAST[]){
    super(linea);
    Object.assign(this, {exps});
  }

  traducir(ts: TablaSimbolos) {
    //Posicion que contendrá el tamaño del arreglo
    const pos_tamaño = Temporal.getSiguiente();
    Codigo3D.add(`${pos_tamaño} = H;`);
    const tamaño = this.exps.length;
    Codigo3D.add(`Heap[(int)H] = ${tamaño};`);
    Codigo3D.add(`H = H + 1;`);
    //Posicion donde inicia el arreglo
    const posicion = Temporal.getSiguiente();
    Codigo3D.add(`${posicion} = H;`);
    //Iterador
    const iterador = Temporal.getSiguiente();
    Codigo3D.add(`${iterador} = 0;`);
    //Reservo las posiciones
    const lbl_ciclo = Etiqueta.getSiguiente();
    const lbl_true = Etiqueta.getSiguiente();
    const lbl_false = Etiqueta.getSiguiente();
    Codigo3D.add(`${lbl_ciclo}:`);
    Codigo3D.add(`if(${iterador} < ${tamaño}) goto ${lbl_true};`);
    Codigo3D.add(`goto ${lbl_false};`);
    Codigo3D.add(`${lbl_true}:`);
    Codigo3D.add(`H = H + 1;`);
    Codigo3D.add(`${iterador} = ${iterador} + 1;`);
    Codigo3D.add(`goto ${lbl_ciclo};`);
    Codigo3D.add(`${lbl_false}:`);
    //Voy a asignar un -1 al final solo por si acaso aunque creo que no es necesario por la forma en que lo programe
    Codigo3D.add(`Heap[(int)H] = -1;`);
    Codigo3D.add(`H = H + 1;`);
    //Aqui debo traducir las expresiones y asignarlas al arreglo
    const controles: Control[] = [];
    for(const exp of this.exps){
      const control : Control = exp.traducir(ts);
      ControlFuncion.removerTemporal(control.temporal);
      controles.push(control);
    }

    const tipo = controles[0].tipo;

    const pos = Temporal.getSiguiente();
    Codigo3D.add(`${iterador} = 0;`);
    for(const control of controles){
      Codigo3D.add(`${pos} = ${posicion} + ${iterador};`);
      Codigo3D.add(`Heap[(int)${pos}] = ${control.temporal};`);
      Codigo3D.add(`${iterador} = ${iterador} + 1;`);
    }

    //Guardo el temporal
    ControlFuncion.guardarTemporal(posicion);
    return new Control({ temporal: posicion, tipo: TIPO_DATO.ARRAY, tipo_de_arreglo: tipo});
  }

}
