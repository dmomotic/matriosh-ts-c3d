import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { isTipoBoolean } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";
import { Display } from "../../utils/display";

export class For extends NodoAST {
  linea: string;
  init: NodoAST;
  condicion: NodoAST;
  modificacion: NodoAST;
  instrucciones: NodoAST[];

  constructor(linea: string, init: NodoAST, condicion: NodoAST, modificacion: NodoAST, instrucciones: NodoAST[]){
    super(linea);
    Object.assign(this, {init, condicion, modificacion, instrucciones});
  }

  calcularTamaño(): void {
    for(const inst of this.instrucciones){
      inst.calcularTamaño();
    }
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`Traduccion instruccion FOR`);
    const ts_local = new TablaSimbolos(ts);
    //Traduccion de la sentencia inicial del FOR
    this.init.traducir(ts_local);
    const lbl_ciclo = Etiqueta.getSiguiente();
    //Display del ciclo
    ControlFuncion.pushDisplay(new Display([], lbl_ciclo, true));
    Codigo3D.add(`${lbl_ciclo}:`);

    const control_for : Control = this.condicion.traducir(ts_local);
    if(!control_for){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condiciòn del ciclo FOR`}));
      return;
    }
    if(!isTipoBoolean(control_for.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La condicion del ciclo FOR debe ser de tipo BOOLEAN`}));
      return;
    }

    //Si trae etiquetas
    if(control_for.hasEtiquetas()){
      //Imprimo etiquetas verdaderas
      for(const lbl of control_for.verdaderas){
        Codigo3D.add(`${lbl}:`);
      }
      //Traduzco las instrucciones
      for(const inst of this.instrucciones){
        inst.traducir(ts_local);
      }
      this.modificacion.traducir(ts_local);
      Codigo3D.add(`goto ${lbl_ciclo};`);
      //Imprimo las etiquetas falsas
      for(const lbl of control_for.falsas){
        Codigo3D.add(`${lbl}:`);
      }
    }
    //Si no trae etiquetas
    else {
      //Es un temporal true o false
      const lbl_true = Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      //Remuevo el temporal
      ControlFuncion.removerTemporal(control_for.temporal);
      Codigo3D.add(`if(${control_for.temporal} == 1) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);
      Codigo3D.add(`${lbl_true}:`);
      for(const inst of this.instrucciones){
        inst.traducir(ts_local);
      }
      this.modificacion.traducir(ts_local);
      Codigo3D.add(`goto ${lbl_ciclo};`);
      Codigo3D.add(`${lbl_false}:`);
    }

    Codigo3D.addComentario(`Fin instruccion FOR`);
  }

}
