import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { Etiqueta } from "../generales/etiqueta";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { getNombreDeTipo, getTypeOfNumber, isTipoArray, isTipoNumber, TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class AccesoArreglo extends NodoAST {
  linea: string;
  id: string;
  lista_exps: NodoAST[];

  constructor(linea: string, id: string, lista_exps: NodoAST[]) {
    super(linea);
    Object.assign(this, { id, lista_exps });
  }

  /******************************
   *
   * DE MOMENTO SOLO FUNCIONA PARA UNA DIMENSION SI ME DA TIEMPO LO HAGO DE VARIAS DIMENSIONES
   *
   *****************************/

  traducir(ts: TablaSimbolos) {

    const variable = ts.getVariable(this.id);
    //Si la variable no existe es un error
    if (!variable) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontro la variable con el id: ${this.id}` }));
      return;
    }
    //Si la variable no es un arreglo
    if (!isTipoArray(variable.tipo)) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable con id ${this.id} no es de tipo ARRAY` }));
      return;
    }

    const temp_pos = Temporal.getSiguiente();
    const pos_inicial = Temporal.getSiguiente();
    //Si es una variable global
    if (variable.isGlobal()) {
      Codigo3D.add(`${temp_pos} = ${variable.posicion};`);
      Codigo3D.add(`${pos_inicial} = Heap[(int)${temp_pos}];`);
    }
    //Si es una variable local
    else {
      Codigo3D.add(`${temp_pos} = P + ${variable.posicion};`);
      Codigo3D.add(`${pos_inicial} = Stack[(int)${temp_pos}];`);
    }

    //Codigo valido para ambos casos
    const resp = Temporal.getSiguiente();
    const posicion_exacta = Temporal.getSiguiente();
    const aux_tam = Temporal.getSiguiente()
    const tamaño = Temporal.getSiguiente();
    Codigo3D.add(`${aux_tam} = ${pos_inicial} - 1;`);
    Codigo3D.add(`${tamaño} = Heap[(int)${aux_tam}];`);

    const lb_false = Etiqueta.getSiguiente();
    const lbl_end = Etiqueta.getSiguiente();

    for (const exp of this.lista_exps) {
      const control_pos: Control = exp.traducir(ts);
      if (!control_pos) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir una de las posiciones para el acceso de ${this.id}` }));
        return;
      }
      if (!isTipoNumber(control_pos.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede acceder a una posicion de tipo ${getNombreDeTipo(control_pos.tipo)}` }));
        return;
      }

      //Remuevo el tempora
      ControlFuncion.removerTemporal(control_pos.temporal);

      //Compruebo que sean posiciones validas
      Codigo3D.add(`if(${control_pos.temporal} < 0) goto ${lb_false};`);
      Codigo3D.add(`if(${control_pos.temporal} >= ${tamaño}) goto ${lb_false};`);

      Codigo3D.add(`${posicion_exacta} = ${pos_inicial} + ${control_pos.temporal};`);
    }
    Codigo3D.add(`${resp} = Heap[(int)${posicion_exacta}];`);
    Codigo3D.add(`goto ${lbl_end};`);

    Codigo3D.add(`${lb_false}:`);
    Codigo3D.add(`${resp} = -1;`);

    Codigo3D.add(`${lbl_end}:`);

    //GUARDO EL TEMPORAL
    ControlFuncion.guardarTemporal(resp);

    return new Control({ temporal: resp, tipo: variable.tipo_de_arreglo, posicion: posicion_exacta });
  }

}
