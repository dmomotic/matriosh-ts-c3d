import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";

export class ConsoleLog extends NodoAST {
  linea: string;
  exps: Array<NodoAST>;

  constructor(linea: string, exps: Array<NodoAST>) {
    super(linea);
    Object.assign(this, { exps });
  }

  traducir(ts: TablaSimbolos) {
    if (this.exps != null && this.exps.length > 0) {
      for (let exp of this.exps) {
        const control_exp = exp.traducir(ts);
        if (!control_exp) {
          Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: 'Error al obtener traduccion de expresion a imprimir en funcion console_log()' }));
          return;
        }

        if (!(control_exp instanceof Control)) {
          Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: 'Error al obtener clase control de la expresion a imprimir en funcion console_log()' }));
          return;
        }

        Codigo3D.addComentario('CONSOLE.LOG()');
        switch (control_exp.tipo) {
          case TIPO_DATO.INT:
            Codigo3D.add(`printf("%d",(int)${control_exp.temporal});`);
            break;
          case TIPO_DATO.FLOAT:
            Codigo3D.add(`printf("%f",${control_exp.temporal});`);
            break;
        }
      }
    }
  }

}
