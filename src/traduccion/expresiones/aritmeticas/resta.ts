import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Resta extends NodoAST {
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
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la resta` }));
      return;
    }
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la resta` }));
      return;
    }

    //Comprobacion de tipo
    const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
    if (tipo === TIPO_DATO.NULL) {

      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una resta con los tipos ${getNombreDeTipo(control_izq.tipo)} y ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    const temporal = Temporal.getSiguiente();
    //REMUEVO TEMPORALES A UTILIZAR
    ControlFuncion.removerTemporal(control_izq.temporal);
    ControlFuncion.removerTemporal(control_der.temporal);
    //GUARDO TEMPORAL
    ControlFuncion.guardarTemporal(temporal);

    switch (tipo) {
      case TIPO_DATO.FLOAT:
        Codigo3D.addComentario('Resta con resultado double');
        Codigo3D.add(`${temporal} = ${control_izq.temporal} - ${control_der.temporal};`);
        return new Control({ temporal, tipo });
      case TIPO_DATO.INT:
        Codigo3D.addComentario('Resta con resultado int');
        Codigo3D.add(`${temporal} = ${control_izq.temporal} - ${control_der.temporal};`);
        return new Control({ temporal, tipo });
    }
  }

  private getTipoResultante(t1: TIPO_DATO, t2: TIPO_DATO): TIPO_DATO {
    //Number - Number
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.INT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.INT) return TIPO_DATO.INT;
    //Cualquier otra combinacion
    return TIPO_DATO.NULL;
  }

}
