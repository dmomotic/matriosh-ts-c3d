  /* Definición Léxica */
%lex

%options case-insensitive

%%

\s+											                // espacios en blanco
"//".*										              // comentario simple
[/][*][^*]*[*]+([^/*][^*]*[*]+)*[/]			// comentario multiple líneas

//Palabras reservadas
'string' return 'string';
'number' return 'number';
'boolean' return 'boolean';
'void' return 'void';
'type' return 'type';
'let' return 'let';
'const' return 'const';
'console' return 'console';
'log' return 'log';
'function' return 'function';
'return' return 'return';
'null' return 'null';
'push' return 'push';
'length' return 'length';
'pop' return 'pop';
'if' return 'if';
'else' return 'else';
'true' return 'true';
'false' return 'false';
'break' return 'break';
'switch' return 'switch';
'case' return 'case';
'default' return 'default';
'continue' return 'continue';
'while' return 'while';
'do' return 'do';
'for' return 'for';
'in' return 'in';
'of' return 'of';
'graficar_ts' return 'graficar_ts';
'Array' return 'Array';
'charat' return 'charat';
'ToLowerCase' return 'toLowerCase';
'ToUpperCase' return 'toUpperCase';
'concat' return 'concat';

//Signos
';' return 'punto_coma';
',' return 'coma';
':' return 'dos_puntos';
'{' return 'llave_izq';
'}' return 'llave_der';
'(' return 'par_izq';
')' return 'par_der';
'[' return 'cor_izq';
']' return 'cor_der';
'.' return 'punto';
'++' return 'mas_mas'
'+' return 'mas';
'--' return 'menos_menos'
'-' return 'menos';
'**' return 'potencia';
'*' return 'por';
'/' return 'div';
'%' return 'mod';
'<=' return 'menor_igual';
'>=' return 'mayor_igual';
'>' return 'mayor';
'<' return 'menor';
'==' return 'igual_que';
'=' return 'igual';
'!=' return 'dif_que';
'&&' return 'and';
'||' return 'or';
'!' return 'not';
'?' return 'interrogacion';



//Patrones (Expresiones regulares)
\"[^\"]*\"			{ yytext = yytext.substr(0,yyleng-0); return 'string'; }
\'[^\']*\'			{ yytext = yytext.substr(0,yyleng-0); return 'string'; }
\`[^\`]*\`			{ yytext = yytext.substr(0,yyleng-0); return 'string'; }
[0-9]+("."[0-9]+)?\b  	return 'number';
([a-zA-Z])[a-zA-Z0-9_]* return 'id';

//Fin del archivo
<<EOF>>				return 'EOF';
//Errores lexicos
.					{
  const er = new error_1.Error({ tipo: 'lexico', linea: `${yylineno + 1}`, descripcion: `El valor "${yytext}" no es valido, columna: ${yylloc.first_column + 1}` });
  errores_1.Errores.getInstance().push(er);
  }
/lex

//Imports
%{
  const { NodoAST } = require('../arbol/nodoAST');
  const error_1 = require("../arbol/error");
  const errores_1 = require("../arbol/errores");
%}

/* Asociación de operadores y precedencia */
// https://entrenamiento-python-basico.readthedocs.io/es/latest/leccion3/operadores_aritmeticos.html
%left 'interrogacion'
%left 'or'
%left 'and'
//%left 'not'
%left 'igual_que' 'dif_que'
%left 'mayor' 'menor' 'mayor_igual' 'menor_igual'
%left 'mas' 'menos'
%left 'por' 'div' 'mod'
%left 'umenos'
%right 'potencia'
%left 'mas_mas' 'menos_menos' 'not'
//%left 'mas_mas' 'menos_menos'

%start S

%%

//Definición de la Grámatica

S
  : INSTRUCCIONES EOF { return new NodoAST({label: 'S', hijos: [$1], linea: yylineno}); }
;

INSTRUCCIONES
  : INSTRUCCIONES INSTRUCCION  { $$ = new NodoAST({label: 'INSTRUCCIONES', hijos: [...$1.hijos, ...$2.hijos], linea: yylineno}); }
  | INSTRUCCION                { $$ = new NodoAST({label: 'INSTRUCCIONES', hijos: [...$1.hijos], linea: yylineno}); }
;

INSTRUCCION
  : DECLARACION_VARIABLE  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | DECLARACION_FUNCION  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | DECLARACION_TYPE  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | ASIGNACION  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | PUSH_ARREGLO  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | CONSOLE_LOG  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | INSTRUCCION_IF  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | SWITCH  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | BREAK  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | RETURN  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | CONTINUE  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | WHILE  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | DO_WHILE  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | FOR  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | FOR_OF  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | FOR_IN  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | GRAFICAR_TS  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | LLAMADA_FUNCION  { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  | INCREMENTO_DECREMENTO { $$ = new NodoAST({label: 'INSTRUCCION', hijos: [$1], linea: yylineno}); }
  // | error { console.error('Este es un error sintáctico: ' + yytext + ', en la linea: ' + this._$.first_line + ', en la columna: ' + this._$.first_column); }
;

LLAMADA_FUNCION
  : id par_izq par_der punto_coma { $$ = new NodoAST({label: 'LLAMADA_FUNCION', hijos: [$1,$2,$3,$4], linea: yylineno}); }
  | id par_izq LISTA_EXPRESIONES par_der punto_coma { $$ = new NodoAST({label: 'LLAMADA_FUNCION', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
;

LLAMADA_FUNCION_EXP
  : id par_izq par_der { $$ = new NodoAST({label: 'LLAMADA_FUNCION_EXP', hijos: [$1,$2,$3], linea: yylineno}); }
  | id par_izq LISTA_EXPRESIONES par_der { $$ = new NodoAST({label: 'LLAMADA_FUNCION_EXP', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

GRAFICAR_TS
  : graficar_ts par_izq par_der punto_coma { $$ = new NodoAST({label: 'GRAFICAR_TS', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

WHILE
  : while par_izq EXP par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'WHILE', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;

DO_WHILE
  : do llave_izq INSTRUCCIONES llave_der while par_izq EXP par_der punto_coma { $$ = new NodoAST({label: 'DO_WHILE', hijos: [$1,$2,$3,$4,$5,$6,$7,$8,$9], linea: yylineno}); }
;

FOR
  : for par_izq DECLARACION_VARIABLE EXP punto_coma ASIGNACION_FOR par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'FOR', hijos: [$1,$2,$3,$4,$5,$6,$7,$8,$9,$10], linea: yylineno}); }
  | for par_izq ASIGNACION EXP punto_coma ASIGNACION_FOR par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'FOR', hijos: [$1,$2,$3,$4,$5,$6,$7,$8,$9,$10], linea: yylineno}); }
;

FOR_OF
  : for par_izq TIPO_DEC_VARIABLE id of EXP par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'FOR_OF', hijos: [$1,$2,$3,$4,$5,$6,$7,$8,$9,$10], linea: yylineno}); }
;

FOR_IN
  : for par_izq TIPO_DEC_VARIABLE id in EXP par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'FOR_IN', hijos: [$1,$2,$3,$4,$5,$6,$7,$8,$9,$10], linea: yylineno}); }
