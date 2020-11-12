import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Heap } from "../../estructuras/heap";
import { Stack } from "../../estructuras/stack";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoArray, isTipoBoolean, isTipoNull, isTipoNumber, isTipoString, isTipoType, TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";
import { Tamaño } from "../../utils/tamaño";

export class DecIdTipoCorchetes extends NodoAST {
  linea: string;
  id: string;
  tipo: TIPO_DATO;
  dimensiones: number;
  type_generador: string;
  reasignable: boolean;

  constructor(linea: string, reasignable: boolean, id: string, tipo: TIPO_DATO, dimensiones: number, type_generador: string = null) {
    super(linea);
    Object.assign(this, { reasignable, id, tipo, dimensiones, type_generador });
  }

  calcularTamaño(): void {
    Tamaño.aumentar();
  }

  traducir(ts: TablaSimbolos) {

    //Busco en tabla de simbolos
    let variable = ts.getVariable(this.id);
    //Si la variable ya existe es un error
    if (variable) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una variable con el id: ${this.id} en este ambito` }));
      return;
    }

    Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} es un ARRAY tipo ${getNombreDeTipo(this.tipo)}`);

    //Si es una declaracion global
    if (ts.esGlobal()) {
      const pos = Heap.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = ${pos};`);
      Codigo3D.add(`Heap[ (int)${temp_pos} ] = -1;`);

      variable = new Variable({ id: this.id, tipo: TIPO_DATO.ARRAY, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: true, tipo_de_arreglo: this.tipo, referencia: this.type_generador });

      ts.setVariable(variable);
    }
    //Si no es una declaracion global
    else {
      const pos = Stack.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = P + ${pos};`);
      Codigo3D.add(`Stack[(int)${temp_pos}] = -1;`);

      variable = new Variable({ id: this.id, tipo: TIPO_DATO.ARRAY, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: false, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
      ts.setVariable(variable);
    }
  }
}
