import { Funcion } from "./funcion";
import { Variable } from "./variable";

export class TablaSimbolos{
  padre: TablaSimbolos;
  variables: Map<string, Variable>;
  funciones: Map<string, Funcion>;

  constructor(padre: TablaSimbolos = null){
    this.variables = new Map();
    this.funciones = new Map();
    this.padre = padre;
  }

  setVariable(variable: Variable) : void{
    if(this.esGlobal()){
      variable.setAsGlobal();
    }
    this.variables.set(variable.id, variable);
  }

  getVariable(id: string) : Variable{
    for(let ts : TablaSimbolos = this; ts != null; ts = ts.padre){
      const variable = ts.variables.get(id);
      if(variable) return variable;
    }
    return null;
  }

  setFuncion(funcion: Funcion) : void{
    const ts = this.getGlobal();
    ts.funciones.set(funcion.id, funcion);
  }

  getFuncion(id: string) : Funcion{
    const ts = this.getGlobal();
    return ts.funciones.get(id);
  }

  getGlobal() : TablaSimbolos{
    for(let ts : TablaSimbolos = this; ts != null; ts = ts.padre){
      if(!ts.padre) return ts;
    }
  }

  esGlobal(){
    return this.padre == null;
  }

}
