export class Optimizacion {
  linea: string;
  antiguo: string;
  nuevo: string;
  regla: string;

  constructor(linea: string, antiguo: string, nuevo: string, regla: string){
    const aux = +linea + 1;
    Object.assign(this, {linea: aux, antiguo, nuevo, regla});
  }
}
