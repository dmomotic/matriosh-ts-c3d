"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Traduccion = void 0;
const _ = require("lodash");
const primitivo_1 = require("./expresiones/primitivo");
const dec_id_tipo_exp_1 = require("./instrucciones/declaraciones/dec_id_tipo_exp");
class Traduccion {
    constructor(raiz) {
        Object.assign(this, { raiz, contador: 0, dot: '' });
    }
    traducir() {
        let instrucciones = this.recorrer(this.raiz);
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
                        //if (typeof exp == 'string') return new Id(nodo.linea, exp.toString());
                        //Si es un objeto
                        if (exp instanceof Object)
                            return exp;
                    }
            }
        }
        //NUMBER
        else if (this.soyNodo('NUMBER', nodo)) {
            const str_num = nodo.hijos[0];
            return new primitivo_1.Primitivo(nodo.linea, str_num, 1 /* NUMBER */);
        }
        //STRING
        else if (this.soyNodo('STRING', nodo)) {
            const str = nodo.hijos[0];
            const str2 = str.substr(1, str.length - 2);
            //return new Nativo(nodo.linea, str2);
        }
        // BOOLEAN
        else if (this.soyNodo('BOOLEAN', nodo)) {
            return new primitivo_1.Primitivo(nodo.linea, nodo.hijos[0], 2 /* BOOLEAN */);
        }
        //NULL
        if (this.soyNodo('NULL', nodo)) {
            //return new Nativo(nodo.linea, null);
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
