import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class MayorQue extends NodoAST {
  linea: string;
  op_izq: NodoAST;
  op_der: NodoAST;

  constructor(linea: string, op_izq: NodoAST, op_der: NodoAST) {
    super(linea);
    Object.assign(this, { op_izq, op_der });
  }

  traducir(ts: TablaSimbolos) {
    const control_izq: Control = this.op_izq.traducir(ts);
    const control_der: Control = this.op_der.traducir(ts);

    //Validaciones
    if (!control_izq) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion mayor que` }));
      return;
    }
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion mayor que` }));
      return;
    }

    //Comprobacion de tipo
    const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
    if (tipo === TIPO_DATO.NULL) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una operacion mayor que con los tipos ${getNombreDeTipo(control_izq.tipo)} y ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    const temporal = Temporal.getSiguiente();
    //REMUEVO TEMPORALES A UTILIZAR
    ControlFuncion.removerTemporal(control_izq.temporal);
    ControlFuncion.removerTemporal(control_der.temporal);
    //CREO LISTA DE ETIQUETAS VERDADERAS Y FALSAS
    let verdaderas: string[] = [];
    let falsas: string[] = [];

    switch (tipo) {
      case TIPO_DATO.BOOLEAN:
        const lbl_verdadera = Etiqueta.getSiguiente();
        const lbl_falsa = Etiqueta.getSiguiente();
        verdaderas.push(lbl_verdadera);
        falsas.push(lbl_falsa);

        Codigo3D.addComentario('Operacion mayor que');
        Codigo3D.add(`if(${control_izq.temporal} > ${control_der.temporal}) goto ${lbl_verdadera};`);
        Codigo3D.add(`goto ${lbl_falsa};`);
        return new Control({ tipo, verdaderas, falsas });
    }
  }

  private getTipoResultante(t1: TIPO_DATO, t2: TIPO_DATO): TIPO_DATO {
    if ((t1 == TIPO_DATO.FLOAT  || t1 == TIPO_DATO.INT) && (t2 == TIPO_DATO.FLOAT || t2 == TIPO_DATO.INT)) return TIPO_DATO.BOOLEAN;
    //Cualquier otra combinacion
    return TIPO_DATO.NULL;
  }

}
