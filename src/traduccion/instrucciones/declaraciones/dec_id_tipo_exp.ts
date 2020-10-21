import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Heap } from "../../estructuras/heap";
import { Stack } from "../../estructuras/stack";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, getTypeOfNumber, tiposValidos, TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

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
    //Si la variable ya existe es un error
    if(variable){
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

    //Compruebo la compatibilidad entre tipos
    if(!tiposValidos(this.tipo, control_exp.tipo)){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `El tipo declarado y el tipo asignado del id: ${this.id} no son iguales`}));
      return;
    }

    //REMUEVO TEMPORAL GUARDADO
    ControlFuncion.removerTemporal(control_exp.temporal);

    //Si es una declaracion global
    if(ts.esGlobal()){
      //Si es number o boolean
      if(this.tipo == TIPO_DATO.NUMBER || this.tipo == TIPO_DATO.BOOLEAN){
        Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} tipo ${getNombreDeTipo(control_exp.tipo)}`);
        const pos = Heap.getSiguiente();
        const temp_pos = Temporal.getSiguiente();

        Codigo3D.add(`${temp_pos} = ${pos};`);
        Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${control_exp.temporal};`);

        //Registro la variable en la tabla de simbolos
        variable = new Variable({id: this.id, reasignable: this.reasignable, tipo: control_exp.tipo, global: true, inicializado: true, posicion: pos});
        ts.setVariable(variable);
      }
      //Si es string
      else if(this.tipo == TIPO_DATO.STRING){
        Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} tipo string`);

        const pos = Heap.getSiguiente();
        const temp_pos = Temporal.getSiguiente();

        Codigo3D.add(`${temp_pos} = ${pos};`);
        Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${control_exp.temporal};`);

        variable = new Variable({id: this.id, reasignable: this.reasignable, tipo: this.tipo, global: true, inicializado: true, posicion: pos});
        ts.setVariable(variable);
      }
    }
    //Si no es una declaracion global
    else {
      //Si es number o bolean
      if(this.tipo === TIPO_DATO.NUMBER || this.tipo === TIPO_DATO.BOOLEAN){

        Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} tipo ${getNombreDeTipo(control_exp.tipo)}`);
        const pos = Stack.getSiguiente();
        const temp_pos = Temporal.getSiguiente();

        Codigo3D.add(`${temp_pos} = P + ${pos};`);
        Codigo3D.add(`Stack[(int)${temp_pos}] = ${control_exp.temporal};`);

        variable = new Variable({id: this.id, tipo: control_exp.tipo, reasignable: this.reasignable, posicion: pos, inicializado: true, global: false});
        ts.setVariable(variable);
      }
    }
  }

}
