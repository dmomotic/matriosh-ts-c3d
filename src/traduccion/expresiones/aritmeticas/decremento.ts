import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Decremento extends NodoAST{
  linea: string;
  id: string;
  instruccion: boolean;

  constructor(linea: string, id: string, instruccion: boolean = false){
    super(linea);
    Object.assign(this, {id, instruccion});
  }

  traducir(ts: TablaSimbolos) {
    /******************************
     * ACCESO SIMPLE DEL TIPO: id--
     ******************************/
    const variable = ts.getVariable(this.id);

    if(!variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible encontra la variable ${this.id} para la operación --`}));
      return;
    }

    if(!variable.isReasignable()){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} es de tipo CONSTANTE`}));
      return;
    }

    if(!variable.isNumeric()){
      Errores.push(new Error({tipo: 'sematico', linea: this.linea, descripcion: `La variable ${this.id} no es de tipo number`}));
      return;
    }

    const posicion = Temporal.getSiguiente();
    const valor = Temporal.getSiguiente();
    const incremento = Temporal.getSiguiente();

    //Si es una variable global
    if(variable.isGlobal()){
      Codigo3D.add(`${posicion} = ${variable.posicion};`);
      Codigo3D.add(`${valor} = Heap[(int) ${posicion}];`);
      Codigo3D.add(`${incremento} = ${valor} - 1;`);
      Codigo3D.add(`Heap[(int)${posicion}] = ${incremento};`);
    }
    //Si es una variable local
    else{
      Codigo3D.add(`${posicion} = P + ${variable.posicion};`);
      Codigo3D.add(`${valor} = Stack[(int) ${posicion}];`);
      Codigo3D.add(`${incremento} = ${valor} - 1;`);
      Codigo3D.add(`Stack[(int)${posicion}] = ${incremento};`);
    }

    //Solo si es una expresion
    if(!this.instruccion){
      //GUARDO EL TEMPORAL
      ControlFuncion.guardarTemporal(incremento);
      return new Control({temporal: valor, tipo: variable.tipo});
    }
  }

}
