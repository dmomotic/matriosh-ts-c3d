import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { isTipoString } from "../../generales/tipos";
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
    const control_numero: Control = this.cad2.traducir(ts);

    if (!control_numero) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la segunda cadena de la operacion CONCAT` }));
      return;
    }

    //Si no es una cadena
    if (!isTipoString(control_numero.tipo)) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La segunda cadena no es valida para la instruccion CONCAT` }));
      return;
    }

    //REMUEVO EL TEMPORAL
    ControlFuncion.removerTemporal(control_numero.temporal);
  }

}
