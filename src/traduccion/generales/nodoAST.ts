import { TablaSimbolos } from './tablaSimbolos';

export abstract class NodoAST{
  constructor(linea: string){
    Object.assign(this, {linea: +linea});
  }

  abstract traducir(ts: TablaSimbolos) : any;
}
