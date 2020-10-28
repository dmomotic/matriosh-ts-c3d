import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class LlamadaFuncion extends NodoAST{
  linea: string;
  id: string;
  argumentos: NodoAST[];

  constructor(linea: string, id: string, argumentos: NodoAST[] = []){
    super(linea);
    Object.assign(this, {id, argumentos});
  }

  traducir(ts: TablaSimbolos) {
    const controles: Control[] = [];
    //Guardo temporales no utilizados antes de la llamada
    Codigo3D.addComentario(`GUARDANDO TEMPORALES SIN UTILIZAR`);
    for(const t of ControlFuncion.getTemporales()){

    }
  }

}
