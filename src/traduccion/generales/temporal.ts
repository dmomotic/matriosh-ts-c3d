export class Temporal {
  private static instance: Temporal;
  public index: number;

  private constructor(){
    this.index = 0;
  }

  private static getInstance() : Temporal{
    if(!Temporal.instance) Temporal.instance = new Temporal();
    return Temporal.instance;
  }

  public static getSiguiente() : string{
    return `t${Temporal.getInstance().index++}`;
  }
}
