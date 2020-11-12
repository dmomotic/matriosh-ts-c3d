import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Ternario extends NodoAST {
  linea: string;
  condicion: NodoAST;
  inst_true: NodoAST;
  inst_false: NodoAST;

  constructor(linea: string, condicion: NodoAST, inst_true: NodoAST, inst_false: NodoAST) {
    super(linea);
    Object.assign(this, { condicion, inst_true, inst_false });
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`Traduccion operador TERNARIO`);
    const control: Control = this.condicion.traducir(ts);

    if (!control) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir la condición del op ternario` }));
      return;
    }

    //Si la condicion trae etiquetas
    if (control.hasEtiquetas()) {
      const lbl_salida = Etiqueta.getSiguiente();

      //Imprimo al inicio cada etiqueta verdadera
      for (let lbl of control.verdaderas) {
        Codigo3D.add(`${lbl}:`);
      }
      //Traduzco la instruccion verdadera
      const control_true: Control = this.inst_true.traducir(ts);
      //Remuevo el tempora
      ControlFuncion.removerTemporal(control_true.temporal);

      const temporal = Temporal.getSiguiente();
      Codigo3D.add(`${temporal} = ${control_true.temporal};`);
      Codigo3D.add(`goto ${lbl_salida};`);
      //Imprimo las etiquetas falsas
      for (let lbl of control.falsas) {
        Codigo3D.add(`${lbl}:`);
      }
      const control_false: Control = this.inst_false.traducir(ts);
      //Remuevo el temporal
      ControlFuncion.removerTemporal(control_false.temporal);
      Codigo3D.add(`${temporal} = ${control_false.temporal};`);
      Codigo3D.add(`${lbl_salida}:`);
      //Guardo el tempora
      ControlFuncion.guardarTemporal(temporal);
      return new Control({ temporal, tipo: control_true.tipo, tipo_de_arreglo: control_true.tipo_de_arreglo });
    }
    //Si no trae etiquetas
    else {
      const lbl_true = Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      const temporal = Temporal.getSiguiente();
      const lbl_salida = Etiqueta.getSiguiente();
      //REMUEVO EL TEMPORAL
      ControlFuncion.removerTemporal(control.temporal);
      Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);
      Codigo3D.add(`${lbl_true}:`);
      //Traduzco la instruccion verdadera
      const control_true: Control = this.inst_true.traducir(ts);
      //Remuevo el tempora
      ControlFuncion.removerTemporal(control_true.temporal);
      Codigo3D.add(`${temporal} = ${control_true.temporal};`);
      Codigo3D.add(`goto ${lbl_salida};`);
      Codigo3D.add(`${lbl_false}:`);
      const control_false: Control = this.inst_false.traducir(ts);
      //Remuevo el temporal
      ControlFuncion.removerTemporal(control_false.temporal);
      Codigo3D.add(`${temporal} = ${control_false.temporal};`);
      Codigo3D.add(`${lbl_salida}:`);

      //Guardo el temporal
      ControlFuncion.guardarTemporal(temporal);
      return new Control({ temporal, tipo: control_true.tipo, tipo_de_arreglo: control_true.tipo_de_arreglo });
    }
  }

}
