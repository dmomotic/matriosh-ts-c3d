import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { getNombreDeTipo } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class Id extends NodoAST{

  linea: string;
  id: string;

  constructor(linea: string, id: string){
    super(linea);
    Object.assign(this, {id});
  }

  traducir(ts: TablaSimbolos) {
    const variable = ts.getVariable(this.id);
    //Si la variable no existe es un error
    if(!variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable con el id: ${this.id}`}));
      return;
    }

    //Si es una variable global
    if(variable.isGlobal()){
      //Si es de tipo numerico o string o boolean
      if(variable.isNumeric()  || variable.isString() || variable.isBoolean()){
        Codigo3D.addComentario(`Acceso a la variable global con id: ${variable.id} (${getNombreDeTipo(variable.tipo)})`);
        const pos = variable.posicion;
        const temp_pos = Temporal.getSiguiente();
        Codigo3D.add(`${temp_pos} = ${pos};`);
        const temp = Temporal.getSiguiente();
        Codigo3D.add(`${temp} = Heap[(int)${temp_pos}];`);
        //GUARDO EL TEMPORAL
        ControlFuncion.guardarTemporal(temp);
        return new Control({temporal: temp, tipo: variable.tipo});
      }
    }
    //TODO: Si no es una variable global
    else{
      //Si es de tipo numerico
      if(variable.isNumeric()){
        Codigo3D.addComentario(`Acceso a la variable con id: ${variable.id} (${getNombreDeTipo(variable.tipo)})`);
        const temp_ref = Temporal.getSiguiente();
        Codigo3D.add(`${temp_ref} = ${variable.posicion};`);
        const temp_pos = Temporal.getSiguiente();
        Codigo3D.add(`${temp_pos} = P + ${temp_ref};`);
        const temp_real = Temporal.getSiguiente();
        Codigo3D.add(`${temp_real} = Stack[(int)${temp_pos}];`)
        //GUARDO EL TEMPORAL
        ControlFuncion.guardarTemporal(temp_real);
        return new Control({temporal: temp_real, tipo: variable.tipo});
      }
    }
  }

}
