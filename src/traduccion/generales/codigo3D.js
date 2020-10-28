"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codigo3D = void 0;
class Codigo3D {
    constructor() {
        this.cadena = '';
        this.traduciendo_funcion = false;
        this.cadena_funciones = '';
    }
    static traduciendoFuncion() {
        return Codigo3D.instance.traduciendo_funcion;
    }
    static getInstance() {
        if (!Codigo3D.instance)
            Codigo3D.instance = new Codigo3D();
        return Codigo3D.instance;
    }
    static add(cadena) {
        //Si estoy traduciendo una funcion
        if (Codigo3D.traduciendoFuncion()) {
            Codigo3D.getInstance().cadena_funciones += cadena + '\n';
        }
        //Si no estoy traduciendo una funcion
        else {
            Codigo3D.getInstance().cadena += cadena + '\n';
        }
    }
    static addInit(cadena) {
        Codigo3D.getInstance().cadena = cadena + '\n' + Codigo3D.getInstance().cadena;
    }
    static addComentario(cadena) {
        //Si estoy traduciendo una funcion
        if (Codigo3D.traduciendoFuncion()) {
            Codigo3D.getInstance().cadena_funciones += `/***** ${cadena} ******/\n`;
        }
        //Si no estoy traduciendo una funcion
        else {
            Codigo3D.getInstance().cadena += `/***** ${cadena} ******/\n`;
        }
    }
    static getCodigo() {
        return Codigo3D.getInstance().cadena;
    }
    static getCodigoFunciones() {
        return Codigo3D.getInstance().cadena_funciones;
    }
    static clear() {
        Codigo3D.getInstance().cadena = '';
        Codigo3D.getInstance().cadena_funciones = '';
    }
}
exports.Codigo3D = Codigo3D;
