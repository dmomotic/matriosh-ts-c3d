import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Heap } from "../../estructuras/heap";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
import { Control } from "../../utils/control";

export class DecIdTipoExp extends NodoAST{

  linea: string;
  reasignable: boolean;
  id: string;
  tipo: TIPO_DATO;
  exp: NodoAST;
  type_generador: string;

  constructor(linea: string, reasignable: boolean, id: string, tipo: TIPO_DATO, exp: NodoAST, type_generador: string = null){
    super(linea);
    Object.assign(this, {reasignable, id, tipo, exp, type_generador});
  }

  traducir(ts: TablaSimbolos) {
    //Busco en tabla de simbolos
    let variable = ts.getVariable(this.id);
    //Si la variable no existe es un error
    if(!variable){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna variable con el id: ${this.id} en este ambito`}));
      return;
    }

    //Obtengo objeto de tipo Control para mi expresion
    const control_exp = this.exp.traducir(ts) as Control;

    //Si mi objeto Control es null es un error
    if(!control_exp){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener los datos necesarios para la expresion en la asignacion del id: ${this.id} `}));
      return;
    }

    //Compruebo que el tipo del cual debe ser el id sea igual al tipo retornado en mi control
    if(this.tipo != control_exp.tipo){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `El tipo declarado y el tipo asignado del id: ${this.id} no son iguales`}));
      return;
    }

    //Si es una declaracion global
    if(ts.esGlobal()){
      Codigo3D.addComentario(`INICIO DECLARACION ID: ${this.id}`);
      const pos = Heap.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = ${pos};`);
      Codigo3D.add(`Heap[ ${temp_pos} ] = ${control_exp.temporal};`);

      //Registro la variable en la tabla de simbolos
      variable = new Variable({id: this.id, reasignable: this.reasignable, tipo: this.tipo, global: true, inicializado: true, posicion: pos});
      ts.setVariable(variable);
    }
    //Si no es una declaracion global
    else {

    }
  }

}
