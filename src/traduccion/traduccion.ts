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
import { And } from './expresiones/logica/and';
import { Or } from './expresiones/logica/or';
import { Not } from './expresiones/logica/not';
import { UMenos } from './expresiones/aritmeticas/umenos';
import { IgualQue } from './expresiones/relacionales/igual_que';
import { DecFuncion } from './instrucciones/declaraciones/dec_funcion';
import { LlamadaFuncion } from './expresiones/llamada_funcion';
import { Return } from './instrucciones/flujo/return';
import { Variable } from './generales/variable';
import { Break } from './instrucciones/flujo/break';
import { Case } from './estructuras/case';
import { Switch } from './instrucciones/condicionales/switch';
import { AsignacionId } from './instrucciones/asignaciones/asignacion_id';
import { Length } from './expresiones/cadenas/length';
import { CharAt } from './expresiones/cadenas/char_at';
import { ToUpperCase } from './expresiones/cadenas/to_upper_case';
import { ToLowerCase } from './expresiones/cadenas/to_lower_case';
import { Concat } from './expresiones/cadenas/concat';
import { While } from './instrucciones/ciclos/while';
import { Incremento } from './expresiones/aritmeticas/incremento';
import { Decremento } from './expresiones/aritmeticas/decremento';
import { DoWhile } from './instrucciones/ciclos/do_while';

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
    Codigo3D.addInit(Codigo3D.getCodigoFunciones());
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
        case 2:
          /*****************************
           * OPERACIONES ARITMENTICAS
           *****************************/
          //menos EXP
          if(nodo.hijos[0] == '-' && this.soyNodo('EXP',nodo.hijos[1])){
            const exp : NodoAST = this.recorrer(nodo.hijos[1]);
            return new UMenos(nodo.linea, exp);
          }
          //id mas_mas
          if(nodo.hijos[1] == '++'){
            const id = nodo.hijos[0];
            return new Incremento(nodo.linea, id);
          }
          //id menos_menos
          if(nodo.hijos[1] == '--'){
            const id = nodo.hijos[0];
            return new Decremento(nodo.linea, id);
          }
          /*****************************
           * OPERACIONES LOGICAS
           *****************************/
          //not EXP
          if(nodo.hijos[0] == '!' && this.soyNodo('EXP',nodo.hijos[1])){
            const exp : NodoAST = this.recorrer(nodo.hijos[1]);
            return new Not(nodo.linea, exp);
          }
        case 3:
          /*****************************
           * OPERACIONES ARITMENTICAS
           *****************************/
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
          /*****************************
           * OPERACIONES RELACIONALES
           *****************************/
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
          //EXP igual_que EXP
          if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '==' && this.soyNodo('EXP', nodo.hijos[2])){
            const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
            const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
            return new IgualQue(nodo.linea, op_izq, op_der);
          }
          /*****************************
           * OPERACIONES LOGICAS
           *****************************/
          //EXP and EXP
          if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '&&' && this.soyNodo('EXP', nodo.hijos[2])){
            const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
            const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
            return new And(nodo.linea, op_izq, op_der);
          }
          //EXP or EXP
          if(this.soyNodo('EXP', nodo.hijos[0]) && nodo.hijos[1] == '||' && this.soyNodo('EXP', nodo.hijos[2])){
            const op_izq : NodoAST = this.recorrer(nodo.hijos[0]);
            const op_der : NodoAST = this.recorrer(nodo.hijos[2]);
            return new Or(nodo.linea, op_izq, op_der);
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
      return new Primitivo(nodo.linea, null, TIPO_DATO.NULL);
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
          //IF LISTA_ELSE_IF
          if(this.soyNodo('IF', nodo.hijos[0]) && this.soyNodo('LISTA_ELSE_IF', nodo.hijos[1])){
            const inst_if : If = this.recorrer(nodo.hijos[0]);
            const lista_ifs : If[] = this.recorrer(nodo.hijos[1]);
            return new InstruccionIf(nodo.linea, [inst_if, ...lista_ifs]);
          }
        case 3:
          //IF LISTA_ELSE_IF ELSE
          if(this.soyNodo('IF', nodo.hijos[0]) && this.soyNodo('LISTA_ELSE_IF', nodo.hijos[1]) && this.soyNodo('ELSE', nodo.hijos[2])){
            const inst_if : If = this.recorrer(nodo.hijos[0]);
            const lista_ifs : If[] = this.recorrer(nodo.hijos[1]);
            const inst_else : If = this.recorrer(nodo.hijos[2]);
            return new InstruccionIf(nodo.linea, [inst_if, ...lista_ifs, inst_else]);
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

    //ELSE_IF  ---->  If(condicion, instrucciones)
    else if(this.soyNodo('ELSE_IF', nodo)){
      //else if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der
      const condicion : NodoAST = this.recorrer(nodo.hijos[3]);
      const instrucciones : NodoAST[] = this.recorrer(nodo.hijos[6]);
      return new If(condicion, instrucciones);
    }

    //ELSE  ---->  If(null, instrucciones)
    else if(this.soyNodo('ELSE', nodo)){
      //else llave_izq INSTRUCCIONES llave_der
      const instrucciones : NodoAST[] = this.recorrer(nodo.hijos[2]);
      return new If(null, instrucciones);
    }

    //LISTA_ELSE_IF  ---->  [ If(null, instrucciones) ]
    else if(this.soyNodo('LISTA_ELSE_IF', nodo)){
      const lista_ifs : If[] = [];
      nodo.hijos.forEach((nodoHijo : any) => {
        const inst_if = this.recorrer(nodoHijo);
        if(inst_if != null && inst_if instanceof If){
          lista_ifs.push(inst_if);
        }
      });
      return lista_ifs;
    }

    //DECLARACION_FUNCION  ---->  DecFuncion
    else if(this.soyNodo('DECLARACION_FUNCION', nodo)){
      const id = nodo.hijos[1];

      switch(nodo.hijos.length){
        //function id par_izq par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der
        case 9:{
          //{ tipo, type_generador? }
          const tipo_funcion = this.recorrer(nodo.hijos[5]);
          const instrucciones = this.recorrer(nodo.hijos[7]);

          const linea = nodo.linea;
          const tipo = tipo_funcion.tipo;
          const referencia = tipo_funcion.type_generador;

          return new DecFuncion({linea, id, tipo, referencia, instrucciones});
        }
        case 10:
          //function id par_izq LISTA_PARAMETROS par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der
          if(this.soyNodo('LISTA_PARAMETROS', nodo.hijos[3]) && this.soyNodo('TIPO_VARIABLE_NATIVA', nodo.hijos[6]) && this.soyNodo('INSTRUCCIONES', nodo.hijos[8])){
            const parametros = this.recorrer(nodo.hijos[3]);
            const tipo_funcion = this.recorrer(nodo.hijos[6]);
            const instrucciones = this.recorrer(nodo.hijos[8]);

            const linea = nodo.linea;
            const tipo = tipo_funcion.tipo;
            const referencia = tipo_funcion.type_generador;

            return new DecFuncion({linea, id, tipo, referencia, parametros, instrucciones});
          }
      }
    }

    //LISTA_PARAMETROS  ---->  [Variable...]
    else if(this.soyNodo('LISTA_PARAMETROS', nodo)){
      const lista : Variable[] = [];
      nodo.hijos.forEach((nodoHijo: any) => {
        if(nodoHijo instanceof Object){
          const variable = this.recorrer(nodoHijo);
          //Si es valida
          if(variable){
            lista.push(variable);
          }
        }
      });
      return lista;
    }

    //PARAMETRO  ---->  Variable
    else if(this.soyNodo('PARAMETRO', nodo)){
      const id = nodo.hijos[0];
      const reasignable = true;
      switch(nodo.hijos.length){
        //id dos_puntos TIPO_VARIABLE_NATIVA
        case 3: {
          //{ tipo, type_generador? }
          const tipo_variable_nativa = this.recorrer(nodo.hijos[2]);
          const tipo = tipo_variable_nativa.tipo;
          const referencia = tipo_variable_nativa.type_generador ?? null;
          return new Variable({id, tipo, reasignable, referencia});
        }
      }
    }

    //LLAMADA_FUNCION
    else if(this.soyNodo('LLAMADA_FUNCION', nodo)){
      const id = nodo.hijos[0];

      switch(nodo.hijos.length){
        //id par_izq par_der punto_coma
        case 4:
          return new LlamadaFuncion(nodo.linea, id);
        //id par_izq LISTA_EXPRESIONES par_der punto_coma
        case 5:
          const lista_exps = this.recorrer(nodo.hijos[2]);
          return new LlamadaFuncion(nodo.linea, id, lista_exps);
      }
    }

    //LLAMADA_FUNCION_EXP
    else if(this.soyNodo('LLAMADA_FUNCION_EXP', nodo)){
      const id = nodo.hijos[0];
      switch(nodo.hijos.length){
        //id par_izq par_der
        case 3:
          return new LlamadaFuncion(nodo.linea, id);
        //id par_izq LISTA_EXPRESIONES par_der
        case 4:
          const lista_exps = this.recorrer(nodo.hijos[2]);
          return new LlamadaFuncion(nodo.linea, id, lista_exps);
      }
    }

    //RETURN
    else if(this.soyNodo('RETURN', nodo)){
      switch(nodo.hijos.length){
        //return EXP punto_coma
        case 3:
          const exp = this.recorrer(nodo.hijos[1]);
          return new Return(nodo.linea, exp);
        //return punto_coma
        case 2:
          return new Return(nodo.linea);
      }
    }

    //BREAK
    else if(this.soyNodo('BREAK', nodo)){
      //break punto_coma
      return new Break(nodo.linea);
    }

    //DEFAULT
    else if(this.soyNodo('DEFAULT', nodo)){
      //default dos_puntos INSTRUCCIONES
      const instrucciones = this.recorrer(nodo.hijos[2]);
      return new Case(null, instrucciones, true);
    }

    //CASE
    else if(this.soyNodo('CASE', nodo)){
      //case EXP dos_puntos INSTRUCCIONES
      const exp = this.recorrer(nodo.hijos[1]);
      const instrucciones = this.recorrer(nodo.hijos[3]);
      return new Case(exp, instrucciones);
    }

    //LISTA_CASE  ---->  [Case...]
    else if(this.soyNodo('LISTA_CASE', nodo)){
      const cases : Case[] = [];
      nodo.hijos.forEach((nodoHijo: any) => {
        if(nodoHijo instanceof Object){
          const caso = this.recorrer(nodoHijo);
          if(caso){
            cases.push(caso);
          }
        }
      });
      return cases;
    }

    //SWITCH
    else if(this.soyNodo('SWITCH', nodo)){
      //switch par_izq EXP par_der llave_izq LISTA_CASE llave_der
      const exp = this.recorrer(nodo.hijos[2]);
      const cases = this.recorrer(nodo.hijos[5]);
      return new Switch(nodo.linea, exp, cases);
    }

    //ASIGNACION
    else if(this.soyNodo('ASIGNACION', nodo)){
      switch(nodo.hijos.length){
        case 4:
          //id TIPO_IGUAL EXP punto_coma
          if(this.soyNodo('TIPO_IGUAL', nodo.hijos[1]) && this.soyNodo('EXP', nodo.hijos[2])){
            const id = nodo.hijos[0];
            const tipo_igual = this.recorrer(nodo.hijos[1]);
            const exp = this.recorrer(nodo.hijos[2]);
            return new AsignacionId(nodo.linea, id, tipo_igual, exp);
          }
      }
    }

    //TIPO_IGUAL  ---->  '=' | '+=' | '-='
    else if(this.soyNodo('TIPO_IGUAL', nodo)){
      //igual - mas igual - menos igual
      if(nodo.hijos.length == 1)
        return nodo.hijos[0];
      else
        return `${nodo.hijos[0]}${nodo.hijos[1]}`;
    }

    //LENGTH
    else if(this.soyNodo('LENGTH', nodo)){
      switch(nodo.hijos.length){
        case 3:
          //STRING punto length
          if(this.soyNodo('STRING', nodo.hijos[0])){
            const exp = this.recorrer(nodo.hijos[0]);
            return new Length({linea: nodo.linea, exp});
          }
          //id punto length
          else{
            const id = nodo.hijos[0];
            return new Length({linea: nodo.linea, id});
          }
        case 5:
          //par_izq EXP par_der punto length
          if(this.soyNodo('EXP', nodo.hijos[1])){
            const exp = this.recorrer(nodo.hijos[1]);
            return new Length({linea: nodo.linea, exp});
          }
      }
    }

    //CHAR_AT
    else if(this.soyNodo('CHAR_AT', nodo)){
      const linea = nodo.linea;
      switch(nodo.hijos.length){
        case 6:
          //string punto charat par_izq EXP par_der
          if(this.soyNodo('STRING', nodo.hijos[0]) && this.soyNodo('EXP', nodo.hijos[4])){
            const exp = this.recorrer(nodo.hijos[0]);
            const pos = this.recorrer(nodo.hijos[4]);
            return new CharAt({linea, exp, pos});
          }
          //id punto charat par_izq EXP par_der
          else if(this.soyNodo('EXP', nodo.hijos[4])){
            const id = nodo.hijos[0];
            const pos = this.recorrer(nodo.hijos[4]);
            return new CharAt({linea, id, pos});
          }
        case 8:
          //par_izq EXP par_der punto charat par_izq EXP par_der
          const exp = this.recorrer(nodo.hijos[1]);
          const pos = this.recorrer(nodo.hijos[6]);
          return new CharAt({linea, exp, pos});
      }
    }

    //TO_UPPER_CASE
    else if(this.soyNodo('TO_UPPER_CASE', nodo)){
      const linea = nodo.linea;
      switch(nodo.hijos.length){
        case 5:
          //string punto toUpperCase par_izq par_der
          if(this.soyNodo('STRING', nodo.hijos[0])){
            const exp = this.recorrer(nodo.hijos[0]);
            return new ToUpperCase({linea, exp});
          }
          //id punto toUpperCase par_izq par_der
          else{
            const id = nodo.hijos[0];
            return new ToUpperCase({linea, id});
          }
        case 7:
          //par_izq EXP par_der punto toUpperCase par_izq par_der
          const exp = this.recorrer(nodo.hijos[1]);
          return new ToUpperCase({linea, exp});
      }
    }

    //TO_LOWER_CASE
    else if(this.soyNodo('TO_LOWER_CASE', nodo)){
      const linea = nodo.linea;
      switch(nodo.hijos.length){
        case 5:
          //string punto toLowerCase par_izq par_der
          if(this.soyNodo('STRING', nodo.hijos[0])){
            const exp = this.recorrer(nodo.hijos[0]);
            return new ToLowerCase({linea, exp});
          }
          //id punto toLowerCase par_izq par_der
          else{
            const id = nodo.hijos[0];
            return new ToLowerCase({linea, id});
          }
        case 7:
          //par_izq EXP par_der punto toLowerCase par_izq par_der
          const exp = this.recorrer(nodo.hijos[1]);
          return new ToLowerCase({linea, exp});
      }
    }

    //CONCAT
    else if(this.soyNodo('CONCAT', nodo)){
      const linea = nodo.linea;
      switch(nodo.hijos.length){
        case 6:
          //string punto concat par_izq EXP par_der
          if(this.soyNodo('STRING', nodo.hijos[0]) && this.soyNodo('EXP', nodo.hijos[4])){
            const cad1 = this.recorrer(nodo.hijos[0]);
            const cad2 = this.recorrer(nodo.hijos[4]);
            return new Concat({linea, cad1, cad2});
          }
          //id punto concat par_izq EXP par_der
          else if(this.soyNodo('EXP', nodo.hijos[4])){
            const id = nodo.hijos[0];
            const cad2 = this.recorrer(nodo.hijos[4]);
            return new Concat({linea, id, cad2});
          }
        case 8:
          //par_izq EXP par_der punto concat par_izq EXP par_der
          const cad1 = this.recorrer(nodo.hijos[1]);
          const cad2 = this.recorrer(nodo.hijos[6]);
          return new Concat({linea, cad1, cad2});
      }
    }

    //WHILE
    else if(this.soyNodo('WHILE', nodo)){
      //while par_izq EXP par_der llave_izq INSTRUCCIONES llave_der
      const condicion = this.recorrer(nodo.hijos[2]);
      const instrucciones = this.recorrer(nodo.hijos[5]);
      return new While(nodo.linea, condicion, instrucciones);
    }

    //DO_WHILE
    else if(this.soyNodo('DO_WHILE', nodo)){
      //do llave_izq INSTRUCCIONES llave_der while par_izq EXP par_der punto_coma
      const instrucciones = this.recorrer(nodo.hijos[2]);
      const condicion = this.recorrer(nodo.hijos[6]);
      return new DoWhile(nodo.linea, condicion, instrucciones);
    }

    //INCREMENTO_DECREMENTO
    else if(this.soyNodo('INCREMENTO_DECREMENTO', nodo)){
      const id = nodo.hijos[0];

      //id mas_mas punto_coma
      if(nodo.hijos[1] == '++'){
        return new Incremento(nodo.linea, id, true);
      }
      //id menos_menos punto_coma
      if(nodo.hijos[1] == '--'){
        return new Decremento(nodo.linea, id, true);
      }
    }

    //FOR
    else if(this.soyNodo('FOR', nodo)){
      //for par_izq DECLARACION_VARIABLE EXP punto_coma ASIGNACION_FOR par_der llave_izq INSTRUCCIONES llave_der
      if(this.soyNodo('DECLARACION_VARIABLE', nodo.hijos[2])){

      }
      //for par_izq ASIGNACION EXP punto_coma ASIGNACION_FOR par_der llave_izq INSTRUCCIONES llave_der
      if(this.soyNodo('ASIGNACION', nodo.hijos[2])){

      }
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
