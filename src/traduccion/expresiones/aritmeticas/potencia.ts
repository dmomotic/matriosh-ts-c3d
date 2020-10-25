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

export class Potencia extends NodoAST {
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
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la Potencia` }));
      return;
    }
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la Potencia` }));
      return;
    }

    //Comprobacion de tipo
    const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
    if (tipo === TIPO_DATO.NULL) {

      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una Potencia con los tipos ${getNombreDeTipo(control_izq.tipo)} y ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    const temporal = Temporal.getSiguiente();
    //REMUEVO TEMPORALES A UTILIZAR
    ControlFuncion.removerTemporal(control_izq.temporal);
    ControlFuncion.removerTemporal(control_der.temporal);
    //GUARDO TEMPORAL
    ControlFuncion.guardarTemporal(temporal);

    switch (tipo) {
      case TIPO_DATO.INT:
        Codigo3D.addComentario('Potencia con resultado int');
        Codigo3D.add(`${temporal} = 1;`); //Valor inicial
        const temp_ciclo = Temporal.getSiguiente();
        Codigo3D.add(`${temp_ciclo} = (int) ${control_der.temporal};`);
        const lbl_ciclo = Etiqueta.getSiguiente();
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();
        Codigo3D.add(`${lbl_ciclo}:`);
        Codigo3D.add(`if(${temp_ciclo} > 0) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);
        Codigo3D.add(`${lbl_true}:`);
        const temp_redondeo = Temporal.getSiguiente();
        Codigo3D.add(`${temp_redondeo} = (int)${control_izq.temporal};`);
        Codigo3D.add(`${temporal} = ${temporal} * ${temp_redondeo};`);
        Codigo3D.add(`${temp_ciclo} = ${temp_ciclo} - 1;`);
        Codigo3D.add(`goto ${lbl_ciclo};`);
        Codigo3D.add(`${lbl_false}:`);
        return new Control({ temporal, tipo });
    }
  }

  private getTipoResultante(t1: TIPO_DATO, t2: TIPO_DATO): TIPO_DATO {
    //Number ** Number
    if ((t1 == TIPO_DATO.FLOAT  || t1 == TIPO_DATO.INT) && (t2 == TIPO_DATO.FLOAT || t2 == TIPO_DATO.INT)) return TIPO_DATO.INT;
    //Cualquier otra combinacion
    return TIPO_DATO.NULL;
  }

}
