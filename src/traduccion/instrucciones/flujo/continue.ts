import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { ControlFuncion } from "../../utils/control_funcion";

export class Continue extends NodoAST{
  linea: string;

  constructor(linea: string){
    super(linea);
  }

  traducir(ts: TablaSimbolos) {
    if(ControlFuncion.getDisplayLength() <= 0){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La instruccion CONTINUE no se encuentra en un ambito valido`}));
      return;
    }

    const disp = ControlFuncion.popDisplay();

    if(!disp.valido){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La instruccion CONTINUE no esta dentro de una instruccion valida`}));
      return;
    }

    const salto = disp.salto_continue;

    if(!salto){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener el destino de la instruccion CONTINUE`}));
      ControlFuncion.pushDisplay(disp);
      return;
    }

    Codigo3D.addComentario(`Instruccion CONTINUE`);
    Codigo3D.add(`goto ${salto};`);

    //Guardo display
    ControlFuncion.pushDisplay(disp);
  }

}
