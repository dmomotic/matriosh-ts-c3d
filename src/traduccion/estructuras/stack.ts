export class Stack {
  private static instance: Stack;
  public index: number;

  private constructor(){
    this.index = 0;
  }

  private static getInstance() : Stack{
    if(!Stack.instance) Stack.instance = new Stack();
    return Stack.instance;
  }

  public static getIndex(): number{
    return Stack.getInstance().index;
  }

  public static setIndex(value: number) : void{
    Stack.getInstance().index = value;
  }

  public static getSiguiente() : number{
    return Stack.getInstance().index++;
  }

  public static getAnterior() : number{
    return Stack.getInstance().index--;
  }

  public static clear() : void{
    Stack.getInstance().index = 0;
  }
}
