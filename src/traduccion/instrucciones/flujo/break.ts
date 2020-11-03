import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { ControlFuncion } from "../../utils/control_funcion";

export class Break extends NodoAST {
  linea: string;

  constructor(linea: string){
    super(linea);
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`Inicio Instruccion BREAK`);
    //Valido que la instruccion este dentro de un ciclo valido
    if(ControlFuncion.getDisplayLength() <= 0){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La instruccion BREAK no esta en un entorno valido`}));
      return;
    }
    //Capturo el display actual
    const display = ControlFuncion.popDisplay();
    const salto_break = Etiqueta.getSiguiente();
    Codigo3D.add(`goto ${salto_break};`);
    Codigo3D.addComentario(`Fin Instruccion BREAK`);

    //Guardo el salto del break y el display
    if(display){
      display.breaks.push(salto_break);
      ControlFuncion.pushDisplay(display);
    }
  }

}
