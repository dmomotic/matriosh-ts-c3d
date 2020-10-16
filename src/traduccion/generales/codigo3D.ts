export class Codigo3D {
  private static instance: Codigo3D;
  public cadena: string;

  private constructor(){
    this.cadena = '';
  }

  private static getInstance() : Codigo3D{
    if(!Codigo3D.instance) Codigo3D.instance = new Codigo3D();
    return Codigo3D.instance;
  }

  public static add(cadena: string) : void {
    Codigo3D.getInstance().cadena += cadena + '\n';
  }

  public static addInit(cadena: string) : void {
    Codigo3D.getInstance().cadena = cadena + '\n' + Codigo3D.getInstance().cadena;
  }

  public static addComentario(cadena: string) : void {
    Codigo3D.getInstance().cadena += `/***** ${cadena} ******/\n`;
  }

  public static getCodigo(): string{
    return Codigo3D.getInstance().cadena;
  }

  public static clear(): void{
    Codigo3D.getInstance().cadena = '';
  }
}
