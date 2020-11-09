import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";

export class AccesoArreglo extends NodoAST {
  linea: string;
  id: string;
  lista_exps: NodoAST[];

  constructor(linea: string, id: string, lista_exps: NodoAST[]){
    super(linea);
    Object.assign(this, {id, lista_exps});
  }

  traducir(ts: TablaSimbolos) {

  }

}
