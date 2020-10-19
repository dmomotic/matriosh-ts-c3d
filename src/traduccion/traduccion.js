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
class Traduccion {
    constructor(raiz) {
        Object.assign(this, { raiz, contador: 0, dot: '' });
    }
    traducir() {
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
        //Codigo3D.addInit((new FuncionesPropias()).getCodigo());
        codigo3D_1.Codigo3D.add('return;');
        codigo3D_1.Codigo3D.add('}');
        this.generarEncabezado();
        return codigo3D_1.Codigo3D.getCodigo();
    }
    generarEncabezado() {
        let encabezado = '#include <stdio.h>\n\n';
        encabezado += 'float Heap[16384];\n';
        encabezado += 'float Stack[16384];\n';
        encabezado += 'float P;\n';
        encabezado += 'float H;\n';
        const ultimo = temporal_1.Temporal.getIndex();
        let temporales = '\n';
        for (let i = 0; i < ultimo; i++) {
            if (i == 0) {
                temporales += 'float ';
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
            //return new Nativo(nodo.linea, null);
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
