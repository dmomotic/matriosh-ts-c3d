import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Case } from "../../estructuras/case";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { getNombreDeTipo, isTipoBoolean, isTipoNumber } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";
import { Display } from "../../utils/display";

export class Switch extends NodoAST {
  linea: string;
  exp: NodoAST;
  cases: Case[];

  constructor(linea: string, exp: NodoAST, cases: Case[]){
    super(linea);
    Object.assign(this, {linea, exp, cases});
  }

  calcularTamaño() : void{
    for(const c of this.cases){
      for(const inst of c.instrucciones){
        inst.calcularTamaño();
      }
    }
  }

  traducir(ts: TablaSimbolos) {
    const control : Control = this.exp.traducir(ts);
    if(!control){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el objeto de tipo control de la expresión en la instruccion SWITCH`}));
      return;
    }
    //Si no es tipo boolean y tampoco es tipo number es un error
    if(!isTipoBoolean(control.tipo) && !isTipoNumber(control.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se permiten instrucciones del tipo ${getNombreDeTipo(control.tipo)} en la instruccion SWITCH`}));
      return;
    }

    Codigo3D.addComentario(`Traduccion instruccion SWITCH`);

    const ts_local = new TablaSimbolos(ts);
    let lbl_revision = Etiqueta.getSiguiente();
    //Creo un Display para toda la instruccion
    ControlFuncion.pushDisplay(new Display([], "", false));

    for(const caso of this.cases){
      //Si es un case
      if(!caso.isDefault()){
        Codigo3D.addComentario(`Traduccion instruccion CASE`);
        const control_case : Control = caso.exp.traducir(ts_local);
        //Compruebo que el tipo del control de case sea del mismo tipo que el switch
        if(control.tipo != control_case.tipo){
          Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `El tipo del case (${getNombreDeTipo(control_case.tipo)}) es diferente al tipo del switch (${getNombreDeTipo(control.tipo)})`}));
          return;
        }
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();
        Codigo3D.add(`if(${control.temporal} == ${control_case.temporal}) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);
        //Remuevo el temporal
        ControlFuncion.removerTemporal(control_case.temporal);
        //Destino del siguiente cuando no hay break
        Codigo3D.add(`${lbl_revision}:`);
        Codigo3D.add(`${lbl_true}:`);
        //Instrucciones del case
        caso.instrucciones.forEach((instruccion : NodoAST) => {
          instruccion.traducir(ts_local);
        });
        //Si no hay break, salto al siguiente case
        lbl_revision = Etiqueta.getSiguiente();
        Codigo3D.add(`goto ${lbl_revision};`);
        Codigo3D.add(`${lbl_false}:`);
      }
      //Si es un default
      else {
        Codigo3D.addComentario(`Traduccion instruccion DEFAULT`);
        caso.instrucciones.forEach((instruccion : NodoAST) => {
          instruccion.traducir(ts_local);
        });
      }
    }

    //Remuevo el temporal del switch (aunque creo que no lo guardo porque no se si es necesario o no)
    ControlFuncion.removerTemporal(control.temporal);
    //Imprimo los breaks
    const disp = ControlFuncion.popDisplay();
    if(disp){
      for(const lbl of disp.breaks){
        Codigo3D.add(`${lbl}:`);
      }
    }
    Codigo3D.add(`${lbl_revision}:`);
  }

}
