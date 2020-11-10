import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Heap } from "../../estructuras/heap";
import { Stack } from "../../estructuras/stack";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoArray, isTipoBoolean, isTipoNumber, isTipoString, isTipoType, TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
import { Tamaño } from "../../utils/tamaño";

export class DecIdTipo extends NodoAST {
  linea: string;
  reasignable: boolean;
  id: string;
  tipo: TIPO_DATO;
  type_generador: string;

  constructor(linea: string, reasignable: boolean, id: string, tipo: TIPO_DATO, type_generador: string){
    super(linea);
    Object.assign(this, {reasignable, id, tipo, type_generador});
  }

  calcularTamaño() : void {
    Tamaño.aumentar();
  }

  traducir(ts: TablaSimbolos) {
    //Busco en tabla de simbolos
    let variable = ts.getVariable(this.id);
    //Si la variable ya existe es un error
    if(variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una variable con el id: ${this.id} en este ambito`}));
      return;
    }

    //Si es const es un error ya que las varaibles cons deben tener un tipo asignado
    if(!this.reasignable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} es de tipo CONST por lo que debe tener un valor asignado`}));
      return;
    }

    Codigo3D.addComentario(`Declaracion de id: ${this.id} tipo ${getNombreDeTipo(this.tipo)}`);

    const temp_pos = Temporal.getSiguiente();
    const val_defecto = Temporal.getSiguiente();

    //Valores por defecto
    if(isTipoNumber(this.tipo) || isTipoBoolean(this.tipo)){
      Codigo3D.add(`${val_defecto} = 0;`);
    }
    else if(isTipoString(this.tipo) || isTipoType(this.tipo) || isTipoArray(this.tipo)){
      Codigo3D.add(`${val_defecto} = -1;`);
    }

    //Si es una declaracion global
    if(ts.esGlobal()){
      const pos = Heap.getSiguiente();
      Codigo3D.add(`${temp_pos} = ${pos};`);
      Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${val_defecto};`);
      variable = new Variable({id: this.id, tipo: this.tipo, reasignable: this.reasignable, posicion: pos, inicializado: false, global: true});
    }
    //Si no es una declaracion global
    else {
      const pos = Stack.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = P + ${pos};`);
      Codigo3D.add(`Stack[(int)${temp_pos}] = ${val_defecto};`);
      variable = new Variable({id: this.id, tipo: this.tipo, reasignable: this.reasignable, posicion: pos, inicializado: false, global: false});
    }
    ts.setVariable(variable);
  }

}
