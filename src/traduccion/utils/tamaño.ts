export class Tamaño {
  private static instance: Tamaño;
  public index: number;

  private constructor(){
    this.index = 1;
  }

  private static getInstance() : Tamaño{
    if(!Tamaño.instance) Tamaño.instance = new Tamaño();
    return Tamaño.instance;
  }

  public static aumentar() : void{
    Tamaño.getInstance().index++;
  }

  public static reducir() : void{
    Tamaño.getInstance().index--;
  }

  public static clear() : void{
    Tamaño.getInstance().index = 1;
  }
}
