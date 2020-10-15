import { Variable } from "./variable";

export class TablaSimbolos{
  padre: TablaSimbolos;
  variables: Map<String, Variable>;

  constructor(padre: TablaSimbolos = null){
    this.variables = new Map();
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

  esGlobal(){
    return this.padre == null;
  }

}
