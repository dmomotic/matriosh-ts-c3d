import { TablaSimbolos } from './tablaSimbolos';
import * as _ from 'lodash';

export class Entornos {
  private static instance: Entornos;
  lista: TablaSimbolos[];

  private constructor() {
    this.lista = [];
  }

  private static getInstance(): Entornos {
    if (!Entornos.instance) {
      Entornos.instance = new Entornos();
    }
    return Entornos.instance;
  }

  public static push(entorno: TablaSimbolos): void {
    Entornos.getInstance().lista.push(_.cloneDeep(entorno));
  }

  public static clear(): void{
    Entornos.getInstance().lista = [];
  }

  public static getLista() : TablaSimbolos[]{
    return Entornos.getInstance().lista;
  }
}
