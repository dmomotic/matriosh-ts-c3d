import { Error } from "../../../arbol/error";
import { Control } from "../../utils/control";
import { Errores } from "../../../arbol/errores";
import { NodoAST } from "../../generales/nodoAST";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { ControlFuncion } from "../../utils/control_funcion";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { getNombreDeTipo, TIPO_DATO } from "../../generales/tipos";

export class And extends NodoAST {
  linea: string;
  op_izq: NodoAST;
  op_der: NodoAST;

  constructor(linea: string, op_izq: NodoAST, op_der: NodoAST) {
    super(linea);
    Object.assign(this, { op_izq, op_der });
  }

  traducir(ts: TablaSimbolos) {
    //Traduzo operador izquierdo
    const control_izq : Control = this.op_izq.traducir(ts);
    //Validaciones
    if (!control_izq) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion AND` }));
      return;
    }
    if (control_izq.tipo != TIPO_DATO.BOOLEAN) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador izquierdo de la operación and debe ser de tipo BOOLEAN y es de tipo ${getNombreDeTipo(control_izq.tipo)}` }));
      return;
    }

    Codigo3D.addComentario(`Operacion AND`);

    let verdaderas : string[] = [];
    let falsas : string[] = [];

    //Si es temporal
    if(!control_izq.hasEtiquetas()){
      const lbl_true =  Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      control_izq.verdaderas.push(lbl_true);
      control_izq.falsas.push(lbl_false);

      //Remuevo temporal utilizado
      ControlFuncion.removerTemporal(control_izq.temporal);

      Codigo3D.add(`if(${control_izq.temporal} == 1) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);
    }

    //Imprimo todas las etiquetas verdaderas
    for(const lbl of control_izq.verdaderas){
      Codigo3D.add(`${lbl}:`);
    }

    //Traduzco el operador derecho
    const control_der : Control = this.op_der.traducir(ts);
    //Validaciones
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion AND` }));
      return;
    }
    if (control_der.tipo != TIPO_DATO.BOOLEAN) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador derecho de la operación AND debe ser de tipo BOOLEAN y es de tipo ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    //Si es temporal
    if(!control_der.hasEtiquetas()){
      const lbl_true = Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      control_der.verdaderas.push(lbl_true);
      control_der.falsas.push(lbl_false);

      //Remuevo temporal utilizado
      ControlFuncion.removerTemporal(control_der.temporal);

      Codigo3D.add(`if(${control_der.temporal} == 1) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);
    }

    verdaderas = control_der.verdaderas;
    falsas = control_izq.falsas.concat(control_der.falsas);

    return new Control({ tipo: TIPO_DATO.BOOLEAN, verdaderas, falsas });
  }

}
