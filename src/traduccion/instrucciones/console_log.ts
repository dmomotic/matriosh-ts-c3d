import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Codigo3D } from "../generales/codigo3D";
import { Etiqueta } from "../generales/etiqueta";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { TIPO_DATO } from "../generales/tipos";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

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

        //REMUEVO TEMPORAL GUARDADO
        if(!control_exp.hasEtiquetas()){
          ControlFuncion.removerTemporal(control_exp.temporal);
        }

        Codigo3D.addComentario('CONSOLE.LOG()');
        switch (control_exp.tipo) {
          case TIPO_DATO.INT:
            Codigo3D.add(`printf("%d",(int)${control_exp.temporal});`);
            break;
          case TIPO_DATO.FLOAT:
            Codigo3D.add(`printf("%f",${control_exp.temporal});`);
            break;
          case TIPO_DATO.STRING: {
            //Validación inicial de string
            const t1 = control_exp.temporal;
            const lbl_null = Etiqueta.getSiguiente();
            Codigo3D.add(`if(${t1} == -1) goto ${lbl_null};`);
            //Ciclo while para iterar si el string no es null
            //Etiqueta iterativa del ciclo while
            const lbl_ciclo = Etiqueta.getSiguiente();
            Codigo3D.add(`${lbl_ciclo}:`);
            //Capturo el ascii guardado en la posicion
            const t2 = Temporal.getSiguiente();
            Codigo3D.add(`${t2} = Heap[(int)${t1}];`);
            //Condicion while
            const lbl_true = Etiqueta.getSiguiente();
            const lbl_false = Etiqueta.getSiguiente();
            Codigo3D.add(`if(${t2} != -1) goto ${lbl_true};`);
            Codigo3D.add(`goto ${lbl_false};`);
            //Inicio etiqueta verdadera
            Codigo3D.add(`${lbl_true}:`);
            Codigo3D.add(`printf("%c",(int)${t2});`);
            Codigo3D.add(`${t1} = ${t1} + 1;`);
            //Salto a etiqueta iteradora
            Codigo3D.add(`goto ${lbl_ciclo};`);
            //Etiqueta si el string es null
            Codigo3D.add(`${lbl_null}:`);
            //Etiqueta final ciclo while
            Codigo3D.add(`${lbl_false}:`);
            break;
          }
          case TIPO_DATO.BOOLEAN: {
            const lbl_true = Etiqueta.getSiguiente();
            const lbl_false = Etiqueta.getSiguiente();
            const lbl_fin = Etiqueta.getSiguiente();
            Codigo3D.add(`if(${control_exp.temporal} == 1) goto ${lbl_true};`);
            Codigo3D.add(`goto ${lbl_false};`);
            Codigo3D.add(`${lbl_true}:`);
            //Imprimir true en consola
            Codigo3D.add(`printf("%c", ${'t'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'r'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'u'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'e'.charCodeAt(0)});`);
            Codigo3D.add(`goto ${lbl_fin};`);
            //Etiqueta false (imprimir false en consola)
            Codigo3D.add(`${lbl_false}:`);
            Codigo3D.add(`printf("%c", ${'f'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'a'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'l'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'s'.charCodeAt(0)});`);
            Codigo3D.add(`printf("%c", ${'e'.charCodeAt(0)});`);
            //Etiqueta fin
            Codigo3D.add(`${lbl_fin}:`);
          }
        }
        Codigo3D.add(`printf("\\n");`);
        Codigo3D.addComentario('FIN CONSOLE.LOG()');
      }
    }
  }

}
