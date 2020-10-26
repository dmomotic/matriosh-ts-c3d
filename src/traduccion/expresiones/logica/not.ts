import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { getNombreDeTipo, TIPO_DATO } from "../../generales/tipos";
import { Control } from "../../utils/control";

export class Not extends NodoAST{
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
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando de la operacion NOT` }));
      return;
    }
    if (control.tipo != TIPO_DATO.BOOLEAN) {
      Errores.push(new Error({ tipo: 'semantico', linea: this.linea, descripcion: `El operador de la operación NOT debe ser de tipo BOOLEAN y es de tipo ${getNombreDeTipo(control.tipo)}` }));
      return;
    }

    Codigo3D.addComentario(`Operacion AND`);

    let falsas : string[] = [];
    let verdaderas : string[] = [];

    if(control.hasEtiquetas()){
      falsas = control.verdaderas;
      verdaderas = control.falsas;
      control.verdaderas = verdaderas;
      control.falsas = falsas;
      return control;
    }
    else{
      const lbl_false = Etiqueta.getSiguiente();
      const lbl_true = Etiqueta.getSiguiente();
      falsas.push(lbl_true);
      verdaderas.push(lbl_false);
      Codigo3D.add(`if(${control.temporal} == 1) goto ${lbl_true};`);
      Codigo3D.add(`goto ${lbl_false};`);
      return new Control({tipo: TIPO_DATO.BOOLEAN, verdaderas, falsas});
    }

  }

}
