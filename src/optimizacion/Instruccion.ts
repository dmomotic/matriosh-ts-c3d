export abstract class Instruccion {
  linea: string;
  codigo: string;

  constructor(linea: string, codigo: string) {
    Object.assign(this, { linea: +linea, codigo});
  }

  abstract optimizar(): string;
}
