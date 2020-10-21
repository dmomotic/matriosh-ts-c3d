import { NodoAST } from "../generales/nodoAST";

export class If{
  condicion: NodoAST;
  instrucciones: NodoAST[];

  constructor(condicion: NodoAST, instrucciones: NodoAST[]){
    Object.assign(this, {condicion, instrucciones});
  }

  isElse() : boolean{
    return this.condicion == null;
  }
}
