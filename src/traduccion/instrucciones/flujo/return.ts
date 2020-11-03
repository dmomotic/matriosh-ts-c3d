import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Codigo3D } from "../../generales/codigo3D";
import { Etiqueta } from "../../generales/etiqueta";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { Temporal } from "../../generales/temporal";
import { Control } from "../../utils/control";
import { ControlFuncion } from "../../utils/control_funcion";

export class Return extends NodoAST {
  linea: string;
  exp: NodoAST;

  constructor(linea: string, exp: NodoAST = null){
    super(linea);
    Object.assign(this, {exp});
  }

  traducir(ts: TablaSimbolos) {
    Codigo3D.addComentario(`Traducción return`);

    //Si la funcion retorna y no tengo expresion de retorno
    if(ControlFuncion.hasReturn() && !this.exp)
    {
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La función ${ControlFuncion.getId()} debe tener un valor de retorno`}));
      return;
    }

    //Si la funcion no retornoa y tego expresion de retorno
    if(!ControlFuncion.hasReturn() && this.exp)
    {
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `La función ${ControlFuncion.getId()} no debe tener un valor de retorno`}));
      return;
    }

    //Si el return trae alguna expresion
    const temp_return = Temporal.getSiguiente();
    if(this.exp)
    {
      const control : Control = this.exp.traducir(ts);
      //Validacion de traduccion
      if(!control){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No se pudo traducir el return de la función`}));
        return;
      }

      //TODO: Creo que debo hacer validaciones de tipos
      if(control.tipo != null){
        // const salida_return = Etiqueta.getSiguiente();
        Codigo3D.addComentario(`RETURN CON VALOR`);
        Codigo3D.add(`${temp_return} =  P + 0;`);
        Codigo3D.add(`Stack[(int)${temp_return}] = ${control.temporal};`);
        //Remuevo el temporal utilizado
        ControlFuncion.removerTemporal(control.temporal);
        Codigo3D.add(`return;`);
      }
    }
    //Si solo es un return
    else{
      Codigo3D.add(`return;`);
    }
    Codigo3D.addComentario(`Fin traducción return`);
  }

}
