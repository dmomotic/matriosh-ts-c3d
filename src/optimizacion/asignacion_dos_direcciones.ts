import { InstruccionConOptimizacion } from "./instruccion_con_optimizacion";

export class AsignacionDosDirecciones extends InstruccionConOptimizacion {
  linea: string;
  codigo: string;
  dir1: string;
  dir2: string;

  constructor(linea: string, codigo: string, dir1: string, dir2: string){
    super(linea, codigo);
    Object.assign(this, {dir1: dir1.toLowerCase(), dir2: dir2.toLowerCase()});
  }

  optimizar(): string {
    return this.codigo;
  }

}
