import * as _ from 'lodash';
import { Primitivo } from './expresiones/primitivo';
import { NodoAST } from './generales/nodoAST';
import { TablaSimbolos } from './generales/tablaSimbolos';
import { TIPO_DATO } from "./generales/tipos";
import { DecIdTipoExp } from './instrucciones/declaraciones/dec_id_tipo_exp';
import { Temporal } from './generales/temporal';
import { Etiqueta } from './generales/etiqueta';
import { Codigo3D } from './generales/codigo3D';
import { Heap } from './estructuras/heap';
import { Stack } from './estructuras/stack';
import { FuncionesPropias } from './utils/funciones_propias';
import { Id } from './expresiones/id';
import { ConsoleLog } from './instrucciones/console_log';
import { If } from './estructuras/If';
import { InstruccionIf } from './instrucciones/condicionales/instruccion_if';
import { Suma } from './expresiones/aritmeticas/suma';
import { Resta } from './expresiones/aritmeticas/resta';
import { Errores } from '../arbol/errores';
import { Multiplicacion } from './expresiones/aritmeticas/multiplicacion';
import { Division } from './expresiones/aritmeticas/division';
import { Modular } from './expresiones/aritmeticas/modular';
import { MayorQue } from './expresiones/relacionales/mayor_que';
import { MayorIgualQue } from './expresiones/relacionales/mayor_igual_que';
import { MenorQue } from './expresiones/relacionales/menor_que';
import { MenorIgualQue } from './expresiones/relacionales/menor_igual_que';
import { Potencia } from './expresiones/aritmeticas/potencia';

export class Traduccion {
  raiz: Object;
  contador: number;
  dot: string;

  constructor(raiz: Object) {
    Object.assign(this, { raiz, contador: 0, dot: '' });
  }

  traducir(): string {
    Errores.clear();
    Stack.clear();
    Heap.clear();
    Temporal.clear();
    Etiqueta.clear();
    Codigo3D.clear();
    let instrucciones = this.recorrer(this.raiz);
    const ts_global = new TablaSimbolos();
    instrucciones.forEach((instruccion : any) => {
      if(instruccion instanceof NodoAST){
        instruccion.traducir(ts_global);
      }
    });

    this.reservarGlobalesEnHeap();
    Codigo3D.addInit('void main()\n{');
    //Codigo3D.addInit((new FuncionesPropias()).getCodigo());
    Codigo3D.add('return;');
    Codigo3D.add('}');
    this.generarEncabezado();
    return Codigo3D.getCodigo();
  }

  generarEncabezado(): void {
    let encabezado = '#include <stdio.h>\n';
    encabezado += '#include <math.h>\n\n';
    encabezado += 'double Heap[16384];\n';
    encabezado += 'double Stack[16384];\n';
    encabezado += 'double P;\n';
    encabezado += 'double H;\n';
    const ultimo: number = Temporal.getIndex();
    let temporales = '\n';
    for(let i: number = 0; i < ultimo; i++){
      if(i == 0){
        temporales += 'double ';
      }
      temporales += 't'+i;
      //Si es el ultimo
      if(i == ultimo - 1){
        temporales += ';\n'
      }
      //Si no es el ultimo
      else{
        temporales += ', '
      }
    }
    Codigo3D.addInit(encabezado + temporales);
  }

  reservarGlobalesEnHeap() : void{
    const ultimo = Heap.getIndex();

    let c3d = '/***** Reserva de memoria para variables globales ******/\n';
    for(let i : number = 0; i < ultimo; i++){
      c3d += 'H = H + 1;\n';
    }
    Codigo3D.addInit(c3d);
  }

  getDot(): string {
    this.contador = 0;
    this.dot = "digraph G {\n";
    if (this.raiz != null) {
      this.generacionDot(this.raiz);
    }
    this.dot += "\n}";
    return this.dot;
  }

  generacionDot(nodo: any): void {
    if (nodo instanceof Object) {
      let idPadre = this.contador;
      this.dot += `node${idPadre}[label="${this.getStringValue(nodo.label)}"];\n`;
      if (nodo.hasOwnProperty("hijos")) {
        nodo.hijos.forEach((nodoHijo: any) => {
          let idHijo = ++this.contador;
          this.dot += `node${idPadre} -> node${idHijo};\n`;
          if (nodoHijo instanceof Object) {
            this.generacionDot(nodoHijo);
          } else {
            this.dot += `node${idHijo}[label="${this.getStringValue(nodoHijo)}"];`;
          }
        });
      }
    }
  }

