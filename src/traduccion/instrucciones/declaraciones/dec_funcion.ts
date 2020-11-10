import { Error } from "../../../arbol/error";
import { Errores } from "../../../arbol/errores";
import { Stack } from "../../estructuras/stack";
import { Codigo3D } from "../../generales/codigo3D";
import { Funcion } from "../../generales/funcion";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
import { ControlFuncion } from "../../utils/control_funcion";
import { Tamaño } from "../../utils/tamaño";

export class DecFuncion extends NodoAST{
  linea: string;
  id: string;
  tipo: TIPO_DATO;
  referencia: string;
  parametros: Variable[];
  instrucciones: NodoAST[];

  constructor({linea, id, tipo, referencia = null, parametros = [], instrucciones = []} : {linea: string, id: string, tipo: TIPO_DATO, referencia?: string, parametros?: Variable[], instrucciones?: NodoAST[]}){
    super(linea);
    Object.assign(this, {id, tipo, referencia, parametros, instrucciones});
  }

  calcularTamaño() : void{
    // for(const p in this.parametros){
    //   Tamaño.aumentar();
    // }
    // for(const i of this.instrucciones){
    //   i.calcularTamaño();
    // }
  }

  traducir(ts: TablaSimbolos) {
    //Busco si la funcion ya existe
    let funcion = ts.getFuncion(this.id);
    if(funcion){
      Errores.push(new Error({tipo: 'semantico', linea: this.linea, descripcion: `Ya existe una funcion declarada con el nombre ${this.id}`}));
      return;
    }

    //Global para el control en la traduccion
    Codigo3D.getInstance().traduciendo_funcion = true;

    Codigo3D.addComentario(`DECLARACIÓN DE FUNCION: ${this.id}`);
    //Reiniciamos el tamaño
    Tamaño.clear();
    //Reiniciamos stack para retorno
    Stack.clear();
    //Calculo el tamaño de la funcion
    for(const p in this.parametros){
      Tamaño.aumentar();
    }
    for(const i of this.instrucciones){
      i.calcularTamaño();
    }

    //Imprimo solo para estar seguro
    Codigo3D.addComentario(`El tamaño de la funcion ${this.id} es de ${Tamaño.getValor()}`);

    //Entorno local
    const ts_local = new TablaSimbolos(ts);

    //Declaro asigno una posicion a cada parametro
    for(const parametro of this.parametros){
      const pos_stack = Stack.getSiguiente();
      parametro.posicion = pos_stack;
      //Ajusto el tipo number a float ya que no tengo forma de identificarlo mas adelante
      parametro.tipo = parametro.tipo != TIPO_DATO.NUMBER ? parametro.tipo : TIPO_DATO.FLOAT;
      ts_local.setVariable(parametro);
    }
    //Ajusto el tipo number a float ya que no tengo forma de identificarlo mas adelante
    funcion = new Funcion({id: this.id, parametros: this.parametros, tamaño: Tamaño.getValor() + 1, referencia: this.referencia, tipo: this.tipo != TIPO_DATO.NUMBER ? this.tipo : TIPO_DATO.FLOAT});
    ts.setFuncion(funcion);
    //TODO: asignar valores al control funcion
    ControlFuncion.setId(this.id);
    ControlFuncion.setReferencia(this.referencia);
    ControlFuncion.setTipo(this.tipo);

    //Genero el codigo de la funcion
    Codigo3D.add(`void ${this.id}()\n{`);

    //Traduzco el cuerpo de la función
    for(const instruccion of this.instrucciones){
      instruccion.traducir(ts_local);
    }

    Codigo3D.add(`return; //Obligatorio al final`);
    Codigo3D.add(`}`);

    //Global para el control en la traduccion
    Codigo3D.getInstance().traduciendo_funcion = false;

    //Reestablezco el control de la funcion
    ControlFuncion.clear();
  }

}
