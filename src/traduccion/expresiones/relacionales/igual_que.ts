import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, isTipoBoolean, isTipoNull, isTipoNumber, isTipoString, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class IgualQue extends NodoAST{
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
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion IGUAL QUE` }));
      return;
    }
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion IGUAL QUE` }));
      return;
    }


    //Comprobacion de tipo
    const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
    if (tipo === TIPO_DATO.NULL) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una operacion IGUAL QUE con los tipos ${getNombreDeTipo(control_izq.tipo)} y ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    //REMUEVO TEMPORALES A UTILIZAR
    ControlFuncion.removerTemporal(control_izq.temporal);
    ControlFuncion.removerTemporal(control_der.temporal);
    //CREO LISTA DE ETIQUETAS VERDADERAS Y FALSAS
    let verdaderas: string[] = [];
    let falsas: string[] = [];

    Codigo3D.addComentario(`${getNombreDeTipo(control_izq.tipo)} == ${getNombreDeTipo(control_der.tipo)}`);

    //Si es una comparacion de tipos numericos o si es una comparacion de tipos boolean
    if((isTipoNumber(control_izq.tipo) && isTipoNumber(control_der.tipo)) || (isTipoBoolean(control_izq.tipo) && isTipoBoolean(control_der.tipo))){
        const lbl_true = Etiqueta.getSiguiente();
        const lbl_false = Etiqueta.getSiguiente();
        verdaderas.push(lbl_true);
        falsas.push(lbl_false);

        Codigo3D.add(`if(${control_izq.temporal} == ${control_der.temporal}) goto ${lbl_true};`);
        Codigo3D.add(`goto ${lbl_false};`);

        return new Control({tipo, verdaderas, falsas});
    }
    //Si es una comparacion de tipos string
    else if(isTipoString(control_izq.tipo) && isTipoString(control_der.tipo)){
      const temp_c1_init = Temporal.getSiguiente();
      const temp_c2_init = Temporal.getSiguiente();
      const lbl_true = Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      verdaderas.push(lbl_true);
      falsas.push(lbl_false);

      Codigo3D.add(`${temp_c1_init} = ${control_izq.temporal};`);
      Codigo3D.add(`${temp_c2_init} = ${control_der.temporal};`);

      //TODO: hacer validacion de nulls

      const temp_c1 = Temporal.getSiguiente();
      const temp_c2 = Temporal.getSiguiente();
      const lbl_inicio = Etiqueta.getSiguiente();
      Codigo3D.add(`${lbl_inicio}:`);
      Codigo3D.add(`${temp_c1} = Heap[(int)${temp_c1_init}];`);
      Codigo3D.add(`${temp_c2} = Heap[(int)${temp_c2_init}];`);

      Codigo3D.add(`if(${temp_c1} != ${temp_c2}) goto ${lbl_false};`);
      Codigo3D.add(`if(${temp_c1} == -1) goto ${lbl_true};`);
      Codigo3D.add(`${temp_c1_init} = ${temp_c1_init} + 1;`);
      Codigo3D.add(`${temp_c2_init} = ${temp_c2_init} + 1;`);
      Codigo3D.add(`goto ${lbl_inicio};`);
      return new Control({tipo, verdaderas, falsas});
    }
    //Para el resto de tipos
    else {
      const temp_c1_init = Temporal.getSiguiente();
      const temp_c2_init = Temporal.getSiguiente();
      const lbl_true = Etiqueta.getSiguiente();
      const lbl_false = Etiqueta.getSiguiente();
      verdaderas.push(lbl_true);
      falsas.push(lbl_false);

      Codigo3D.add(`${temp_c1_init} = ${control_izq.temporal};`);
      Codigo3D.add(`${temp_c2_init} = ${control_der.temporal};`);

      Codigo3D.add(`if(${temp_c1_init} == ${temp_c2_init}) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);

      return new Control({tipo, verdaderas, falsas});
    }
  }

  private getTipoResultante(t1: TIPO_DATO, t2: TIPO_DATO): TIPO_DATO {
    if((t1 == TIPO_DATO.FLOAT  || t1 == TIPO_DATO.INT) && (t2 == TIPO_DATO.FLOAT || t2 == TIPO_DATO.INT)) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.BOOLEAN && t2 == TIPO_DATO.BOOLEAN) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.STRING) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.TYPE && t2 == TIPO_DATO.TYPE) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.ARRAY && t2 == TIPO_DATO.ARRAY) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.TYPE && t2 == TIPO_DATO.NULL) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.ARRAY && t2 == TIPO_DATO.NULL) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.NULL) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.NULL && t2 == TIPO_DATO.ARRAY) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.NULL && t2 == TIPO_DATO.STRING) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.NULL && t2 == TIPO_DATO.TYPE) return TIPO_DATO.BOOLEAN;
    if(t1 == TIPO_DATO.NULL && t2 == TIPO_DATO.NULL) return TIPO_DATO.BOOLEAN;
    //Cualquier otra combinacion
    return TIPO_DATO.NULL;
  }

}
