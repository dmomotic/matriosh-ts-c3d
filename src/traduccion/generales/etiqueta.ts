export class Etiqueta {
  private static instance: Etiqueta;
  public index: number;

  private constructor(){
    this.index = 0;
  }

  private static getInstance() : Etiqueta{
    if(!Etiqueta.instance) Etiqueta.instance = new Etiqueta();
    return Etiqueta.instance;
  }

  public static getSiguiente() : string{
    return `L${Etiqueta.getInstance().index++}`;
  }
}
