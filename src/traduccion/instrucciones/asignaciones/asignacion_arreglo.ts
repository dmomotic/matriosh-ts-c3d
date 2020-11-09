import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class AsignacionArreglo extends NodoAST {
  linea: string;
  asignacion: NodoAST;
  tipo_igual: string;
  exp: NodoAST;

  constructor(linea: string, asignacion: NodoAST, tipo_igual: string, exp: NodoAST){
    super(linea);
    Object.assign(this, {asignacion, tipo_igual, exp});
  }

  traducir(ts: TablaSimbolos) {
    const control : Control = this.asignacion.traducir(ts);
    if(!control){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la asignacion del arreglo`}));
      return;
    }
    if(!control.hasPosicion()){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal durante la asignacion del arreglo`}));
      return;
    }

    if(this.tipo_igual = '='){
      const control_exp : Control = this.exp.traducir(ts);
      if(!control_exp){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posibre traducir la expresion para la asignacion del array`}));
        return;
      }
      //REMUEVO EL TEMPORAL
      ControlFuncion.removerTemporal(control_exp.temporal);

      Codigo3D.add(`Heap[(int)${control.posicion}] = ${control_exp.temporal};`);
    }
  }

}
