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

export class DecIdTipoCorchetesExp extends NodoAST {
  linea: string;
  id: string;
  tipo: TIPO_DATO;
  dimensiones: number;
  exp: NodoAST;
  type_generador: string;
  reasignable: boolean;

  constructor(linea: string, reasignable: boolean, id: string, tipo: TIPO_DATO, dimensiones: number, exp: NodoAST, type_generador: string = null) {
    super(linea);
    Object.assign(this, { reasignable, id, tipo, dimensiones, exp, type_generador });
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

    //Obtengo objeto de tipo Control para mi expresion
    const control_exp: Control = this.exp.traducir(ts);
    if (!control_exp) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible obtener los datos necesarios para la expresion en la asignacion del id: ${this.id} ` }));
      return;
    }

    //El tipo a asignar debe ser array o null
    if (!isTipoArray(control_exp.tipo) && !isTipoNull(control_exp.tipo)) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No puede asignar un tipo ${getNombreDeTipo(control_exp.tipo)} a un ARRAY` }));
      return;
    }

    //REMUEVO TEMPORAL GUARDADO
    ControlFuncion.removerTemporal(control_exp.temporal);
    Codigo3D.addComentario(`Declaracion y asignación de id: ${this.id} es un ARRAY tipo ${getNombreDeTipo(this.tipo)}`);

    //Si es una declaracion global
    if (ts.esGlobal()) {
      const pos = Heap.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = ${pos};`);
      Codigo3D.add(`Heap[ (int)${temp_pos} ] = ${control_exp.temporal};`);

      //Si el valor que vienes en la expresion es array
      if (control_exp.deboAsignarValorPorDefectoAlArray()) {
        //Si es un array de Numeros o Boolean
        const contador = Temporal.getSiguiente();
        const pos_tamaño = Temporal.getSiguiente();
        const tamaño = Temporal.getSiguiente();
        const puntero = Temporal.getSiguiente();
        Codigo3D.add(`${contador} = 0;`);
        Codigo3D.add(`${puntero} = ${control_exp.temporal};`);
        //Asigne la posicion de los arreglos una casilla antes en el HEAP
        Codigo3D.add(`${pos_tamaño} = ${control_exp.temporal} - 1;`);
        Codigo3D.add(`${tamaño} = Heap[(int) ${pos_tamaño}];`);
        //Ciclo para asignar valores por defecto
        const lbl_inicio = Etiqueta.getSiguiente();
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();
        Codigo3D.add(`${lbl_inicio}:`);
        Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);
        Codigo3D.add(`${lbl_true}:`);
        if (isTipoNumber(this.tipo) || isTipoBoolean(this.tipo)) {
          Codigo3D.add(`Heap[(int)${puntero}] = 0;`);
        }
        else {
          Codigo3D.add(`Heap[(int)${puntero}] = -1;`);
        }
        Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        Codigo3D.add(`${contador} = ${contador} + 1;`);
        Codigo3D.add(`goto ${lbl_inicio};`);
        Codigo3D.add(`${lbl_false}:`);
      }

      variable = new Variable({ id: this.id, tipo: TIPO_DATO.ARRAY, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: true, tipo_de_arreglo: this.tipo, referencia: this.type_generador });

      ts.setVariable(variable);
    }
    //Si no es una declaracion global
    else {
      const pos = Stack.getSiguiente();
      const temp_pos = Temporal.getSiguiente();

      Codigo3D.add(`${temp_pos} = P + ${pos};`);
      Codigo3D.add(`Stack[(int)${temp_pos}] = ${control_exp.temporal};`);

      //Si el valor que vienes en la expresion es array
      if (control_exp.deboAsignarValorPorDefectoAlArray()) {
        //Si es un array de Numeros o Boolean
        const contador = Temporal.getSiguiente();
        const pos_tamaño = Temporal.getSiguiente();
        const tamaño = Temporal.getSiguiente();
        const puntero = Temporal.getSiguiente();
        Codigo3D.add(`${contador} = 0;`);
        Codigo3D.add(`${puntero} = ${control_exp.temporal};`);
        //Asigne la posicion de los arreglos una casilla antes en el HEAP
        Codigo3D.add(`${pos_tamaño} = ${control_exp.temporal} - 1;`);
        Codigo3D.add(`${tamaño} = Heap[(int) ${pos_tamaño}];`);
        //Ciclo para asignar valores por defecto
        const lbl_inicio = Etiqueta.getSiguiente();
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();
        Codigo3D.add(`${lbl_inicio}:`);
        Codigo3D.add(`if(${contador} < ${tamaño}) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);
        Codigo3D.add(`${lbl_true}:`);
        if (isTipoNumber(this.tipo) || isTipoBoolean(this.tipo)) {
          Codigo3D.add(`Heap[(int)${puntero}] = 0;`);
        }
        else {
          Codigo3D.add(`Heap[(int)${puntero}] = -1;`);
        }
        Codigo3D.add(`${puntero} = ${puntero} + 1;`);
        Codigo3D.add(`${contador} = ${contador} + 1;`);
        Codigo3D.add(`goto ${lbl_inicio};`);
        Codigo3D.add(`${lbl_false}:`);
      }
      variable = new Variable({ id: this.id, tipo: TIPO_DATO.ARRAY, reasignable: this.reasignable, posicion: pos, inicializado: true, tamaño: this.dimensiones, global: false, tipo_de_arreglo: this.tipo, referencia: this.type_generador });
      ts.setVariable(variable);
    }
  }
}
