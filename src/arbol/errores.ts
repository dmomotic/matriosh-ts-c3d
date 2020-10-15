import { Error } from './error';

export class Errores {
  private static instance: Errores;
  lista: Error[];

  private constructor() {
    this.lista = [];
  }

  public static getInstance(): Errores {
    if (!Errores.instance) {
      Errores.instance = new Errores();
    }
    return Errores.instance;
  }

  public static push(error: Error): void {
    Errores.getInstance().lista.push(error);
  }

  public static clear(): void{
    Errores.getInstance().lista = [];
  }

  public static hasErrors() : boolean{
    return Errores.getInstance().lista.length > 0;
  }

  public static getErrors(): Error[]{
    return Errores.getInstance().lista;
  }
}
