import { Instruccion } from "./Instruccion";
import { InstruccionConOptimizacion } from "./instruccion_con_optimizacion";

export class Funcion extends InstruccionConOptimizacion {
  id: string;
  instrucciones:  Instruccion[];

  constructor(linea: string, codigo: string, id: string, instrucciones: Instruccion){
    super(linea, codigo);
    Object.assign(this, {id, instrucciones});
  }

  optimizar(): string {
    return '';
  }

}
