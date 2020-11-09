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

export class DoWhile extends NodoAST{
  linea: string;
  condicion: NodoAST;
  instrucciones: NodoAST[];

  constructor(linea: string, condicion: NodoAST, instrucciones: NodoAST[]){
    super(linea);
    Object.assign(this, {condicion, instrucciones});
  }

  calcularTamaño(): void {
    for(const inst of this.instrucciones){
      inst.calcularTamaño();
    }
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`Traduccion DO_WHILE`);
    const lbl_ciclo = Etiqueta.getSiguiente();

    //Registramos el ciclo nuevo en el DISPLAY
    ControlFuncion.pushDisplay(new Display([], lbl_ciclo, true));

    Codigo3D.add(`${lbl_ciclo}:`);
    //Ejecutamos las instrucciones
    const ts_local = new TablaSimbolos(ts);
    for(const inst of this.instrucciones){
      inst.traducir(ts_local);
    }

    //Evaluamos la condición
    const control : Control = this.condicion.traducir(ts);

    if(!control){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condición del DO_WHILE`}));
      return;
    }
    if(!isTipoBoolean(control.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La expresión en el DO_WHILE no es de tipo BOOLEAN`}));
      return;
    }

    //Si el control trae etiquetas
    if(control.hasEtiquetas()){
      //Imprimo etiquetas verdades
      for(const etiqueta of control.verdaderas){
        Codigo3D.add(`${etiqueta}:`);
      }
      Codigo3D.add(`goto ${lbl_ciclo};`);
      //Imprimo etiquetas falsas
      for(const etiqueta of control.falsas){
        Codigo3D.add(`${etiqueta}:`);
      }
    }
    //Si no trae etiquetas
    else{
      const lbl_false = Etiqueta.getSiguiente();
      //REMUEVO TEMPORAL
      ControlFuncion.removerTemporal(control.temporal);
      Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_ciclo};`);
      Codigo3D.add(`goto ${lbl_false};`);
      Codigo3D.add(`${lbl_false}:`);
    }
    const display = ControlFuncion.popDisplay();
    if(!display) return;
    for(const br of display.breaks){
      Codigo3D.add(`${br}:`);
    }
  }

}