;

ASIGNACION
  //variable = EXP ;
  : id TIPO_IGUAL EXP punto_coma { $$ = new NodoAST({label: 'ASIGNACION', hijos: [$1,$2,$3,$4], linea: yylineno}); }

  // type.accesos = EXP ; || type.accesos[][] = EXP;
  | id LISTA_ACCESOS_TYPE TIPO_IGUAL EXP punto_coma { $$ = new NodoAST({label: 'ASIGNACION', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }

  //variable[][] = EXP ;
  | ACCESO_ARREGLO TIPO_IGUAL EXP punto_coma { $$ = new NodoAST({label: 'ASIGNACION', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

TIPO_IGUAL /**--> YA <--**/
  : igual { $$ = new NodoAST({label: 'TIPO_IGUAL', hijos: [$1], linea: yylineno}); }
  | mas igual { $$ = new NodoAST({label: 'TIPO_IGUAL', hijos: [$1,$2], linea: yylineno}); }
  | menos igual { $$ = new NodoAST({label: 'TIPO_IGUAL', hijos: [$1,$2], linea: yylineno}); }
;

ASIGNACION_FOR
  : id TIPO_IGUAL EXP { $$ = new NodoAST({label: 'ASIGNACION_FOR', hijos: [$1,$2,$3], linea: yylineno}); }
  | id mas_mas { $$ = new NodoAST({label: 'ASIGNACION_FOR', hijos: [$1,$2], linea: yylineno}); }
  | id menos_menos { $$ = new NodoAST({label: 'ASIGNACION_FOR', hijos: [$1,$2], linea: yylineno}); }
;

SWITCH /**--> YA <--**/
  : switch par_izq EXP par_der llave_izq LISTA_CASE llave_der { $$ = new NodoAST({label: 'SWITCH', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;

LISTA_CASE /**--> YA <--**/
  : LISTA_CASE CASE { $$ = new NodoAST({label: 'LISTA_CASE', hijos: [...$1.hijos,$2], linea: yylineno}); }
  | CASE { $$ = new NodoAST({label: 'LISTA_CASE', hijos: [$1], linea: yylineno}); }
  | DEFAULT { $$ = new NodoAST({label: 'LISTA_CASE', hijos: [$1], linea: yylineno}); }
  | LISTA_CASE DEFAULT { $$ = new NodoAST({label: 'LISTA_CASE', hijos: [...$1.hijos,$2], linea: yylineno}); }
;

CASE /**--> YA <--**/
  : case EXP dos_puntos INSTRUCCIONES { $$ = new NodoAST({label: 'CASE', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

DEFAULT /**--> YA <--**/
  : default dos_puntos INSTRUCCIONES { $$ = new NodoAST({label: 'DEFAULT', hijos: [$1,$2,$3], linea: yylineno}); }
;

CONTINUE
  : continue punto_coma { $$ = new NodoAST({label: 'CONTINUE', hijos: [$1, $2], linea: yylineno}); }
;

BREAK /**--> YA <--**/
  : break punto_coma { $$ = new NodoAST({label: 'BREAK', hijos: [$1,$2], linea: yylineno}); }
;

RETURN /**--> YA <--**/
  : return EXP punto_coma /**--> YA <--**/ { $$ = new NodoAST({label: 'RETURN', hijos: [$1,$2,$3], linea: yylineno}); }
  | return punto_coma /**--> YA <--**/ { $$ = new NodoAST({label: 'RETURN', hijos: [$1,$2], linea: yylineno}); }
;

INSTRUCCION_IF /**--> YA <--**/
  : IF /**--> YA <--**/ { $$ = new NodoAST({label: 'INSTRUCCION_IF', hijos: [$1], linea: yylineno}); }
  | IF ELSE /**--> YA <--**/ { $$ = new NodoAST({label: 'INSTRUCCION_IF', hijos: [$1,$2], linea: yylineno}); }
  | IF LISTA_ELSE_IF /**--> YA <--**/ { $$ = new NodoAST({label: 'INSTRUCCION_IF', hijos: [$1,$2], linea: yylineno}); }
  | IF LISTA_ELSE_IF ELSE /**--> YA <--**/ { $$ = new NodoAST({label: 'INSTRUCCION_IF', hijos: [$1,$2,$3], linea: yylineno}); }
;

IF /**--> YA <--**/
  : if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'IF', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;

ELSE /**--> YA <--**/
  : else llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'ELSE', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

ELSE_IF /**--> YA <--**/
  : else if par_izq EXP par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'ELSE_IF', hijos: [$1,$2,$3,$4,$5,$6,$7,$8], linea: yylineno}); }
;

LISTA_ELSE_IF /**--> YA <--**/
  : LISTA_ELSE_IF ELSE_IF { $$ = new NodoAST({label: 'LISTA_ELSE_IF', hijos: [...$1.hijos, $2], linea: yylineno}); }
  | ELSE_IF { $$ = new NodoAST({label: 'LISTA_ELSE_IF', hijos: [$1], linea: yylineno}); }
;

PUSH_ARREGLO
  : id punto push par_izq EXP par_der punto_coma { $$ = new NodoAST({label: 'PUSH_ARREGLO', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
  | id LISTA_ACCESOS_TYPE punto push par_izq EXP par_der punto_coma { $$ = new NodoAST({label: 'PUSH_ARREGLO', hijos: [$1,$2,$3,$4,$5,$6,$7,$8], linea: yylineno}); }
;

DECLARACION_FUNCION
  /**--> YA <--**/
  //Funcion sin parametros y con tipo -> function test() : TIPO { INSTRUCCIONES }
  : function id par_izq par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7, $8, $9], linea: yylineno}); }

   //Funcion sin parametros y con tipo -> function test() : TIPO[][] { INSTRUCCIONES }
  | function id par_izq par_der dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7, $8, $9, $10], linea: yylineno}); }

  //Funcion sin parametros y sin tipo -> function test() { INSTRUCCIONES }
  | function id par_izq par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7], linea: yylineno}); }

  /**--> YA <--**/
  //Funcion con parametros y con tipo -> function test ( LISTA_PARAMETROS ) : TIPO { INSTRUCCIONES }
  | function id par_izq LISTA_PARAMETROS par_der dos_puntos TIPO_VARIABLE_NATIVA llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7, $8, $9, $10], linea: yylineno}); }

  //Funcion con parametros y con tipo -> function test ( LISTA_PARAMETROS ) : TIPO[][] { INSTRUCCIONES }
  | function id par_izq LISTA_PARAMETROS par_der dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11], linea: yylineno}); }

  //Funcion con parametros y sin tipo -> function test ( LISTA_PARAMETROS ) { INSTRUCCIONES }
  | function id par_izq LISTA_PARAMETROS par_der llave_izq INSTRUCCIONES llave_der { $$ = new NodoAST({label: 'DECLARACION_FUNCION', hijos: [$1, $2, $3, $4, $5, $6, $7, $8], linea: yylineno}); }

