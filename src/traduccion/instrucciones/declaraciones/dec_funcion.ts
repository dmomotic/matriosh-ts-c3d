import { Stack } from "../../estructuras/stack";
import { Codigo3D } from "../../generales/codigo3D";
import { NodoAST } from "../../generales/nodoAST";
import { TablaSimbolos } from "../../generales/tablaSimbolos";
import { TIPO_DATO } from "../../generales/tipos";
import { Variable } from "../../generales/variable";
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
  }

}
