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

export class Suma extends NodoAST {
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
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la suma` }));
      return;
    }
    if (!control_der) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la suma` }));
      return;
    }
    //Comprobacion de tipo
    const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
    if (tipo === TIPO_DATO.NULL) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una suma con los tipos ${getNombreDeTipo(control_izq.tipo)} y ${getNombreDeTipo(control_der.tipo)}` }));
      return;
    }

    const temporal = Temporal.getSiguiente();
    //REMUEVO TEMPORALES A UTILIZAR
    ControlFuncion.removerTemporal(control_izq.temporal);
    ControlFuncion.removerTemporal(control_der.temporal);
    //GUARDO TEMPORAL
    ControlFuncion.guardarTemporal(temporal);
    //Logica segun tipo de dato resultante
    switch (tipo) {
      case TIPO_DATO.FLOAT:
        Codigo3D.addComentario('Suma con resultado double');
        //float + float, float + int, int + float, float + boolean, boolean + float
        Codigo3D.add(`${temporal} = ${control_izq.temporal} + ${control_der.temporal};`);
        return new Control({ temporal, tipo });
      case TIPO_DATO.INT:
        Codigo3D.addComentario('Suma con resultado int');
        //int + int, int + boolean, boolean + int
        Codigo3D.add(`${temporal} = ${control_izq.temporal} + ${control_der.temporal};`);
        return new Control({ temporal, tipo });
      case TIPO_DATO.STRING:
        //float + string
        if(control_izq.tipo == TIPO_DATO.FLOAT && control_der.tipo == TIPO_DATO.STRING){

        }
        //string + float
        else if(control_izq.tipo == TIPO_DATO.STRING && control_der.tipo == TIPO_DATO.FLOAT){

        }
        //int + string
        else if(control_izq.tipo == TIPO_DATO.INT && control_der.tipo == TIPO_DATO.STRING){

        }
        //string + int
        else if(control_izq.tipo == TIPO_DATO.STRING && control_der.tipo == TIPO_DATO.INT){

        }
        //string + boolean
        else if(control_izq.tipo == TIPO_DATO.STRING && control_der.tipo == TIPO_DATO.BOOLEAN){

        }
        //boolean + string
        else if(control_izq.tipo == TIPO_DATO.BOOLEAN && control_der.tipo == TIPO_DATO.STRING){

        }
        //string + string
        else if(control_izq.tipo == TIPO_DATO.STRING && control_der.tipo == TIPO_DATO.STRING){
          Codigo3D.addComentario('Suma de dos string');
          //Capturo la posicion libre del Heap
          Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
          //TODO: hacer validación de null si fuera posible
          const temp_val = Temporal.getSiguiente();
          const temp_pos = Temporal.getSiguiente();
          Codigo3D.add(`${temp_pos} = ${control_izq.temporal};`);
          //Capturo la posicion inicial del string izquierdo
          const lbl_inicial = Etiqueta.getSiguiente();
          const lbl_true = Etiqueta.getSiguiente();
          const lbl_false = Etiqueta.getSiguiente();
          //Realizo el ciclo while para llenar el HEAP con el string izquierdo
          Codigo3D.add(`${lbl_inicial}:`);
          Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
          Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
          Codigo3D.add(`goto ${lbl_false};`);
          Codigo3D.add(`${lbl_true}:`);
          Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
          Codigo3D.add(`H = H + 1;`);
          Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
          Codigo3D.add(`goto ${lbl_inicial};`);
          Codigo3D.add(`${lbl_false}:`);

          Codigo3D.addComentario(`segundo string`);
          //Realizo el ciclo while para llenar el HEAP con el string derecho
          const temp_val2 = Temporal.getSiguiente();
          const temp_pos2 = Temporal.getSiguiente();
          Codigo3D.add(`${temp_pos2} = ${control_der.temporal};`);
          const lbl_inicial2 = Etiqueta.getSiguiente();
          const lbl_true2 = Etiqueta.getSiguiente();
          const lbl_false2 = Etiqueta.getSiguiente();
          Codigo3D.add(`${lbl_inicial2}:`);
          Codigo3D.add(`${temp_val2} = Heap[(int) ${temp_pos2}];`);
          Codigo3D.add(`if(${temp_val2} != -1) goto ${lbl_true2};`);
          Codigo3D.add(`goto ${lbl_false2};`);
          Codigo3D.add(`${lbl_true2}:`);
          Codigo3D.add(`Heap[(int)H]= ${temp_val2};`);
          Codigo3D.add(`H = H + 1;`);
          Codigo3D.add(`${temp_pos2} = ${temp_pos2} + 1;`);
          Codigo3D.add(`goto ${lbl_inicial2};`);
          Codigo3D.add(`${lbl_false2}:`);
          //Asigno caracter de escape
          Codigo3D.add(`Heap[(int)H] = -1;`);
          Codigo3D.add(`H = H + 1;`);
          Codigo3D.addComentario(`Fin suma de dos string`);
          return new Control({temporal, tipo});
        }
    }
  }

  private getTipoResultante(t1: TIPO_DATO, t2: TIPO_DATO): TIPO_DATO {
    //Number - Number
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.INT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.INT) return TIPO_DATO.INT;
    //Number - Boolean
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.BOOLEAN) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.BOOLEAN && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.FLOAT;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.BOOLEAN) return TIPO_DATO.INT;
    if (t1 == TIPO_DATO.BOOLEAN && t2 == TIPO_DATO.INT) return TIPO_DATO.INT;
    //String - Number
    if (t1 == TIPO_DATO.FLOAT && t2 == TIPO_DATO.STRING) return TIPO_DATO.STRING;
    if (t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.FLOAT) return TIPO_DATO.STRING;
    if (t1 == TIPO_DATO.INT && t2 == TIPO_DATO.STRING) return TIPO_DATO.STRING;
    if (t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.INT) return TIPO_DATO.STRING;
    //String - Boolean
    if (t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.BOOLEAN) return TIPO_DATO.STRING;
    if (t1 == TIPO_DATO.BOOLEAN && t2 == TIPO_DATO.STRING) return TIPO_DATO.STRING;
    //String - String
    if (t1 == TIPO_DATO.STRING && t2 == TIPO_DATO.STRING) return TIPO_DATO.STRING;
    //Cualquier otra combinacion
    return TIPO_DATO.NULL;
  }

}
