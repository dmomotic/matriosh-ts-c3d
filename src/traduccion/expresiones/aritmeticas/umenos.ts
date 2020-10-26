import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { getNombreDeTipo, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class UMenos extends NodoAST{
  linea: string;
  exp: NodoAST;

  constructor(linea: string, exp: NodoAST){
    super(linea);
    Object.assign(this, { exp });
  }

  traducir(ts: TablaSimbolos) {
    //Traduccion
    const control : Control = this.exp.traducir(ts);
    //Validaciones
    if (!control) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando de la operacion UMENOS` }));
      return;
    }
    if (control.tipo != TIPO_DATO.FLOAT && control.tipo != TIPO_DATO.INT) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador de la operación UMENOS debe ser de tipo BOOLEAN y es de tipo ${getNombreDeTipo(control.tipo)}` }));
      return;
    }

    const temporal = Temporal.getSiguiente();
    //GUARDO EL TEMPORAL
    ControlFuncion.guardarTemporal(temporal);

    Codigo3D.add(`${temporal} = ${control.temporal} * -1;`);

    const tipo = control.tipo;
    return new Control({temporal, tipo});
  }

}