;

LISTA_PARAMETROS
  : LISTA_PARAMETROS coma PARAMETRO { $$ = new NodoAST({label: 'LISTA_PARAMETROS', hijos: [...$1.hijos,$2,$3], linea: yylineno}); } //Revisar si agrego o no coma
  | PARAMETRO { $$ = new NodoAST({label: 'LISTA_PARAMETROS', hijos: [$1], linea: yylineno}); }
;

PARAMETRO
  : id dos_puntos TIPO_VARIABLE_NATIVA { $$ = new NodoAST({label: 'PARAMETRO', hijos: [$1, $2, $3], linea: yylineno}); }
  | id dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES { $$ = new NodoAST({label: 'PARAMETRO', hijos: [$1, $2, $3, $4], linea: yylineno}); }
  | id dos_puntos Array menor TIPO_VARIABLE_NATIVA mayor { $$ = new NodoAST({label: 'PARAMETRO', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
;

DECLARACION_TYPE
  : type id igual llave_izq LISTA_ATRIBUTOS llave_der { $$ = new NodoAST({label: 'DECLARACION_TYPE', hijos: [$1, $2, $3, $4, $5, $6], linea: yylineno}); }
  | type id igual llave_izq LISTA_ATRIBUTOS llave_der punto_coma { $$ = new NodoAST({label: 'DECLARACION_TYPE', hijos: [$1, $2, $3, $4, $5, $6, $7], linea: yylineno}); }
;

LISTA_ATRIBUTOS
  : ATRIBUTO coma LISTA_ATRIBUTOS { $$ = new NodoAST({label: 'LISTA_ATRIBUTOS', hijos: [$1,$2,...$3.hijos], linea: yylineno}); } //Revisar si agrego o no coma
  | ATRIBUTO { $$ = new NodoAST({label: 'LISTA_ATRIBUTOS', hijos: [$1], linea: yylineno}); }
;

ATRIBUTO
  : id dos_puntos TIPO_VARIABLE_NATIVA { $$ = new NodoAST({label: 'ATRIBUTO', hijos: [$1, $2, $3], linea: yylineno}); }
  | id dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES { $$ = new NodoAST({label: 'ATRIBUTO', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

DECLARACION_VARIABLE
  : TIPO_DEC_VARIABLE LISTA_DECLARACIONES punto_coma { $$ = new NodoAST({label: 'DECLARACION_VARIABLE', hijos: [$1,$2,$3], linea: yylineno});  }
;

LISTA_DECLARACIONES
  : LISTA_DECLARACIONES coma DEC_ID { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); } //No utilice las comas
  | LISTA_DECLARACIONES coma DEC_ID_TIPO { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); }
  | LISTA_DECLARACIONES coma DEC_ID_TIPO_CORCHETES { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); }
  | LISTA_DECLARACIONES coma DEC_ID_EXP { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); }
  | LISTA_DECLARACIONES coma DEC_ID_TIPO_EXP { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); }
  | LISTA_DECLARACIONES coma DEC_ID_TIPO_CORCHETES_EXP { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [...$1.hijos,$3], linea: yylineno}); }
  | DEC_ID_TIPO { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [$1], linea: yylineno}); }
  | DEC_ID_TIPO_CORCHETES { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [$1], linea: yylineno}); }
  | DEC_ID_TIPO_EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [$1], linea: yylineno}); }
  | DEC_ID_TIPO_CORCHETES_EXP { $$ = new NodoAST({label: 'LISTA_DECLARACIONES', hijos: [$1], linea: yylineno}); }
