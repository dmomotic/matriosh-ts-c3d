export class Heap {
  private static instance: Heap;
  public index: number;

  private constructor(){
    this.index = 0;
  }

  private static getInstance() : Heap{
    if(!Heap.instance) Heap.instance = new Heap();
    return Heap.instance;
  }

  public static getSiguiente() : number{
    return Heap.getInstance().index++;
  }

}
