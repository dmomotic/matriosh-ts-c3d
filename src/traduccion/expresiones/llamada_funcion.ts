import { Error } from "../../arbol/error";
import { Errores } from "../../arbol/errores";
import { Stack } from "../estructuras/stack";
import { Codigo3D } from "../generales/codigo3D";
import { Funcion } from "../generales/funcion";
import { NodoAST } from "../generales/nodoAST";
import { TablaSimbolos } from "../generales/tablaSimbolos";
import { Temporal } from "../generales/temporal";
import { Control } from "../utils/control";
import { ControlFuncion } from "../utils/control_funcion";

export class LlamadaFuncion extends NodoAST{
  linea: string;
  id: string;
  argumentos: NodoAST[];

  constructor(linea: string, id: string, argumentos: NodoAST[] = []){
    super(linea);
    Object.assign(this, {id, argumentos});
  }

  traducir(ts: TablaSimbolos) {
    const funcion: Funcion = ts.getFuncion(this.id);
    //Compruebo que exista la funcion
    if(!funcion){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No existe ninguna funcion con el id: ${this.id}`}));
      return;
    }

    const controles: Control[] = [];
    //Guardo temporales no utilizados antes de la llamada
    Codigo3D.addComentario(`GUARDANDO TEMPORALES SIN UTILIZAR`);
    for(const temp of ControlFuncion.getTemporales()){
      const temp_guardar = Temporal.getSiguiente();
      Codigo3D.add(`${temp_guardar} = P + ${Stack.getSiguiente()};`);
      Codigo3D.add(`Stack[(int)${temp_guardar}] = ${temp};`);
    }
    Codigo3D.addComentario(`FIN DE GUARDADO DE TEMPORALES`);

    Codigo3D.addComentario(`LLamando a funcion ${this.id}`);

    //Realizo la traduccion de los argumentos que recibe la funcion
    for(const argumento of this.argumentos){
      const control : Control = argumento.traducir(ts);
      //Validación de traduccion
      if(!control){
        Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `No fue posible traducir el parametro de la funcion`}));
        return;
      }
      controles.push(control);
    }

    const temp_cambio = Temporal.getSiguiente();
    //Cambio simulado de ambito
    Codigo3D.add(`${temp_cambio} = P + ${Stack.getIndex()};`);
    //Preparacion de argumentos para llamada de funcion
    for(let i = 0; i < controles.length; i++){
      const control = controles[i];
      const parametro = funcion.getParametro(i);
      const temp_pos = Temporal.getSiguiente();
      Codigo3D.add(`${temp_pos} = ${temp_cambio} + ${parametro.posicion};`);
      Codigo3D.add(`Stack[(int)${temp_pos}] = ${control.temporal};`);
    }
    //Cambio real de ambito
    Codigo3D.add(`P = P + ${Stack.getIndex()};`);
    Codigo3D.add(`${this.id}();`);

    const pos_retorno = Temporal.getSiguiente();
    const temp_retorno = Temporal.getSiguiente();
    Codigo3D.addComentario(`Capturando retorno de funcion`);
    Codigo3D.add(`${pos_retorno} = P + 0;`);
    Codigo3D.add(`${temp_retorno} = Stack[(int)${pos_retorno}];`);

    const control = new Control({temporal: temp_retorno, tipo: funcion.tipo, referencia: funcion.referencia });
    //Regreso al ambito
    Codigo3D.add(`P = P - ${Stack.getIndex()};`);
    //Recupero los temporales guardados antes de la llamada
    Codigo3D.addComentario(`RECUPERANDO TEMPORALES GUARDADOS`);
    //Regreso el puntero a antes de guardar
    Stack.setIndex(Stack.getIndex() - ControlFuncion.getTemporalesLength());

    for(const temp of ControlFuncion.getTemporales()){
      const temp_recuperado = Temporal.getSiguiente();
      Codigo3D.add(`${temp_recuperado} = P + ${Stack.getSiguiente()};`);
      Codigo3D.add(`${temp} = Stack[(int)${temp_recuperado}];`);
    }

    if(funcion.hasReturn()){
      ControlFuncion.guardarTemporal(temp_retorno);
    }
     return control;
  }

}
