import { Temporal } from "../generales/temporal";

export class FuncionesPropias{
  getCodigo() : string{
    /**
     * FUNCION PARA IMPRIMIR UN ENTERO
     */
     let codigo = 'void console_log_entero(){\n';
     const temp_pos = Temporal.getSiguiente();
     codigo += `${temp_pos} = P;\n`;
     const temp_val = Temporal.getSiguiente();
     codigo += `${temp_val} = Stack[(int)${temp_pos}];\n`;
     codigo += `printf("%d", (int)${temp_val});\n`;
     codigo += 'return;\n}\n';

    return codigo;
  }
}