;

//let id : TIPO_VARIABLE_NATIVA LISTA_CORCHETES = EXP ;
DEC_ID_TIPO_CORCHETES_EXP
  : id dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES igual EXP { $$ = new NodoAST({label: 'DEC_ID_TIPO_CORCHETES_EXP', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
;

//let id : TIPO_VARIABLE_NATIVA = EXP;
DEC_ID_TIPO_EXP
  : id dos_puntos TIPO_VARIABLE_NATIVA igual EXP { $$ = new NodoAST({label: 'DEC_ID_TIPO_EXP', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
;

//let id : TIPO_VARIABLE_NATIVA ;
DEC_ID_TIPO /**--> YA <--**/
  : id dos_puntos TIPO_VARIABLE_NATIVA { $$ = new NodoAST({label: 'DEC_ID_TIPO', hijos: [$1,$2,$3], linea: yylineno}); }
;

//let id : TIPO_VARIABLE_NATIVA LISTA_CORCHETES ;
DEC_ID_TIPO_CORCHETES
  : id dos_puntos TIPO_VARIABLE_NATIVA LISTA_CORCHETES { $$ = new NodoAST({label: 'DEC_ID_TIPO_CORCHETES', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

LISTA_CORCHETES
  : LISTA_CORCHETES cor_izq cor_der { $$ = new NodoAST({label: 'LISTA_CORCHETES', hijos: [...$1.hijos, '[]'], linea: yylineno}); }
  | cor_izq cor_der { $$ = new NodoAST({label: 'LISTA_CORCHETES', hijos: ['[]'], linea: yylineno}); }
;

INCREMENTO_DECREMENTO
  : id mas_mas punto_coma { $$ = new NodoAST({label: 'INCREMENTO_DECREMENTO', hijos: [$1,$2,$3], linea: yylineno}); }
  | id menos_menos punto_coma { $$ = new NodoAST({label: 'INCREMENTO_DECREMENTO', hijos: [$1,$2,$3], linea: yylineno}); }
;

EXP
  //Operaciones Aritmeticas
  : menos EXP %prec umenos /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2], linea: yylineno}); }
  | EXP mas EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP menos EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP por EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP div EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP mod EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP potencia EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | id mas_mas { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2], linea: yylineno}); }
  | id menos_menos { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2], linea: yylineno}); }
  | par_izq EXP par_der { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  //Operaciones de Comparacion
  | EXP mayor EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP menor EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP mayor_igual EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP menor_igual EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP igual_que EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP dif_que EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  //Operaciones Lógicas
  | EXP and EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | EXP or EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2, $3], linea: yylineno}); }
  | not EXP /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1, $2], linea: yylineno}); }
  //Valores Primitivos
  | number /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'NUMBER', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  | string /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  | id  { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'ID', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  | true /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'BOOLEAN', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  | false /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'BOOLEAN', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  | null /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [new NodoAST({label: 'NULL', hijos: [$1], linea: yylineno})], linea: yylineno}); }
  //Arreglos
  | cor_izq LISTA_EXPRESIONES cor_der { $$ = new NodoAST({label: 'EXP', hijos: [$1,$2,$3], linea: yylineno}); }
  | cor_izq cor_der { $$ = new NodoAST({label: 'EXP', hijos: [$1,$2], linea: yylineno}); }
  | ACCESO_ARREGLO { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | LENGTH { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | CHAR_AT /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | TO_LOWER_CASE /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | TO_UPPER_CASE /**--> YA <--**/ { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | CONCAT { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | ARRAY_POP { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  //Types - accesos
  | ACCESO_TYPE { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  | TYPE { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  //Ternario
  | TERNARIO { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
  //Funciones
  | LLAMADA_FUNCION_EXP { $$ = new NodoAST({label: 'EXP', hijos: [$1], linea: yylineno}); }
;

TYPE
  : llave_izq ATRIBUTOS_TYPE llave_der { $$ = new NodoAST({label: 'TYPE', hijos: [$1,$2,$3], linea: yylineno}); }
;

ATRIBUTOS_TYPE
  : ATRIBUTO_TYPE coma ATRIBUTOS_TYPE { $$ = new NodoAST({label: 'ATRIBUTOS_TYPE', hijos: [$1,$2,...$3.hijos], linea: yylineno}); }
  | ATRIBUTO_TYPE { $$ = new NodoAST({label: 'ATRIBUTOS_TYPE', hijos: [$1], linea: yylineno}); }
;

ATRIBUTO_TYPE
  : id dos_puntos EXP { $$ = new NodoAST({label: 'ATRIBUTO_TYPE', hijos: [$1,$2,$3], linea: yylineno}); }
;

LENGTH
  : id punto length { $$ = new NodoAST({label: 'LENGTH', hijos: [$1,$2,$3], linea: yylineno}); }
  | string punto length { $$ = new NodoAST({label: 'LENGTH', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno}),$2,$3], linea: yylineno}); }
  | par_izq EXP par_der punto length { $$ = new NodoAST({label: 'LENGTH', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
  | id LISTA_ACCESOS_ARREGLO punto length { $$ = new NodoAST({label: 'LENGTH', hijos: [$1,$2,$3,$4], linea: yylineno}); }
  | id LISTA_ACCESOS_TYPE punto length { $$ = new NodoAST({label: 'LENGTH', hijos: [$1,$2,$3,$4], linea: yylineno}); }
;

CHAR_AT /**--> YA <--**/
  : id punto charat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CHAR_AT', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
  | string punto charat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CHAR_AT', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno}),$2,$3,$4,$5,$6], linea: yylineno}); }
  | par_izq EXP par_der punto charat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CHAR_AT', hijos: [$1,$2,$3,$4,$5,$6,$7,$8], linea: yylineno}); }
;

TO_LOWER_CASE /**--> YA <--**/
  : id punto toLowerCase par_izq par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'TO_LOWER_CASE', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
  | string punto toLowerCase par_izq par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'TO_LOWER_CASE', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno}),$2,$3,$4,$5], linea: yylineno}); }
  | par_izq EXP par_der punto toLowerCase par_izq par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'TO_LOWER_CASE', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;

TO_UPPER_CASE /**--> YA <--**/
  : id punto toUpperCase par_izq par_der /**--> YA <--**/{ $$ = new NodoAST({label: 'TO_UPPER_CASE', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
  | string punto toUpperCase par_izq par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'TO_UPPER_CASE', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno}),$2,$3,$4,$5], linea: yylineno}); }
  | par_izq EXP par_der punto toUpperCase par_izq par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'TO_UPPER_CASE', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;

