"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FuncionesPropias = void 0;
const etiqueta_1 = require("../generales/etiqueta");
const temporal_1 = require("../generales/temporal");
class FuncionesPropias {
    getCodigo() {
        /**
         * FUNCION PARA CASTEAR INT A STRING
         */
        let codigo = '/***** Funcion para castear de int a string ******/\n';
        const eec1 = etiqueta_1.Etiqueta.getSiguiente();
        const eec2 = etiqueta_1.Etiqueta.getSiguiente();
        const eec3 = etiqueta_1.Etiqueta.getSiguiente();
        const eec4 = etiqueta_1.Etiqueta.getSiguiente();
        const eec5 = etiqueta_1.Etiqueta.getSiguiente();
        const eec6 = etiqueta_1.Etiqueta.getSiguiente();
        const eec7 = etiqueta_1.Etiqueta.getSiguiente();
        const eec8 = etiqueta_1.Etiqueta.getSiguiente();
        const eec9 = etiqueta_1.Etiqueta.getSiguiente();
        const t41 = temporal_1.Temporal.getSiguiente();
        const t39 = temporal_1.Temporal.getSiguiente();
        const t42 = temporal_1.Temporal.getSiguiente();
        const t43 = temporal_1.Temporal.getSiguiente();
        const t44 = temporal_1.Temporal.getSiguiente();
        const t45 = temporal_1.Temporal.getSiguiente();
        const t104 = temporal_1.Temporal.getSiguiente();
        const t46 = temporal_1.Temporal.getSiguiente();
        const t95 = temporal_1.Temporal.getSiguiente();
        const t48 = temporal_1.Temporal.getSiguiente();
        const t40 = temporal_1.Temporal.getSiguiente();
        codigo += `void int_to_string(){\n`;
        codigo += `${t41} = 10;\n`;
        codigo += `${t39} = P + 2;\n`;
        codigo += `${t42} = Stack[(int)${t39}];\n`;
        codigo += `${t43} = Stack[(int)${t39}];\n`;
        codigo += `${t44} = H;\n`;
        codigo += `${t45} = ${t44};\n`;
        codigo += `if(${t42} == 0) goto ${eec1};\n`;
        codigo += `goto ${eec2};\n`;
        codigo += `${eec1}:\n`;
        codigo += `Heap[(int)${t45}] = 48;\n`;
        codigo += `${t45} = ${t45} + 1;\n`;
        codigo += `Heap[(int)${t45}] = -1;\n`;
        codigo += `H = ${t45} + 1;\n`;
        codigo += `goto ${eec3};\n`;
        codigo += `${eec2}:\n`;
        codigo += `if( ${t42} < 0) goto ${eec4};\n`;
        codigo += `goto ${eec5};\n`;
        codigo += `${eec4}:\n`;
        codigo += `Heap[(int)${t45}] = 45;\n`;
        codigo += `${t45} = ${t45} + 1;\n`;
        codigo += `${t104} = 0 - 1;\n`;
        codigo += `${t42} = ${t42} * ${t104};\n`;
        codigo += `${t43} = ${t43} * ${t104};\n`;
        codigo += `${eec5}:\n`;
        codigo += `if( ${t43} >= 1 ) goto ${eec6};\n`;
        codigo += `goto ${eec7};\n`;
        codigo += `${eec6}:\n`;
        codigo += `${t43} = ${t43} / ${t41};\n`;
        codigo += `${t45} = ${t45} + 1;\n`;
        codigo += `goto ${eec5};\n`;
        codigo += `${eec7}:\n`;
        codigo += `H = ${t45} + 1;\n`;
        codigo += `Heap[(int)${t45}] = -1;\n`;
        codigo += `${t45} = ${t45} - 1;\n`;
        codigo += `${eec8}:\n`;
        codigo += `${t46} = fmod(${t42}, ${t41});\n`;
        codigo += `${t95} = 48 + ${t46};\n`;
        codigo += `Heap[(int)${t45}] = ${t95};\n`;
        codigo += `${t45} = ${t45} - 1;\n`;
        codigo += `${t48} = 10 - ${t46};\n`;
        codigo += `${t48} = ${t48} / ${t41};\n`;
        codigo += `${t42} = ${t42} / ${t41};\n`;
        codigo += `${t42} = ${t42} + ${t48};\n`;
        codigo += `${t42} = ${t42} - 1;\n`;
        codigo += `if(${t42} != 0) goto ${eec8};\n`;
        codigo += `goto ${eec9};\n`;
        codigo += `${eec9}:\n`;
        codigo += `${eec3}:\n`;
        codigo += `${t40} = P + 0;\n`;
        codigo += `Stack[(int)${t40}] = ${t44};\n`;
        codigo += `return;\n`;
        codigo += '}\n\n';
        return codigo;
    }
    static getPrintFunctionName() {
        return 'console__log';
    }
}
exports.FuncionesPropias = FuncionesPropias;
