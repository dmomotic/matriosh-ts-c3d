"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuncionesPropias = void 0;
const temporal_1 = require("../generales/temporal");
class FuncionesPropias {
    getCodigo() {
        /**
         * FUNCION PARA IMPRIMIR UN ENTERO
         */
        let codigo = 'void console_log_entero(){\n';
        const temp_pos = temporal_1.Temporal.getSiguiente();
        codigo += `${temp_pos} = P;\n`;
        const temp_val = temporal_1.Temporal.getSiguiente();
        codigo += `${temp_val} = Stack[(int)${temp_pos}];\n`;
        codigo += `printf("%d", (int)${temp_val});\n`;
        codigo += 'return;\n}\n';
        return codigo;
    }
}
exports.FuncionesPropias = FuncionesPropias;
