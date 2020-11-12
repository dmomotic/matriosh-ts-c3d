"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionTresDirecciones = void 0;
const instruccion_con_optimizacion_1 = require("./instruccion_con_optimizacion");
const optimizaciones_1 = require("./optimizaciones");
const optimizacion_1 = require("./optimizacion");
class AsignacionTresDirecciones extends instruccion_con_optimizacion_1.InstruccionConOptimizacion {
    constructor(linea, codigo, dir1, dir2, op, dir3) {
        super(linea, codigo);
        Object.assign(this, { dir1, dir2, op, dir3 });
    }
    optimizar() {
        let salida = this.codigo;
        let regla = '';
        if (!this.isNumeric(this.dir2) && this.isNumeric(this.dir3)) {
            // Regla 6  -> T1 = t1 + 0; -> codigo eliminado
            if (this.dir1 == this.dir2 && this.op == '+' && +this.dir3 == 0) {
                salida = '';
                regla = '6';
            }
            // Regla 7  -> T1 = t1 - 0; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '-' && +this.dir3 == 0) {
                salida = '';
                regla = '7';
            }
            // Regla 8  -> T1 = t1 * 1; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '*' && +this.dir3 == 1) {
                salida = '';
                regla = '8';
            }
            // Regla 9  -> T1 = t1 / 1; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '/' && +this.dir3 == 1) {
                salida = '';
                regla = '9';
            }
            // Regla 10  -> y = x + 0; -> y = x;
            else if (this.dir1 != this.dir2 && this.op == '+' && +this.dir3 == 0) {
                salida = `${this.dir1} = ${this.dir2};`;
                regla = '10';
            }
            // Regla 11  -> y = x - 0; -> y = x;
            else if (this.dir1 != this.dir2 && this.op == '-' && +this.dir3 == 0) {
                salida = `${this.dir1} = ${this.dir2};`;
                regla = '11';
            }
            // Regla 12  -> y = x * 1; -> y = x ;
            else if (this.dir1 != this.dir2 && this.op == '*' && +this.dir3 == 1) {
                salida = `${this.dir1} = ${this.dir2};`;
                regla = '12';
            }
            // Regla 13  -> y = x / 1; -> y = x;
            else if (this.dir1 != this.dir2 && this.op == '/' && +this.dir3 == 1) {
                salida = `${this.dir1} = ${this.dir2};`;
                regla = '13';
            }
            // Regla 14  -> x = y * 2; -> x = y + y ;
            else if (this.dir1 != this.dir2 && this.op == '*' && +this.dir3 == 2) {
                salida = `${this.dir1} = ${this.dir2} + ${this.dir2};`;
                regla = '14';
            }
            // Regla 15  -> x = y * 0; -> x = 0 ;
            else if (this.op == '*' && +this.dir3 == 0) {
                salida = `${this.dir1} = 0;`;
                regla = '15';
            }
            // Regla 16  -> x = y / 0; -> x = 0 ;
            else if (this.op == '/' && +this.dir3 == 0) {
                salida = `${this.dir1} = 0;`;
                regla = '16';
            }
        }
        else if (this.isNumeric(this.dir2) && !this.isNumeric(this.dir3)) {
            // Regla 6  -> T1 = 0 + t1; -> codigo eliminado
            if (this.dir1 == this.dir3 && this.op == '+' && +this.dir2 == 0) {
                salida = '';
                regla = '6';
            }
            // Regla 8  -> T1 = 1 * t1; -> codigo eliminado
            else if (this.dir1 == this.dir3 && this.op == '*' && +this.dir2 == 1) {
                salida = '';
                regla = '8';
            }
            // Regla 10  -> y = 0 + x; -> y = x;
            else if (this.dir1 != this.dir3 && this.op == '+' && +this.dir2 == 0) {
                salida = `${this.dir1} = ${this.dir3};`;
                regla = '10';
            }
            // Regla 12  -> y = 1 * x; -> y = x ;
            else if (this.dir1 != this.dir3 && this.op == '*' && +this.dir2 == 1) {
                salida = `${this.dir1} = ${this.dir3};`;
                regla = '12';
            }
            // Regla 14  -> x = 2 * y; -> x = y + y ;
            else if (this.dir1 != this.dir3 && this.op == '*' && +this.dir2 == 2) {
                salida = `${this.dir1} = ${this.dir3} + ${this.dir3};`;
                regla = '14';
            }
            // Regla 15  -> x = 0 * y; -> x = 0 ;
            else if (this.op == '*' && +this.dir2 == 0) {
                salida = `${this.dir1} = 0;`;
                regla = '15';
            }
            // Regla 16  -> x = 0 / y; -> x = 0 ;
            else if (this.op == '/' && +this.dir2 == 0) {
                salida = `${this.dir1} = 0;`;
                regla = '16';
            }
        }
        //Si hubo alguna optimizacion
        if (this.codigo != salida) {
            salida += '\n';
            optimizaciones_1.Optimizaciones.add(new optimizacion_1.Optimizacion(this.linea, this.codigo, salida, regla));
        }
        return salida;
    }
    isNumeric(val) {
        const temp = +val;
        return !isNaN(temp);
    }
}
exports.AsignacionTresDirecciones = AsignacionTresDirecciones;
