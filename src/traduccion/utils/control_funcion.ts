import { TIPO_DATO } from "../generales/tipos";
import { Display } from "./display";
import { Tamaño } from "./tamaño";

export class ControlFuncion {
  private static instance: ControlFuncion;

  id: string;
  tipo: TIPO_DATO;
  referencia: string;
  arreglo: boolean;
  temporales: string[];
  displays: Display[];

  private constructor({id = null, tipo = TIPO_DATO.NULL, referencia = null, arreglo = false, temporales = [], displays = []} : {id?: string, retorna?: boolean, saltos_return?: string[], tipo?: TIPO_DATO, referencia?: string, arreglo?: boolean; temporales?: string[], displays?: Display[];}){
    Object.assign(this, {id, tipo, referencia, arreglo, temporales, displays});
  }

  public static setId(id: string): void {
    ControlFuncion.getInstance().id = id;
  }

  public static setTipo(tipo: TIPO_DATO) : void{
    ControlFuncion.getInstance().tipo = tipo;
  }

  public static setReferencia(referencia: string) : void{
    ControlFuncion.getInstance().referencia = referencia;
  }

  private static getInstance() : ControlFuncion{
    if(!ControlFuncion.instance) ControlFuncion.instance = new ControlFuncion({});
    return ControlFuncion.instance;
  }

  public static clear(): void{
    ControlFuncion.instance = new ControlFuncion({});
    Tamaño.clear();
  }

  public static getTemporales() : string[]{
    return ControlFuncion.getInstance().temporales;
  }

  public static getTemporalesLength() : number{
    return ControlFuncion.getTemporales().length;
  }

  public static guardarTemporal(temp: string): void{
    if(!ControlFuncion.getInstance().temporales.includes(temp)){
      Tamaño.aumentar();
      ControlFuncion.getInstance().temporales.push(temp);
    }
  }

  public static removerTemporal(temp: string): void{
    const index = ControlFuncion.getInstance().temporales.indexOf(temp);

    if(index >= 0){
      Tamaño.reducir();
      ControlFuncion.getInstance().temporales.splice(index, 1);
    }
  }

  public static hasReturn() : boolean {
    return ControlFuncion.getInstance().tipo != TIPO_DATO.VOID;
  }

  public static getId() : string {
    return ControlFuncion.getInstance().id;
  }

  public static getTipo() : TIPO_DATO {
    return ControlFuncion.getInstance().tipo;
  }

  public static pushDisplay(display: Display) : void {
    ControlFuncion.getInstance().displays.push(display);
  }

  public static popDisplay() : Display {
    return ControlFuncion.getInstance().displays.pop();
  }

  public static getDisplayLength() : number {
    return ControlFuncion.getInstance().displays.length;
  }
}