CONCAT /**--> YA <--**/
  : id punto concat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CONCAT', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
  | string punto concat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CONCAT', hijos: [new NodoAST({label: 'STRING', hijos: [$1], linea: yylineno}),$2,$3,$4,$5,$6], linea: yylineno}); }
  | par_izq EXP par_der punto concat par_izq EXP par_der /**--> YA <--**/ { $$ = new NodoAST({label: 'CONCAT', hijos: [$1,$2,$3,$4,$5,$6,$7,$8], linea: yylineno}); }
;

ARRAY_POP
  : id punto pop par_izq par_der { $$ = new NodoAST({label: 'ARRAY_POP', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
  | id LISTA_ACCESOS_ARREGLO punto pop par_izq par_der { $$ = new NodoAST({label: 'ARRAY_POP', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
  | id LISTA_ACCESOS_TYPE punto pop par_izq par_der { $$ = new NodoAST({label: 'ARRAY_POP', hijos: [$1,$2,$3,$4,$5,$6], linea: yylineno}); }
;

TERNARIO
  : EXP interrogacion EXP dos_puntos EXP { $$ = new NodoAST({label: 'TERNARIO', hijos: [$1,$2,$3,$4,$5], linea: yylineno}); }
;

ACCESO_ARREGLO
  : id LISTA_ACCESOS_ARREGLO { $$ = new NodoAST({label: 'ACCESO_ARREGLO', hijos: [$1, $2], linea: yylineno}); }
;

ACCESO_TYPE
  : id LISTA_ACCESOS_TYPE { $$ = new NodoAST({label: 'ACCESO_TYPE', hijos: [$1, $2], linea: yylineno}); }
;

LISTA_ACCESOS_TYPE
  : LISTA_ACCESOS_TYPE punto id { $$ = new NodoAST({label: 'LISTA_ACCESOS_TYPE', hijos: [...$1.hijos,$2,$3], linea: yylineno}); }
  | punto id { $$ = new NodoAST({label: 'LISTA_ACCESOS_TYPE', hijos: [$1,$2], linea: yylineno}); }
  | LISTA_ACCESOS_TYPE punto id LISTA_ACCESOS_ARREGLO { $$ = new NodoAST({label: 'LISTA_ACCESOS_TYPE', hijos: [...$1.hijos,$2,$3,$4], linea: yylineno}); }
  | punto id LISTA_ACCESOS_ARREGLO { $$ = new NodoAST({label: 'LISTA_ACCESOS_TYPE', hijos: [$1,$2,$3], linea: yylineno}); }
;

LISTA_ACCESOS_ARREGLO
  : LISTA_ACCESOS_ARREGLO cor_izq EXP cor_der { $$ = new NodoAST({label: 'LISTA_ACCESOS_ARREGLO', hijos: [...$1.hijos,$2,$3,$4], linea: yylineno}); }
  | cor_izq EXP cor_der { $$ = new NodoAST({label: 'LISTA_ACCESOS_ARREGLO', hijos: [$1,$2,$3], linea: yylineno}); }
;

LISTA_EXPRESIONES
  : LISTA_EXPRESIONES coma EXP { $$ = new NodoAST({label: 'LISTA_EXPRESIONES', hijos: [...$1.hijos,$2,$3], linea: yylineno}); }
  | EXP { $$ = new NodoAST({label: 'LISTA_EXPRESIONES', hijos: [$1], linea: yylineno}); }
;

TIPO_DEC_VARIABLE /**--> YA <--**/
  : let       { $$ = new NodoAST({label: 'TIPO_DEC_VARIABLE', hijos: [$1], linea: yylineno}); }
  | const     { $$ = new NodoAST({label: 'TIPO_DEC_VARIABLE', hijos: [$1], linea: yylineno}); }
;

TIPO_VARIABLE_NATIVA /**--> YA <--**/
  : string  { $$ = new NodoAST({label: 'TIPO_VARIABLE_NATIVA', hijos: [$1], linea: yylineno}); }
  | number  { $$ = new NodoAST({label: 'TIPO_VARIABLE_NATIVA', hijos: [$1], linea: yylineno}); }
  | boolean { $$ = new NodoAST({label: 'TIPO_VARIABLE_NATIVA', hijos: [$1], linea: yylineno}); }
  | void    { $$ = new NodoAST({label: 'TIPO_VARIABLE_NATIVA', hijos: [$1], linea: yylineno}); }
  | id      { $$ = new NodoAST({label: 'TIPO_VARIABLE_NATIVA', hijos: [new NodoAST({label: 'ID', hijos: [$1], linea: yylineno})], linea: yylineno}); }
;

CONSOLE_LOG
  : console punto log par_izq LISTA_EXPRESIONES par_der punto_coma { $$ = new NodoAST({label: 'CONSOLE_LOG', hijos: [$1,$2,$3,$4,$5,$6,$7], linea: yylineno}); }
;
