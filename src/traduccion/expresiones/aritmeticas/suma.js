"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Suma = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const stack_1 = require("../../estructuras/stack");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Suma extends nodoAST_1.NodoAST {
    constructor(linea, op_izq, op_der) {
        super(linea);
        Object.assign(this, { op_izq, op_der });
    }
    traducir(ts) {
        const control_izq = this.op_izq.traducir(ts);
        const control_der = this.op_der.traducir(ts);
        //Validaciones
        if (!control_izq) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la suma` }));
            return;
        }
        if (!control_der) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la suma` }));
            return;
        }
        //Comprobacion de tipo
        const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
        if (tipo === 8 /* NULL */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una suma con los tipos ${tipos_1.getNombreDeTipo(control_izq.tipo)} y ${tipos_1.getNombreDeTipo(control_der.tipo)}` }));
            return;
        }
        const temporal = temporal_1.Temporal.getSiguiente();
        //REMUEVO TEMPORALES A UTILIZAR
        control_funcion_1.ControlFuncion.removerTemporal(control_izq.temporal);
        control_funcion_1.ControlFuncion.removerTemporal(control_der.temporal);
        //GUARDO TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(temporal);
        //Logica segun tipo de dato resultante
        switch (tipo) {
            case 7 /* FLOAT */:
                codigo3D_1.Codigo3D.addComentario('Suma con resultado double');
                //float + float, float + int, int + float, float + boolean, boolean + float
                codigo3D_1.Codigo3D.add(`${temporal} = ${control_izq.temporal} + ${control_der.temporal};`);
                return new control_1.Control({ temporal, tipo });
            case 6 /* INT */:
                codigo3D_1.Codigo3D.addComentario('Suma con resultado int');
                //int + int, int + boolean, boolean + int
                codigo3D_1.Codigo3D.add(`${temporal} = ${control_izq.temporal} + ${control_der.temporal};`);
                return new control_1.Control({ temporal, tipo });
            case 0 /* STRING */:
                //float + string
                if (control_izq.tipo == 7 /* FLOAT */ && control_der.tipo == 0 /* STRING */) {
                }
                //string + float
                else if (control_izq.tipo == 0 /* STRING */ && control_der.tipo == 7 /* FLOAT */) {
                }
                //int + string
                else if (control_izq.tipo == 6 /* INT */ && control_der.tipo == 0 /* STRING */) {
                    //Codigo para convertir int en string
                    const temp1 = temporal_1.Temporal.getSiguiente();
                    const temp2 = temporal_1.Temporal.getSiguiente();
                    const temp3 = temporal_1.Temporal.getSiguiente();
                    const temp4 = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp1} = P + ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.add(`${temp2} = ${temp1} + 2;`);
                    codigo3D_1.Codigo3D.add(`Stack[(int)${temp2}] = ${control_izq.temporal};`);
                    codigo3D_1.Codigo3D.add(`P = P + ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.add(`int_to_string();`);
                    codigo3D_1.Codigo3D.add(`${temp3} = P + 0;`);
                    codigo3D_1.Codigo3D.add(`${temp4} = Stack[(int)${temp3}];`);
                    codigo3D_1.Codigo3D.add(`P = P - ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.addComentario('Suma de int y string');
                    //Capturo la posicion libre del Heap
                    codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
                    //TODO: hacer validación de null si fuera posible
                    const temp_val = temporal_1.Temporal.getSiguiente();
                    const temp_pos = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp4};`);
                    //Capturo la posicion inicial del string izquierdo
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //Realizo el ciclo while para llenar el HEAP con el string izquierdo
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    codigo3D_1.Codigo3D.addComentario(`string`);
                    //Realizo el ciclo while para llenar el HEAP con el string derecho
                    const temp_val2 = temporal_1.Temporal.getSiguiente();
                    const temp_pos2 = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${control_der.temporal};`);
                    const lbl_inicial2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false2 = etiqueta_1.Etiqueta.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${lbl_inicial2}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val2} = Heap[(int) ${temp_pos2}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val2} != -1) goto ${lbl_true2};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val2};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${temp_pos2} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false2}:`);
                    //Asigno caracter de escape
                    codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.addComentario(`Fin suma de dos string`);
                    return new control_1.Control({ temporal, tipo });
                }
                //string + int
                else if (control_izq.tipo == 0 /* STRING */ && control_der.tipo == 6 /* INT */) {
                    //Codigo para convertir int en string
                    const temp1 = temporal_1.Temporal.getSiguiente();
                    const temp2 = temporal_1.Temporal.getSiguiente();
                    const temp3 = temporal_1.Temporal.getSiguiente();
                    const temp4 = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp1} = P + ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.add(`${temp2} = ${temp1} + 2;`);
                    codigo3D_1.Codigo3D.add(`Stack[(int)${temp2}] = ${control_der.temporal};`);
                    codigo3D_1.Codigo3D.add(`P = P + ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.add(`int_to_string();`);
                    codigo3D_1.Codigo3D.add(`${temp3} = P + 0;`);
                    codigo3D_1.Codigo3D.add(`${temp4} = Stack[(int)${temp3}];`);
                    codigo3D_1.Codigo3D.add(`P = P - ${stack_1.Stack.getIndex()};`);
                    codigo3D_1.Codigo3D.addComentario('Suma de string e int');
                    //Capturo la posicion libre del Heap
                    codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
                    //TODO: hacer validación de null si fuera posible
                    const temp_val = temporal_1.Temporal.getSiguiente();
                    const temp_pos = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${control_izq.temporal};`);
                    //Capturo la posicion inicial del string izquierdo
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //Realizo el ciclo while para llenar el HEAP con el string izquierdo
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    codigo3D_1.Codigo3D.addComentario(`int`);
                    //Realizo el ciclo while para llenar el HEAP con el string derecho
                    const temp_val2 = temporal_1.Temporal.getSiguiente();
                    const temp_pos2 = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${temp4};`);
                    const lbl_inicial2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false2 = etiqueta_1.Etiqueta.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${lbl_inicial2}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val2} = Heap[(int) ${temp_pos2}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val2} != -1) goto ${lbl_true2};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val2};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${temp_pos2} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false2}:`);
                    //Asigno caracter de escape
                    codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.addComentario(`Fin suma de dos string`);
                    return new control_1.Control({ temporal, tipo });
                }
                //string + boolean
                else if (control_izq.tipo == 0 /* STRING */ && control_der.tipo == 2 /* BOOLEAN */) {
                    codigo3D_1.Codigo3D.addComentario('Suma string y boolean');
                    //Capturo la posicion libre del Heap
                    codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
                    //TODO: hacer validación de null si fuera posible
                    const temp_val = temporal_1.Temporal.getSiguiente();
                    const temp_pos = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${control_izq.temporal};`);
                    //Capturo la posicion inicial del string izquierdo
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //Realizo el ciclo while para llenar el HEAP con el string izquierdo
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    codigo3D_1.Codigo3D.addComentario(`segundo string`);
                    const lbl_true2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_end = etiqueta_1.Etiqueta.getSiguiente();
                    codigo3D_1.Codigo3D.add(`if(${control_der.temporal} == 1) goto ${lbl_true2};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'t'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'r'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'u'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'e'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_end};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'f'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'a'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'l'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'s'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'e'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${lbl_end}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.addComentario(`Fin suma string y boolean`);
                    return new control_1.Control({ temporal, tipo });
                }
                //boolean + string
                else if (control_izq.tipo == 2 /* BOOLEAN */ && control_der.tipo == 0 /* STRING */) {
                    //Capturo la posicion libre del Heap
                    codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
                    //Primer string
                    const lbl_true2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_end = etiqueta_1.Etiqueta.getSiguiente();
                    codigo3D_1.Codigo3D.add(`if(${control_izq.temporal} == 1) goto ${lbl_true2};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'t'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'r'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'u'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'e'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_end};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'f'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'a'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'l'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'s'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${'e'.charCodeAt(0)};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${lbl_end}:`);
                    //Segundo string
                    const temp_val = temporal_1.Temporal.getSiguiente();
                    const temp_pos = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${control_der.temporal};`);
                    //Capturo la posicion inicial del string izquierdo
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //Realizo el ciclo while para llenar el HEAP con el string izquierdo
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    return new control_1.Control({ temporal, tipo });
                }
                //string + string
                else if (control_izq.tipo == 0 /* STRING */ && control_der.tipo == 0 /* STRING */) {
                    codigo3D_1.Codigo3D.addComentario('Suma de dos string');
                    //Capturo la posicion libre del Heap
                    codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde iniciara la cadena`);
                    //TODO: hacer validación de null si fuera posible
                    const temp_val = temporal_1.Temporal.getSiguiente();
                    const temp_pos = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${control_izq.temporal};`);
                    //Capturo la posicion inicial del string izquierdo
                    const lbl_inicial = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                    //Realizo el ciclo while para llenar el HEAP con el string izquierdo
                    codigo3D_1.Codigo3D.add(`${lbl_inicial}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val} = Heap[(int) ${temp_pos}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val} != -1) goto ${lbl_true};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos} = ${temp_pos} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                    codigo3D_1.Codigo3D.addComentario(`segundo string`);
                    //Realizo el ciclo while para llenar el HEAP con el string derecho
                    const temp_val2 = temporal_1.Temporal.getSiguiente();
                    const temp_pos2 = temporal_1.Temporal.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${control_der.temporal};`);
                    const lbl_inicial2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_true2 = etiqueta_1.Etiqueta.getSiguiente();
                    const lbl_false2 = etiqueta_1.Etiqueta.getSiguiente();
                    codigo3D_1.Codigo3D.add(`${lbl_inicial2}:`);
                    codigo3D_1.Codigo3D.add(`${temp_val2} = Heap[(int) ${temp_pos2}];`);
                    codigo3D_1.Codigo3D.add(`if(${temp_val2} != -1) goto ${lbl_true2};`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_false2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_true2}:`);
                    codigo3D_1.Codigo3D.add(`Heap[(int)H]= ${temp_val2};`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.add(`${temp_pos2} = ${temp_pos2} + 1;`);
                    codigo3D_1.Codigo3D.add(`goto ${lbl_inicial2};`);
                    codigo3D_1.Codigo3D.add(`${lbl_false2}:`);
                    //Asigno caracter de escape
                    codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                    codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    codigo3D_1.Codigo3D.addComentario(`Fin suma de dos string`);
                    return new control_1.Control({ temporal, tipo });
                }
        }
    }
    getTipoResultante(t1, t2) {
        //Number - Number
        if (t1 == 7 /* FLOAT */ && t2 == 7 /* FLOAT */)
            return 7 /* FLOAT */;
        if (t1 == 7 /* FLOAT */ && t2 == 6 /* INT */)
            return 7 /* FLOAT */;
        if (t1 == 6 /* INT */ && t2 == 7 /* FLOAT */)
            return 7 /* FLOAT */;
        if (t1 == 6 /* INT */ && t2 == 6 /* INT */)
            return 6 /* INT */;
        //Number - Boolean
        if (t1 == 7 /* FLOAT */ && t2 == 2 /* BOOLEAN */)
            return 7 /* FLOAT */;
        if (t1 == 2 /* BOOLEAN */ && t2 == 7 /* FLOAT */)
            return 7 /* FLOAT */;
        if (t1 == 6 /* INT */ && t2 == 2 /* BOOLEAN */)
            return 6 /* INT */;
        if (t1 == 2 /* BOOLEAN */ && t2 == 6 /* INT */)
            return 6 /* INT */;
        //String - Number
        if (t1 == 7 /* FLOAT */ && t2 == 0 /* STRING */)
            return 0 /* STRING */;
        if (t1 == 0 /* STRING */ && t2 == 7 /* FLOAT */)
            return 0 /* STRING */;
        if (t1 == 6 /* INT */ && t2 == 0 /* STRING */)
            return 0 /* STRING */;
        if (t1 == 0 /* STRING */ && t2 == 6 /* INT */)
            return 0 /* STRING */;
        //String - Boolean
        if (t1 == 0 /* STRING */ && t2 == 2 /* BOOLEAN */)
            return 0 /* STRING */;
        if (t1 == 2 /* BOOLEAN */ && t2 == 0 /* STRING */)
            return 0 /* STRING */;
        //String - String
        if (t1 == 0 /* STRING */ && t2 == 0 /* STRING */)
            return 0 /* STRING */;
        //Solo por seguridad
        if (tipos_1.isTipoNumber(t1) && tipos_1.isTipoNumber(t2))
            return 7 /* FLOAT */;
        //Cualquier otra combinacion
        return 8 /* NULL */;
    }
}
exports.Suma = Suma;