  getStringValue(label: string): string {
    if (label.startsWith("\"") || label.startsWith("'") || label.startsWith("`")) {
      return label.substr(1, label.length - 2);
    }
    return label;
  }

  recorrer(nodo: any): any {
    //S  ---->  [nodosAST...]
    if (this.soyNodo('S', nodo)) {
      return this.recorrer(nodo.hijos[0]);
    }

    //INSTRUCCIONES  ---->  [nodosAST...]
    else if (this.soyNodo('INSTRUCCIONES', nodo)) {
      let instrucciones = [];
      nodo.hijos.forEach((nodoHijo: any) => {
        if (nodoHijo instanceof Object) {
          const res = this.recorrer(nodoHijo);
          if(res instanceof Array){
            instrucciones = instrucciones.concat(res);
          }else{
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
      const reasignable = this.recorrer(nodo.hijos[0]) as boolean;
      const lista_declaraciones = this.recorrer(nodo.hijos[1]) as Array<Object>;
      const lista_instrucciones = [];
      lista_declaraciones.forEach((item: Object) => {
        const linea = nodo.linea;
        const id = item['id'];
        //{ id, tipo, exp, type_generador? }
        if (_.has(item, 'id') && _.has(item, 'tipo') && _.has(item, 'exp')) {
          const tipo = item['tipo'];
          const exp = item['exp'];
          const type_generador = item['type_generador'] ?? null;
          lista_instrucciones.push(new DecIdTipoExp(nodo.linea, reasignable, id, tipo, exp, type_generador));
        }
        //{id, tipo, type_generador? }
        else if (_.has(item, 'id') && _.has(item, 'tipo')) {

        }
      })
      return lista_instrucciones;
    }

    //LISTA_DECLARACIONES
    else if (this.soyNodo('LISTA_DECLARACIONES', nodo)) {
      const lista_declaraciones = [];
      nodo.hijos.forEach((nodoHijo: any) => {
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
      return { id, ...tipo };
    }

    //DEC_ID_TIPO_EXP  ---->  { id, tipo, exp, type_generador? }
    else if(this.soyNodo('DEC_ID_TIPO_EXP', nodo)) {
      //id dos_puntos TIPO_VARIABLE_NATIVA igual EXP
      const id = nodo.hijos[0];
      const tipo = this.recorrer(nodo.hijos[2]);
      const exp = this.recorrer(nodo.hijos[4]);
      return {id, ...tipo, exp};
    }

    //TIPO_VARIABLE_NATIVA  ---->  { tipo, type_generador? }
    else if (this.soyNodo('TIPO_VARIABLE_NATIVA', nodo)) {
      if (nodo.hijos[0] == 'string') {
        return { tipo: TIPO_DATO.STRING };
      }
      if (nodo.hijos[0] == 'number') {
        return { tipo: TIPO_DATO.NUMBER };
      }
      if (nodo.hijos[0] == 'boolean') {
        return { tipo: TIPO_DATO.BOOLEAN };
      }
      if (nodo.hijos[0] == 'void') {
        return { tipo: TIPO_DATO.VOID };
      }
      return { tipo: TIPO_DATO.TYPE, type_generador: this.recorrer(nodo.hijos[0]) }
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
            const exp = this.recorrer(nodo.hijos[0]);;
            //Si es un string es una llamada a un id de variable
            if (typeof exp == 'string') return new Id(nodo.linea, exp);

            //Si es un objeto
            if (exp instanceof Object) return exp;
          }
          case 3:
            //EXP mas EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '+' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Suma(nodo.linea, op_izq, op_der);
            }
            //EXP menos EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '-' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Resta(nodo.linea, op_izq, op_der);
            }
            //EXP por EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '*' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Multiplicacion(nodo.linea, op_izq, op_der);
            }
            //EXP div EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '/' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Division(nodo.linea, op_izq, op_der);
            }
            //EXP mod EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '%' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Modular(nodo.linea, op_izq, op_der);
            }
            //EXP potencia EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '**' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new Potencia(nodo.linea, op_izq, op_der);
            }
            //EXP mayor EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '>' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new MayorQue(nodo.linea, op_izq, op_der);
            }
            //EXP mayor_igual EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '>=' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new MayorIgualQue(nodo.linea, op_izq, op_der);
            }
            //EXP menor EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '<' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new MenorQue(nodo.linea, op_izq, op_der);
            }
            //EXP menor_igual EXP
            if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '<=' && this.soyNodo('EXP', nodo.hijos[2])){
              const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
              const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
              return new MenorIgualQue(nodo.linea, op_izq, op_der);
            }
      }
    }

    //NUMBER
    else if (this.soyNodo('NUMBER', nodo)) {
      const str_num = nodo.hijos[0];
      const tipo = str_num.includes('.') ? TIPO_DATO.FLOAT : TIPO_DATO.INT;
      return new Primitivo(nodo.linea, str_num, tipo);
    }

    //STRING
    else if (this.soyNodo('STRING', nodo)) {
      const str = nodo.hijos[0] as string;
      const str2 = str.substr(1, str.length - 2);
      return new Primitivo(nodo.linea, str2, TIPO_DATO.STRING);
    }

    // BOOLEAN
    else if (this.soyNodo('BOOLEAN', nodo)) {
      const valor = nodo.hijos[0] == 'true' ? '1' : '0';
      return new Primitivo(nodo.linea, valor, TIPO_DATO.BOOLEAN);
    }

    //NULL
    else if (this.soyNodo('NULL', nodo)) {
      //return new Nativo(nodo.linea, null);
    }

    //CONSOLE_LOG
    else if(this.soyNodo('CONSOLE_LOG', nodo)){
      //console punto log par_izq LISTA_EXPRESIONES par_der punto_coma
      const exps = this.recorrer(nodo.hijos[4]);
      return new ConsoleLog(nodo.linea, exps);
    }

    //LISTA_EXPRESIONES  ---->  [exp...]
    else if(this.soyNodo('LISTA_EXPRESIONES', nodo)){
      const exps: Array<NodoAST> = [];
      nodo.hijos.forEach((hijo: any) => {
        if(hijo instanceof Object){
          const resp = this.recorrer(hijo);
          //Si es una respuesta valida
          if(resp){
            exps.push(resp);
          }
        }
      });
      return exps;
    }

    //INSTRUCCION_IF  ---->  InstruccionIf(nodo.linea, [If])
    else if(this.soyNodo('INSTRUCCION_IF', nodo)){
      switch(nodo.hijos.length){
        //IF
        case 1: {
          const inst_if : If = this.recorrer(nodo.hijos[0]);
          return new InstruccionIf(nodo.linea, [inst_if]);
        }
        case 2:
          //IF ELSE
          if(this.soyNodo('IF',nodo.hijos[0]) && this.soyNodo('ELSE', nodo.hijos[1])){
            const inst_if : If = this.recorrer(nodo.hijos[0]);
            const inst_else : If = this.recorrer(nodo.hijos[1]);
            return new InstruccionIf(nodo.linea, [inst_if, inst_else]);
          }
      }
    }

    //IF  ---->  If(condicion, instrucciones)
    else if(this.soyNodo('IF', nodo)){
      //if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der
      const condicion : NodoAST = this.recorrer(nodo.hijos[2]);
      const instrucciones : NodoAST[] = this.recorrer(nodo.hijos[5]);
      return new If(condicion, instrucciones);
    }

    //ELSE  ---->  If(null, instrucciones)
    else if(this.soyNodo('ELSE', nodo)){
      //else llave_izq INSTRUCCIONES llave_der
      const instrucciones : NodoAST[] = this.recorrer(nodo.hijos[2]);
      return new If(null, instrucciones);
    }
  }

  /**
 * Funcion para determinar en que tipo de nodo estoy
 * @param label
 * @param nodo
 */
  soyNodo(label: string, nodo: any): boolean {
    if (nodo == null || !(nodo instanceof Object)) {
      return false;
    }
    if (nodo.hasOwnProperty('label') && nodo.label != null) {
      return nodo.label === label;
    }
    return false;
  }
}
