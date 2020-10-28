export class Codigo3D {
  private static instance: Codigo3D;
  public cadena: string;
  public traduciendo_funcion : boolean;
  public cadena_funciones: string;

  private constructor(){
    this.cadena = '';
    this.traduciendo_funcion = false;
    this.cadena_funciones = '';
  }

  private static traduciendoFuncion() : boolean {
    return Codigo3D.instance.traduciendo_funcion;
  }

  public static getInstance() : Codigo3D{
    if(!Codigo3D.instance) Codigo3D.instance = new Codigo3D();
    return Codigo3D.instance;
  }

  public static add(cadena: string) : void {
    //Si estoy traduciendo una funcion
    if(Codigo3D.traduciendoFuncion()){
      Codigo3D.getInstance().cadena_funciones += cadena + '\n';
    }
    //Si no estoy traduciendo una funcion
    else{
      Codigo3D.getInstance().cadena += cadena + '\n';
    }
  }

  public static addInit(cadena: string) : void {
    Codigo3D.getInstance().cadena = cadena + '\n' + Codigo3D.getInstance().cadena;
  }

  public static addComentario(cadena: string) : void {
    //Si estoy traduciendo una funcion
    if(Codigo3D.traduciendoFuncion()){
      Codigo3D.getInstance().cadena_funciones += `/***** ${cadena} ******/\n`;
    }
    //Si no estoy traduciendo una funcion
    else{
      Codigo3D.getInstance().cadena += `/***** ${cadena} ******/\n`;
    }
  }

  public static getCodigo(): string{
    return Codigo3D.getInstance().cadena;
  }

  public static getCodigoFunciones(): string{
    return Codigo3D.getInstance().cadena_funciones;
  }

  public static clear(): void{
    Codigo3D.getInstance().cadena = '';
    Codigo3D.getInstance().cadena_funciones = '';
  }
}
