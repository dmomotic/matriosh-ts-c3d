export class Display {

  breaks: string[];
  salto_continue : string;
  valido : boolean;

  constructor(breaks : string[], salto_continue: string, valido: boolean) {
      this.breaks = breaks;
      this.salto_continue = salto_continue;
      this.valido = valido;
  }

}
