"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traduccion = void 0;
const _ = require("lodash");
const primitivo_1 = require("./expresiones/primitivo");
const nodoAST_1 = require("./generales/nodoAST");
const tablaSimbolos_1 = require("./generales/tablaSimbolos");
const dec_id_tipo_exp_1 = require("./instrucciones/declaraciones/dec_id_tipo_exp");
const temporal_1 = require("./generales/temporal");
const etiqueta_1 = require("./generales/etiqueta");
const codigo3D_1 = require("./generales/codigo3D");
const heap_1 = require("./estructuras/heap");
const stack_1 = require("./estructuras/stack");
const id_1 = require("./expresiones/id");
const console_log_1 = require("./instrucciones/console_log");
const If_1 = require("./estructuras/If");
const instruccion_if_1 = require("./instrucciones/condicionales/instruccion_if");
const suma_1 = require("./expresiones/aritmeticas/suma");
const resta_1 = require("./expresiones/aritmeticas/resta");
const errores_1 = require("../arbol/errores");
const multiplicacion_1 = require("./expresiones/aritmeticas/multiplicacion");
const division_1 = require("./expresiones/aritmeticas/division");
const modular_1 = require("./expresiones/aritmeticas/modular");
const mayor_que_1 = require("./expresiones/relacionales/mayor_que");
const mayor_igual_que_1 = require("./expresiones/relacionales/mayor_igual_que");
const menor_que_1 = require("./expresiones/relacionales/menor_que");
const menor_igual_que_1 = require("./expresiones/relacionales/menor_igual_que");
const potencia_1 = require("./expresiones/aritmeticas/potencia");
const and_1 = require("./expresiones/logica/and");
const or_1 = require("./expresiones/logica/or");
const not_1 = require("./expresiones/logica/not");
const umenos_1 = require("./expresiones/aritmeticas/umenos");
const igual_que_1 = require("./expresiones/relacionales/igual_que");
const dec_funcion_1 = require("./instrucciones/declaraciones/dec_funcion");
const llamada_funcion_1 = require("./expresiones/llamada_funcion");
const return_1 = require("./instrucciones/flujo/return");
const variable_1 = require("./generales/variable");
const break_1 = require("./instrucciones/flujo/break");
const case_1 = require("./estructuras/case");
const switch_1 = require("./instrucciones/condicionales/switch");
const asignacion_id_1 = require("./instrucciones/asignaciones/asignacion_id");
const length_1 = require("./expresiones/length/length");
const char_at_1 = require("./expresiones/charAt/char_at");
class Traduccion {
    constructor(raiz) {
        Object.assign(this, { raiz, contador: 0, dot: '' });
    }
    traducir() {
        errores_1.Errores.clear();
        stack_1.Stack.clear();
        heap_1.Heap.clear();
        temporal_1.Temporal.clear();
        etiqueta_1.Etiqueta.clear();
        codigo3D_1.Codigo3D.clear();
        let instrucciones = this.recorrer(this.raiz);
        const ts_global = new tablaSimbolos_1.TablaSimbolos();
        instrucciones.forEach((instruccion) => {
            if (instruccion instanceof nodoAST_1.NodoAST) {
                instruccion.traducir(ts_global);
            }
        });
        this.reservarGlobalesEnHeap();
        codigo3D_1.Codigo3D.addInit('void main()\n{');
        codigo3D_1.Codigo3D.addInit(codigo3D_1.Codigo3D.getCodigoFunciones());
        //Codigo3D.addInit((new FuncionesPropias()).getCodigo());
        codigo3D_1.Codigo3D.add('return;');
        codigo3D_1.Codigo3D.add('}');
        this.generarEncabezado();
        return codigo3D_1.Codigo3D.getCodigo();
    }
    generarEncabezado() {
        let encabezado = '#include <stdio.h>\n';
        encabezado += '#include <math.h>\n\n';
        encabezado += 'double Heap[16384];\n';
        encabezado += 'double Stack[16384];\n';
        encabezado += 'double P;\n';
        encabezado += 'double H;\n';
        const ultimo = temporal_1.Temporal.getIndex();
        let temporales = '\n';
        for (let i = 0; i < ultimo; i++) {
            if (i == 0) {
                temporales += 'double ';
            }
            temporales += 't' + i;
            //Si es el ultimo
            if (i == ultimo - 1) {
                temporales += ';\n';
            }
            //Si no es el ultimo
            else {
                temporales += ', ';
            }
        }
        codigo3D_1.Codigo3D.addInit(encabezado + temporales);
    }
    reservarGlobalesEnHeap() {
        const ultimo = heap_1.Heap.getIndex();
        let c3d = '/***** Reserva de memoria para variables globales ******/\n';
        for (let i = 0; i < ultimo; i++) {
            c3d += 'H = H + 1;\n';
        }
        codigo3D_1.Codigo3D.addInit(c3d);
    }
    getDot() {
        this.contador = 0;
        this.dot = "digraph G {\n";
        if (this.raiz != null) {
            this.generacionDot(this.raiz);
        }
        this.dot += "\n}";
        return this.dot;
    }
    generacionDot(nodo) {
        if (nodo instanceof Object) {
            let idPadre = this.contador;
            this.dot += `node${idPadre}[label="${this.getStringValue(nodo.label)}"];\n`;
            if (nodo.hasOwnProperty("hijos")) {
                nodo.hijos.forEach((nodoHijo) => {
                    let idHijo = ++this.contador;
                    this.dot += `node${idPadre} -> node${idHijo};\n`;
                    if (nodoHijo instanceof Object) {
                        this.generacionDot(nodoHijo);
                    }
                    else {
                        this.dot += `node${idHijo}[label="${this.getStringValue(nodoHijo)}"];`;
                    }
                });
            }
        }
    }
    getStringValue(label) {
        if (label.startsWith("\"") || label.startsWith("'") || label.startsWith("`")) {
            return label.substr(1, label.length - 2);
        }
        return label;
    }
    recorrer(nodo) {
        var _a;
        //S  ---->  [nodosAST...]
        if (this.soyNodo('S', nodo)) {
            return this.recorrer(nodo.hijos[0]);
        }
        //INSTRUCCIONES  ---->  [nodosAST...]
        else if (this.soyNodo('INSTRUCCIONES', nodo)) {
            let instrucciones = [];
            nodo.hijos.forEach((nodoHijo) => {
                if (nodoHijo instanceof Object) {
                    const res = this.recorrer(nodoHijo);
                    if (res instanceof Array) {
                        instrucciones = instrucciones.concat(res);
                    }
                    else {
                        instrucciones.push(res);
                    }
                }
            });
            return instrucciones;
        }
        //TIPO_DEC_VARIABLE  ---->  boolean que indica si es reasignable
        else if (this.soyNodo('TIPO_DEC_VARIABLE', nodo)) {
            const tipo = nodo.hijos[0];
            return tipo == 'let'; //Boolean para indicar si es reasignable
        }
        //DECLARACION_VARIABLE  ---->  [nodosAST...]
        else if (this.soyNodo('DECLARACION_VARIABLE', nodo)) {
            //TIPO_DEC_VARIABLE LISTA_DECLARACIONES punto_coma
            const reasignable = this.recorrer(nodo.hijos[0]);
            const lista_declaraciones = this.recorrer(nodo.hijos[1]);
            const lista_instrucciones = [];
            lista_declaraciones.forEach((item) => {
                var _a;
                const linea = nodo.linea;
                const id = item['id'];
                //{ id, tipo, exp, type_generador? }
                if (_.has(item, 'id') && _.has(item, 'tipo') && _.has(item, 'exp')) {
                    const tipo = item['tipo'];
                    const exp = item['exp'];
                    const type_generador = (_a = item['type_generador']) !== null && _a !== void 0 ? _a : null;
                    lista_instrucciones.push(new dec_id_tipo_exp_1.DecIdTipoExp(nodo.linea, reasignable, id, tipo, exp, type_generador));
                }
                //{id, tipo, type_generador? }
                else if (_.has(item, 'id') && _.has(item, 'tipo')) {
                }
            });
            return lista_instrucciones;
        }
        //LISTA_DECLARACIONES
        else if (this.soyNodo('LISTA_DECLARACIONES', nodo)) {
            const lista_declaraciones = [];
            nodo.hijos.forEach((nodoHijo) => {
                if (nodoHijo instanceof Object) {
                    lista_declaraciones.push(this.recorrer(nodoHijo));
                }
            });
            return lista_declaraciones;
        }
        //DEC_ID_TIPO  ---->  { id, tipo, type_generador? }
        else if (this.soyNodo('DEC_ID_TIPO', nodo)) {
            //id dos_puntos TIPO_VARIABLE_NATIVA
            const id = nodo.hijos[0];
            // { tipo, type_generador? }
            const tipo = this.recorrer(nodo.hijos[2]);
            return Object.assign({ id }, tipo);
        }
        //DEC_ID_TIPO_EXP  ---->  { id, tipo, exp, type_generador? }
        else if (this.soyNodo('DEC_ID_TIPO_EXP', nodo)) {
            //id dos_puntos TIPO_VARIABLE_NATIVA igual EXP
            const id = nodo.hijos[0];
            const tipo = this.recorrer(nodo.hijos[2]);
            const exp = this.recorrer(nodo.hijos[4]);
            return Object.assign(Object.assign({ id }, tipo), { exp });
        }
        //TIPO_VARIABLE_NATIVA  ---->  { tipo, type_generador? }
        else if (this.soyNodo('TIPO_VARIABLE_NATIVA', nodo)) {
            if (nodo.hijos[0] == 'string') {
                return { tipo: 0 /* STRING */ };
            }
            if (nodo.hijos[0] == 'number') {
                return { tipo: 1 /* NUMBER */ };
            }
            if (nodo.hijos[0] == 'boolean') {
                return { tipo: 2 /* BOOLEAN */ };
            }
            if (nodo.hijos[0] == 'void') {
                return { tipo: 5 /* VOID */ };
            }
            return { tipo: 3 /* TYPE */, type_generador: this.recorrer(nodo.hijos[0]) };
        }
        //ID
        else if (this.soyNodo('ID', nodo)) {
            return nodo.hijos[0];
        }
        //EXP
        else if (this.soyNodo('EXP', nodo)) {
            switch (nodo.hijos.length) {
                case 1:
                    {
                        const exp = this.recorrer(nodo.hijos[0]);
                        ;
                        //Si es un string es una llamada a un id de variable
                        if (typeof exp == 'string')
                            return new id_1.Id(nodo.linea, exp);
                        //Si es un objeto
                        if (exp instanceof Object)
                            return exp;
                    }
                case 2:
                    /*****************************
                     * OPERACIONES ARITMENTICAS
                     *****************************/
                    //menos EXP
                    if (nodo.hijos[0] == '-' && this.soyNodo('EXP', nodo.hijos[1])) {
                        const exp = this.recorrer(nodo.hijos[1]);
                        return new umenos_1.UMenos(nodo.linea, exp);
                    }
                    /*****************************
                     * OPERACIONES LOGICAS
                     *****************************/
                    //not EXP
                    if (nodo.hijos[0] == '!' && this.soyNodo('EXP', nodo.hijos[1])) {
                        const exp = this.recorrer(nodo.hijos[1]);
                        return new not_1.Not(nodo.linea, exp);
                    }
                case 3:
                    /*****************************
                     * OPERACIONES ARITMENTICAS
                     *****************************/
                    //EXP mas EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '+' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new suma_1.Suma(nodo.linea, op_izq, op_der);
                    }
                    //EXP menos EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '-' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new resta_1.Resta(nodo.linea, op_izq, op_der);
                    }
                    //EXP por EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '*' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new multiplicacion_1.Multiplicacion(nodo.linea, op_izq, op_der);
                    }
                    //EXP div EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '/' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new division_1.Division(nodo.linea, op_izq, op_der);
                    }
                    //EXP mod EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '%' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new modular_1.Modular(nodo.linea, op_izq, op_der);
                    }
                    //EXP potencia EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '**' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new potencia_1.Potencia(nodo.linea, op_izq, op_der);
                    }
                    /*****************************
                     * OPERACIONES RELACIONALES
                     *****************************/
                    //EXP mayor EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '>' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new mayor_que_1.MayorQue(nodo.linea, op_izq, op_der);
                    }
                    //EXP mayor_igual EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '>=' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new mayor_igual_que_1.MayorIgualQue(nodo.linea, op_izq, op_der);
                    }
                    //EXP menor EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '<' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new menor_que_1.MenorQue(nodo.linea, op_izq, op_der);
                    }
                    //EXP menor_igual EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '<=' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new menor_igual_que_1.MenorIgualQue(nodo.linea, op_izq, op_der);
                    }
                    //EXP igual_que EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '==' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new igual_que_1.IgualQue(nodo.linea, op_izq, op_der);
                    }
                    /*****************************
                     * OPERACIONES LOGICAS
                     *****************************/
                    //EXP and EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '&&' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new and_1.And(nodo.linea, op_izq, op_der);
                    }
                    //EXP or EXP
                    if (this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '||' && this.soyNodo('EXP', nodo.hijos[2])) {
                        const op_izq = this.recorrer(nodo.hijos[0]);
                        const op_der = this.recorrer(nodo.hijos[2]);
                        return new or_1.Or(nodo.linea, op_izq, op_der);
                    }
            }
        }
        //NUMBER
        else if (this.soyNodo('NUMBER', nodo)) {
            const str_num = nodo.hijos[0];
            const tipo = str_num.includes('.') ? 7 /* FLOAT */ : 6 /* INT */;
            return new primitivo_1.Primitivo(nodo.linea, str_num, tipo);
        }
        //STRING
        else if (this.soyNodo('STRING', nodo)) {
            const str = nodo.hijos[0];
            const str2 = str.substr(1, str.length - 2);
            return new primitivo_1.Primitivo(nodo.linea, str2, 0 /* STRING */);
        }
        // BOOLEAN
        else if (this.soyNodo('BOOLEAN', nodo)) {
            const valor = nodo.hijos[0] == 'true' ? '1' : '0';
            return new primitivo_1.Primitivo(nodo.linea, valor, 2 /* BOOLEAN */);
        }
        //NULL
        else if (this.soyNodo('NULL', nodo)) {
            return new primitivo_1.Primitivo(nodo.linea, null, 8 /* NULL */);
        }
        //CONSOLE_LOG
        else if (this.soyNodo('CONSOLE_LOG', nodo)) {
            //console punto log par_izq LISTA_EXPRESIONES par_der punto_coma
            const exps = this.recorrer(nodo.hijos[4]);
            return new console_log_1.ConsoleLog(nodo.linea, exps);
        }
        //LISTA_EXPRESIONES  ---->  [exp...]
        else if (this.soyNodo('LISTA_EXPRESIONES', nodo)) {
            const exps = [];
            nodo.hijos.forEach((hijo) => {
                if (hijo instanceof Object) {
                    const resp = this.recorrer(hijo);
                    //Si es una respuesta valida
                    if (resp) {
                        exps.push(resp);
                    }
                }
            });
            return exps;
        }
        //INSTRUCCION_IF  ---->  InstruccionIf(nodo.linea, [If])
        else if (this.soyNodo('INSTRUCCION_IF', nodo)) {
            switch (nodo.hijos.length) {
                //IF
                case 1: {
                    const inst_if = this.recorrer(nodo.hijos[0]);
                    return new instruccion_if_1.InstruccionIf(nodo.linea, [inst_if]);
                }
                case 2:
                    //IF ELSE
                    if (this.soyNodo('IF', nodo.hijos[0]) && this.soyNodo('ELSE', nodo.hijos[1])) {
                        const inst_if = this.recorrer(nodo.hijos[0]);
                        const inst_else = this.recorrer(nodo.hijos[1]);
                        return new instruccion_if_1.InstruccionIf(nodo.linea, [inst_if, inst_else]);
                    }
                    //IF LISTA_ELSE_IF
                    if (this.soyNodo('IF', nodo.hijos[0]) && this.soyNodo('LISTA_ELSE_IF', nodo.hijos[1])) {
                        const inst_if = this.recorrer(nodo.hijos[0]);
                        const lista_ifs = this.recorrer(nodo.hijos[1]);
                        return new instruccion_if_1.InstruccionIf(nodo.linea, [inst_if, ...lista_ifs]);
                    }
                case 3:
                    //IF LISTA_ELSE_IF ELSE
                    if (this.soyNodo('IF', nodo.hijos[0]) && this.soyNodo('LISTA_ELSE_IF', nodo.hijos[1]) && this.soyNodo('ELSE', nodo.hijos[2])) {
                        const inst_if = this.recorrer(nodo.hijos[0]);
                        const lista_ifs = this.recorrer(nodo.hijos[1]);
                        const inst_else = this.recorrer(nodo.hijos[2]);
                        return new instruccion_if_1.InstruccionIf(nodo.linea, [inst_if, ...lista_ifs, inst_else]);
                    }
            }
        }
        //IF  ---->  If(condicion, instrucciones)
        else if (this.soyNodo('IF', nodo)) {
            //if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der
            const condicion = this.recorrer(nodo.hijos[2]);
            const instrucciones = this.recorrer(nodo.hijos[5]);
            return new If_1.If(condicion, instrucciones);
        }
        //ELSE_IF  ---->  If(condicion, instrucciones)
        else if (this.soyNodo('ELSE_IF', nodo)) {
            //else if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der
            const condicion = this.recorrer(nodo.hijos[3]);
            const instrucciones = this.recorrer(nodo.hijos[6]);
            return new If_1.If(condicion, instrucciones);
        }
        //ELSE  ---->  If(null, instrucciones)
        else if (this.soyNodo('ELSE', nodo)) {
            //else llave_izq INSTRUCCIONES llave_der
            const instrucciones = this.recorrer(nodo.hijos[2]);
            return new If_1.If(null, instrucciones);
        }
        //LISTA_ELSE_IF  ---->  [ If(null, instrucciones) ]
        else if (this.soyNodo('LISTA_ELSE_IF', nodo)) {
            const lista_ifs = [];
            nodo.hijos.forEach((nodoHijo) => {
                const inst_if = this.recorrer(nodoHijo);
                if (inst_if != null && inst_if instanceof If_1.If) {
                    lista_ifs.push(inst_if);
                }
            });
            return lista_ifs;
        }
        //DECLARACION_FUNCION  ---->  DecFuncion
        else if (this.soyNodo('DECLARACION_FUNCION', nodo)) {
            const id = nodo.hijos[1];
            switch (nodo.hijos.length) {
                //function id par_izq par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der
                case 9: {
                    //{ tipo, type_generador? }
                    const tipo_funcion = this.recorrer(nodo.hijos[5]);
                    const instrucciones = this.recorrer(nodo.hijos[7]);
                    const linea = nodo.linea;
                    const tipo = tipo_funcion.tipo;
                    const referencia = tipo_funcion.type_generador;
                    return new dec_funcion_1.DecFuncion({ linea, id, tipo, referencia, instrucciones });
                }
                case 10:
                    //function id par_izq LISTA_PARAMETROS par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der
                    if (this.soyNodo('LISTA_PARAMETROS', nodo.hijos[3]) && this.soyNodo('TIPO_VARIABLE_NATIVA', nodo.hijos[6]) && this.soyNodo('INSTRUCCIONES', nodo.hijos[8])) {
                        const parametros = this.recorrer(nodo.hijos[3]);
                        const tipo_funcion = this.recorrer(nodo.hijos[6]);
                        const instrucciones = this.recorrer(nodo.hijos[8]);
                        const linea = nodo.linea;
                        const tipo = tipo_funcion.tipo;
                        const referencia = tipo_funcion.type_generador;
                        return new dec_funcion_1.DecFuncion({ linea, id, tipo, referencia, parametros, instrucciones });
                    }
            }
        }
        //LISTA_PARAMETROS  ---->  [Variable...]
        else if (this.soyNodo('LISTA_PARAMETROS', nodo)) {
            const lista = [];
            nodo.hijos.forEach((nodoHijo) => {
                if (nodoHijo instanceof Object) {
                    const variable = this.recorrer(nodoHijo);
                    //Si es valida
                    if (variable) {
                        lista.push(variable);
                    }
                }
            });
            return lista;
        }
        //PARAMETRO  ---->  Variable
        else if (this.soyNodo('PARAMETRO', nodo)) {
            const id = nodo.hijos[0];
            const reasignable = true;
            switch (nodo.hijos.length) {
                //id dos_puntos TIPO_VARIABLE_NATIVA
                case 3: {
                    //{ tipo, type_generador? }
                    const tipo_variable_nativa = this.recorrer(nodo.hijos[2]);
                    const tipo = tipo_variable_nativa.tipo;
                    const referencia = (_a = tipo_variable_nativa.type_generador) !== null && _a !== void 0 ? _a : null;
                    return new variable_1.Variable({ id, tipo, reasignable, referencia });
                }
            }
        }
        //LLAMADA_FUNCION
        else if (this.soyNodo('LLAMADA_FUNCION', nodo)) {
            const id = nodo.hijos[0];
            switch (nodo.hijos.length) {
                //id par_izq par_der punto_coma
                case 4:
                    return new llamada_funcion_1.LlamadaFuncion(nodo.linea, id);
                //id par_izq LISTA_EXPRESIONES par_der punto_coma
                case 5:
                    const lista_exps = this.recorrer(nodo.hijos[2]);
                    return new llamada_funcion_1.LlamadaFuncion(nodo.linea, id, lista_exps);
            }
        }
        //LLAMADA_FUNCION_EXP
        else if (this.soyNodo('LLAMADA_FUNCION_EXP', nodo)) {
            const id = nodo.hijos[0];
            switch (nodo.hijos.length) {
                //id par_izq par_der
                case 3:
                    return new llamada_funcion_1.LlamadaFuncion(nodo.linea, id);
                //id par_izq LISTA_EXPRESIONES par_der
                case 4:
                    const lista_exps = this.recorrer(nodo.hijos[2]);
                    return new llamada_funcion_1.LlamadaFuncion(nodo.linea, id, lista_exps);
            }
        }
        //RETURN
        else if (this.soyNodo('RETURN', nodo)) {
            switch (nodo.hijos.length) {
                //return EXP punto_coma
                case 3:
                    const exp = this.recorrer(nodo.hijos[1]);
                    return new return_1.Return(nodo.linea, exp);
                //return punto_coma
                case 2:
                    return new return_1.Return(nodo.linea);
            }
        }
        //BREAK
        else if (this.soyNodo('BREAK', nodo)) {
            //break punto_coma
            return new break_1.Break(nodo.linea);
        }
        //DEFAULT
        else if (this.soyNodo('DEFAULT', nodo)) {
            //default dos_puntos INSTRUCCIONES
            const instrucciones = this.recorrer(nodo.hijos[2]);
            return new case_1.Case(null, instrucciones, true);
        }
        //CASE
        else if (this.soyNodo('CASE', nodo)) {
            //case EXP dos_puntos INSTRUCCIONES
            const exp = this.recorrer(nodo.hijos[1]);
            const instrucciones = this.recorrer(nodo.hijos[3]);
            return new case_1.Case(exp, instrucciones);
        }
        //LISTA_CASE  ---->  [Case...]
        else if (this.soyNodo('LISTA_CASE', nodo)) {
            const cases = [];
            nodo.hijos.forEach((nodoHijo) => {
                if (nodoHijo instanceof Object) {
                    const caso = this.recorrer(nodoHijo);
                    if (caso) {
                        cases.push(caso);
                    }
                }
            });
            return cases;
        }
        //SWITCH
        else if (this.soyNodo('SWITCH', nodo)) {
            //switch par_izq EXP par_der llave_izq LISTA_CASE llave_der
            const exp = this.recorrer(nodo.hijos[2]);
            const cases = this.recorrer(nodo.hijos[5]);
            return new switch_1.Switch(nodo.linea, exp, cases);
        }
        //ASIGNACION
        else if (this.soyNodo('ASIGNACION', nodo)) {
            switch (nodo.hijos.length) {
                case 4:
                    //id TIPO_IGUAL EXP punto_coma
                    if (this.soyNodo('TIPO_IGUAL', nodo.hijos[1]) && this.soyNodo('EXP', nodo.hijos[2])) {
                        const id = nodo.hijos[0];
                        const tipo_igual = this.recorrer(nodo.hijos[1]);
                        const exp = this.recorrer(nodo.hijos[2]);
                        return new asignacion_id_1.AsignacionId(nodo.linea, id, tipo_igual, exp);
                    }
            }
        }
        //TIPO_IGUAL  ---->  '=' | '+=' | '-='
        else if (this.soyNodo('TIPO_IGUAL', nodo)) {
            //igual - mas igual - menos igual
            if (nodo.hijos.length == 1)
                return nodo.hijos[0];
            else
                return `${nodo.hijos[0]}${nodo.hijos[1]}`;
        }
        //LENGTH
        else if (this.soyNodo('LENGTH', nodo)) {
            switch (nodo.hijos.length) {
                case 3:
                    //STRING punto length
                    if (this.soyNodo('STRING', nodo.hijos[0])) {
                        const exp = this.recorrer(nodo.hijos[0]);
                        return new length_1.Length({ linea: nodo.linea, exp });
                    }
                    //id punto length
                    else {
                        const id = nodo.hijos[0];
                        return new length_1.Length({ linea: nodo.linea, id });
                    }
                case 5:
                    //par_izq EXP par_der punto length
                    if (this.soyNodo('EXP', nodo.hijos[1])) {
                        const exp = this.recorrer(nodo.hijos[1]);
                        return new length_1.Length({ linea: nodo.linea, exp });
                    }
            }
        }
        //CHAR_AT
        else if (this.soyNodo('CHAR_AT', nodo)) {
            const linea = nodo.linea;
            switch (nodo.hijos.length) {
                case 6:
                    //string punto charat par_izq EXP par_der
                    if (this.soyNodo('STRING', nodo.hijos[0]) && this.soyNodo('EXP', nodo.hijos[4])) {
                        const exp = this.recorrer(nodo.hijos[0]);
                        const pos = this.recorrer(nodo.hijos[4]);
                        return new char_at_1.CharAt({ linea, exp, pos });
                    }
                    //id punto charat par_izq EXP par_der
                    else if (this.soyNodo('EXP', nodo.hijos[4])) {
                        const id = nodo.hijos[0];
                        const pos = this.recorrer(nodo.hijos[4]);
                        return new char_at_1.CharAt({ linea, id, pos });
                    }
                case 8:
                    //par_izq EXP par_der punto charat par_izq EXP par_der
                    const exp = this.recorrer(nodo.hijos[1]);
                    const pos = this.recorrer(nodo.hijos[6]);
                    return new char_at_1.CharAt({ linea, exp, pos });
            }
        }
    }
    /**
   * Funcion para determinar en que tipo de nodo estoy
   * @param label
   * @param nodo
   */
    soyNodo(label, nodo) {
        if (nodo == null || !(nodo instanceof Object)) {
            return false;
        }
        if (nodo.hasOwnProperty('label') && nodo.label != null) {
            return nodo.label === label;
        }
        return false;
    }
}
exports.Traduccion = Traduccion;
