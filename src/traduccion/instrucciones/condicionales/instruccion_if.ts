import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { If } from "../../estructuras/If";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class InstruccionIf extends NodoAST {
  linea: string;
  ifs: If[];

  constructor(linea: string, ifs: If[]) {
    super(linea);
    Object.assign(this, { ifs });
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`INICIO SENTENCIA IF`);
    const salidas: string[] = [];
    for (let inst_if of this.ifs) {
      //Si es un if
      if (!inst_if.isElse()) {
        const lbl_salida = Etiqueta.getSiguiente();
        salidas.push(lbl_salida);
        Codigo3D.addComentario('Condicion IF');
        const control_if = inst_if.condicion.traducir(ts);
        //Si hubo error al traducir condicion
        if (control_if == null) {
          Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `Error al traducion condicion de sentencia if` }));
          return;
        }
        //Validacion tipo control
        if (!(control_if instanceof Control)) {
          Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El tipo de control retornado por la condicion del if, no es del tipo Control` }));
          return;
        }
        //El control retornado debe ser boolean
        if (control_if.tipo != TIPO_DATO.BOOLEAN) {
          Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `La condición del if debe ser de tipo boolean` }));
          return;
        }
        //Si el control recibido tiene etiquetas
        if (control_if.hasEtiquetas()) {
          //Imprimo al inicio cada etiqueta verdadera
          for (let lbl of control_if.verdaderas) {
            Codigo3D.add(`${lbl}:`);
          }
          //Creo la tabla de simbolo para mi nuevo entorno
          const ts_local = new TablaSimbolos(ts);
          //Traduzco cada instruccion en el cuerpo de la instruccion if
          inst_if.instrucciones.forEach((instruccion) => {
            instruccion.traducir(ts_local);
          });
          //Imprimo etiqueta de salida
          Codigo3D.add(`goto ${lbl_salida};`);
          //Imprimo etiquetas falsas
          for (let lbl of control_if.falsas) {
            Codigo3D.add(`${lbl}:`);
          }
        }
        //Si el control recibido no tiene etiquetas
        else {
          const lbl_true = Etiqueta.getSiguiente();
          const lbl_false = Etiqueta.getSiguiente();
          //REMUEVO EL TEMPORAL
          ControlFuncion.removerTemporal(control_if.temporal);
          Codigo3D.add(`if(${control_if.temporal} == 1) goto ${lbl_true};`);
          Codigo3D.add(`goto ${lbl_false};`);
          Codigo3D.add(`${lbl_true}:`);
          //Tabla de simbolos para el nuevo entorno
          const ts_local = new TablaSimbolos(ts);
          //Traduzco las intrucciones del if
          inst_if.instrucciones.forEach((instruccion) => {
            instruccion.traducir(ts_local);
          });
          Codigo3D.add(`goto ${lbl_salida};`);
          Codigo3D.add(`${lbl_false}:`);
        }
      }
      //Si es un else
      else {
        Codigo3D.addComentario('Condicion ELSE');
        //Tabla de simbolos del entorno nuevo
        const ts_local = new TablaSimbolos(ts);
        inst_if.instrucciones.forEach((instruccion) => {
          instruccion.traducir(ts_local);
        });
      }
    }
    //Imprimo etiquetas de salida
    for(const lbl of salidas){
      Codigo3D.add(`${lbl}:`);
    }
    Codigo3D.addComentario(`FINAL SENTENCIA IF`);
  }

}
