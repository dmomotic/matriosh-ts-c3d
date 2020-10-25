export class Error {
  tipo: string;
  linea: string;
  descripcion: string;

  constructor({ tipo, linea, descripcion }: { tipo: string, linea: string, descripcion: string }) {
    const valor = tipo == 'semantico' ? +linea + 1 : linea;
    //const valor = linea;
    Object.assign(this, {tipo, linea: valor.toString(), descripcion})
  }
}
