import { lastIndexOf } from "lodash";
import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoArray, isTipoBoolean, isTipoNull, isTipoNumber, isTipoString, isTipoType, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class AsignacionId extends NodoAST{
  linea: string;
  id: string;
  tipo_igual: string;
  exp: NodoAST;

  constructor(linea: string, id: string, tipo_igual: string, exp: NodoAST){
    super(linea);
    Object.assign(this, {id, tipo_igual, exp});
  }

  traducir(ts: TablaSimbolos) {
    const variable = ts.getVariable(this.id);
    //Validaciones
    if(!variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se encontro ninguna variable con el id ${this.id} para realizar la asignación`}));
      return;
    }

    if(!variable.isReasignable()){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La variable con id ${this.id} no puede cambiar de valor ya que es constante`}));
      return;
    }

    if(!this.exp){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se obtuvo ninguna expresion valida para la asignacion de la variable ${this.id}`}));
      return;
    }

    const control: Control = this.exp.traducir(ts);

    if(!control){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la expresion para la asignacion de la variable ${this.id}`}));
      return;
    }

    //Compruebo los tipos
    if(!this.validarTipos(variable.tipo, control.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se puede asignar un tipo ${getNombreDeTipo(control.tipo)} a la variable ${this.id} de tipo ${getNombreDeTipo(variable.tipo)}`}));
      return;
    }

    //Remuevo el temporal
    ControlFuncion.removerTemporal(control.temporal);

    Codigo3D.addComentario(`Asignacion de variable ${this.id}`);
    const pos = Temporal.getSiguiente();

    //Si es una variable global
    if(variable.isGlobal()){
      //Capturo la posicion en la que se encuentra
      Codigo3D.add(`${pos} = ${variable.posicion};`);

      //Si es una variable Number | Boolean | String | Array
      if(isTipoNumber(variable.tipo) || isTipoBoolean(variable.tipo) || isTipoString(variable.tipo) || variable.isArray()){
        Codigo3D.add(`Heap[(int)${pos}] = ${control.temporal};`);
      }
      //TODO: continuar con los demas tipos
    }
    //Si es una variable local
    else{
      //Capturo la posicion en la que se encuentra
      Codigo3D.add(`${pos} = P + ${variable.posicion};`);
      //Si es una variable Number | Boolean | String | Array
      if(isTipoNumber(variable.tipo) || isTipoBoolean(variable.tipo) || isTipoString(variable.tipo) || variable.isArray()){
        Codigo3D.add(`Stack[(int)${pos}] = ${control.temporal};`);
      }
      //TODO: continuar con los demas tipo
    }
  }

  private validarTipos(t1: TIPO_DATO, t2: TIPO_DATO) : boolean {
    //number -> boolean -> string -> type -> array

    //boolean - boolean
    //string - string
    //type - type
    //array - array
    if(t1 === t2) return true;
    //number - number
    if(isTipoNumber(t1) && isTipoNumber(t2)) return true;
    //string - null
    //type - null
    //array - null
    if((isTipoString(t1) || isTipoType(t1) || isTipoArray(t1)) && isTipoNull(t2)) return true;

    return false;
  }

}
