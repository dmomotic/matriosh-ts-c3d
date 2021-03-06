import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";
import { Display } from "../../utils/display";

export class ForIn extends NodoAST {
  linea: string;
  id: string;
  declaracion: NodoAST;
  arr: NodoAST;
  instrucciones: NodoAST[];

  constructor(linea: string, id: string, declaracion: NodoAST, arr: NodoAST, instrucciones: NodoAST[]){
    super(linea);
    Object.assign(this, {id, declaracion, arr, instrucciones});
  }

  calcularTamaño(): void {
    this.declaracion.calcularTamaño();
    for(const inst of this.instrucciones){
      inst.calcularTamaño();
    }
  }

  traducir(ts: TablaSimbolos) {

    Codigo3D.addComentario(`Traduccion FOR_IN`);
    const ts_local = new TablaSimbolos(ts);
    //Traduccion declaracion
    this.declaracion.traducir(ts_local);
    const lbl_ciclo = Etiqueta.getSiguiente();
    const lbl_modificacion = Etiqueta.getSiguiente();
    //Display del ciclo
    ControlFuncion.pushDisplay(new Display([], lbl_modificacion, true));

    const variable = ts_local.getVariable(this.id);

    if(!variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable ${this.id} en la instruccion FOR_IN`}));
      return;
    }

    const posicion_iterador = Temporal.getSiguiente();

    //Si es global
    if(variable.isGlobal()){
      Codigo3D.add(`${posicion_iterador} = ${variable.posicion};`);
    }
    //Si no es global
    else{
      Codigo3D.add(`${posicion_iterador} = P + ${variable.posicion};`);
    }
    //Posicion inicial del arreglo
    const pos_inicial_arreglo = Temporal.getSiguiente();
    const control_arr : Control= this.arr.traducir(ts_local);
    if(!control_arr){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el arreglo solicitado en el FOR_IN`}));
      return;
    }
    //Remuevo el temporal
    ControlFuncion.removerTemporal(control_arr.temporal);
    //console.log('si llega');
    Codigo3D.add(`${pos_inicial_arreglo} = ${control_arr.temporal};`);
    //Capturo el tamaño del arreglo
    const aux_tam = Temporal.getSiguiente();
    const tamaño = Temporal.getSiguiente();
    Codigo3D.add(`${aux_tam} = ${pos_inicial_arreglo} - 1;`);
    Codigo3D.add(`${tamaño} = Heap[(int)${aux_tam}];`);

    const val_iterador = Temporal.getSiguiente();

    const lbl_true = Etiqueta.getSiguiente();
    const lbl_false = Etiqueta.getSiguiente();

    Codigo3D.add(`${lbl_ciclo}:`);
    if(variable.isGlobal()){
      Codigo3D.add(`${val_iterador} = Heap[(int)${posicion_iterador}];`);
    }else{
      Codigo3D.add(`${val_iterador} = Stack[(int)${posicion_iterador}];`);
    }
    Codigo3D.add(`if(${val_iterador} < ${tamaño}) goto ${lbl_true};`);
    Codigo3D.add(`goto ${lbl_false};`);
    Codigo3D.add(`${lbl_true}:`);
    for(const inst of this.instrucciones){
      inst.traducir(ts_local);
    }
    const new_val = Temporal.getSiguiente();
    Codigo3D.add(`${lbl_modificacion}:`);
    //Calculo el nuevo valor del iterador
    Codigo3D.add(`${new_val} = ${val_iterador} + 1;`);
    //Asigno el nuevo valor del iterador
    if(variable.isGlobal()){
      Codigo3D.add(`Heap[(int)${posicion_iterador}] = ${new_val};`);
    }else{
      Codigo3D.add(`Stack[(int)${posicion_iterador}] = ${new_val};`);
    }
    Codigo3D.add(`goto ${lbl_ciclo};`);
    Codigo3D.add(`${lbl_false}:`);
    //Agregado por el break
    const display = ControlFuncion.popDisplay();
    if(!display) return;
    for(const br of display.breaks){
      Codigo3D.add(`${br}:`);
    }
    Codigo3D.addComentario(`Fin intruccion FOR_IN`);
  }

}
