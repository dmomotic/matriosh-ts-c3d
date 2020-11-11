"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsignacionTresDirecciones = void 0;
const instruccion_con_optimizacion_1 = require("./instruccion_con_optimizacion");
const _ = require("lodash");
class AsignacionTresDirecciones extends instruccion_con_optimizacion_1.InstruccionConOptimizacion {
    constructor(linea, codigo, dir1, dir2, op, dir3) {
        super(linea, codigo);
        Object.assign(this, { dir1: dir1.toLowerCase(), dir2: dir2.toLowerCase(), op, dir3: dir3.toLowerCase() });
    }
    optimizar() {
        if (!this.isNumeric(this.dir2) && this.isNumeric(this.dir3)) {
            // Regla 6  -> T1 = t1 + 0; -> codigo eliminado
            if (this.dir1 == this.dir2 && this.op == '+' && +this.dir3 == 0)
                return '';
            // Regla 7  -> T1 = t1 - 0; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '-' && +this.dir3 == 0)
                return '';
            // Regla 8  -> T1 = t1 * 1; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '*' && +this.dir3 == 1)
                return '';
            // Regla 9  -> T1 = t1 / 1; -> codigo eliminado
            else if (this.dir1 == this.dir2 && this.op == '/' && +this.dir3 == 1)
                return '';
            // Regla 10  -> y = x + 0; -> y = x;
            else if (this.dir1 != this.dir2 && this.op == '+' && +this.dir3 == 0)
                return `${this.dir1} = ${this.dir2};`;
        }
        else if (this.isNumeric(this.dir2) && !this.isNumeric(this.dir3)) {
            // Regla 6  -> T1 = 0 + t1; -> codigo eliminado
            if (this.dir1 == this.dir3 && this.op == '+' && +this.dir2 == 0)
                return '';
            // Regla 8  -> T1 = 1 * t1; -> codigo eliminado
            else if (this.dir1 == this.dir3 && this.op == '*' && +this.dir2 == 1)
                return '';
            // Regla 10  -> y = 0 + x; -> y = x;
            else if (this.dir1 != this.dir3 && this.op == '+' && +this.dir2 == 0)
                return `${this.dir1} = ${this.dir3};`;
        }
        return this.codigo;
    }
    isNumeric(val) {
        return !_.isNaN(val);
    }
}
exports.AsignacionTresDirecciones = AsignacionTresDirecciones;
