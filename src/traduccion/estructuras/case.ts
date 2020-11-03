import { NodoAST } from "../generales/nodoAST";

export class Case{
  exp: NodoAST;
  instrucciones: NodoAST[];
  is_default: boolean;

  constructor(exp: NodoAST, instrucciones: NodoAST[], is_default: boolean = false){
    Object.assign(this, {exp, instrucciones, is_default});
  }

  isDefault() : boolean {
    return this.is_default;
  }
}
