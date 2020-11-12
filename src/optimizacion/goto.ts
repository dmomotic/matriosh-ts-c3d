import { Instruccion } from "./Instruccion";

export class Goto extends Instruccion {
  linea: string;
  codigo: string;

  constructor(linea: string, codigo: string) {
    super(linea, codigo);
  }

  optimizar(): string {
    return this.codigo;
  }
}
