import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { isTipoString, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Concat extends NodoAST {
  linea: string;
  id: string;
  cad1: NodoAST;
  cad2: NodoAST;

  constructor({ linea, id = null, cad1 = null, cad2 }: { linea: string, id?: string, cad1?: NodoAST, cad2: NodoAST }) {
    super(linea);
    Object.assign(this, { id, cad1, cad2 });
  }

  traducir(ts: TablaSimbolos) {
    const control_cadena2: Control = this.cad2.traducir(ts);

    if (!control_cadena2) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la cadena a concatenar` }));
      return;
    }
    if (!isTipoString(control_cadena2.tipo)) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La expresion enviada no es de tipo STRING` }));
      return;
    }

    //REMUEVO EL TEMPORAL
    ControlFuncion.removerTemporal(control_cadena2.temporal);

    //Globales
    const pos_cad1 = Temporal.getSiguiente();
    const pos_cad2 = Temporal.getSiguiente();

    //Si se esta concatenando con un id
    if (this.id && this.cad2) {
      const variable = ts.getVariable(this.id);
      if (!variable) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se encontró la variable ${this.id}` }));
        return;
      }
      if (!isTipoString(variable.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La variable ${this.id} no es de tipo STRING` }));
        return;
      }

      //Si es una variable global
      if (variable.isGlobal()) {
        Codigo3D.add(`${pos_cad1} = Heap[(int)${variable.posicion}];`);
      }
      //Si no es variable global
      else {
        const pos_aux = Temporal.getSiguiente();
        Codigo3D.add(`${pos_aux} = P + ${variable.posicion};`);
        Codigo3D.add(`${pos_cad1} = Stack[(int)${pos_aux}];`);
      }
    }
    //Si son dos cadenas directamente
    else if (this.cad1 && this.cad2) {
      const control_cad1: Control = this.cad1.traducir(ts);
      if (!control_cad1) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la primer cadena` }));
        return;
      }
      if (!isTipoString(control_cad1.tipo)) {
        Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La primer cadena no es un STRING` }));
        return;
      }

      //Solo capturo la posicion de la cadena 1
      Codigo3D.add(`${pos_cad1} = ${control_cad1.temporal};`);

    }
    else {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `Algo salio mal en la instruccion CONCAT` }));
      return;
    }

    /*** CODIGO VALIDO PARA TODOS LOS CASOS ***/
    Codigo3D.add(`${pos_cad2} = ${control_cadena2.temporal};`);

    //Temporal donde inicia la nueva cadena
    const puntero = Temporal.getSiguiente();
    Codigo3D.add(`${puntero} = H;`);

    const lbl_inicial = Etiqueta.getSiguiente();
    const lbl_final = Etiqueta.getSiguiente();
    const char = Temporal.getSiguiente();

    //Valido si alguna de las 2 es null, la concatenacion sera null
    const lbl_null = Etiqueta.getSiguiente();
    Codigo3D.add(`if(${pos_cad1} == -1) goto ${lbl_null};`);
    Codigo3D.add(`if(${pos_cad2} != -1) goto ${lbl_inicial};`);
    Codigo3D.add(`${lbl_null}:`);
    Codigo3D.add(`${puntero} = -1;`);
    const lbl_end = Etiqueta.getSiguiente();
    Codigo3D.add(`goto ${lbl_end};`);

    //Concateno cadena 1
    Codigo3D.add(`${lbl_inicial}:`);
    Codigo3D.add(`${char} = Heap[(int)${pos_cad1}];`);
    Codigo3D.add(`Heap[(int)H] = ${char};`);
    Codigo3D.add(`if(${char} == -1) goto ${lbl_final};`);
    Codigo3D.add(`H = H + 1;`);
    Codigo3D.add(`${pos_cad1} = ${pos_cad1} + 1;`);
    Codigo3D.add(`goto ${lbl_inicial};`);
    Codigo3D.add(`${lbl_final}:`);

    //Concateno cadena 2
    const lbl_inicial2 = Etiqueta.getSiguiente();
    const lbl_final2 = Etiqueta.getSiguiente();
    Codigo3D.add(`${lbl_inicial2}:`);
    Codigo3D.add(`${char} = Heap[(int)${pos_cad2}];`);
    Codigo3D.add(`Heap[(int)H] = ${char};`);
    Codigo3D.add(`if(${char} == -1) goto ${lbl_final2};`);
    Codigo3D.add(`H = H + 1;`);
    Codigo3D.add(`${pos_cad2} = ${pos_cad2} + 1;`);
    Codigo3D.add(`goto ${lbl_inicial2};`);
    Codigo3D.add(`${lbl_final2}:`);
    Codigo3D.add(`H = H + 1;`);

    Codigo3D.add(`${lbl_end}:`);

    //GUARDO EL TEMPORAL
    ControlFuncion.guardarTemporal(puntero);
    return new Control({ temporal: puntero, tipo: TIPO_DATO.STRING });
  }

}
