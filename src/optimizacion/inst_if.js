"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InstIf = void 0;
const Instruccion_1 = require("./Instruccion");
class InstIf extends Instruccion_1.Instruccion {
    constructor(linea, codigo, op1, op, op2) {
        super(linea, codigo);
        Object.assign(this, { op1, op, op2 });
    }
    optimizar() {
        return this.codigo;
    }
    canOptimize() {
        if (this.isNumeric(this.op1) && this.isNumeric(this.op2)) {
            if (this.op == '==') {
                return this.op1 == this.op2;
            }
            else if (this.op == '!=') {
                return this.op1 != this.op2;
            }
        }
        return false;
    }
    isNumeric(val) {
        const temp = +val;
        return !isNaN(temp);
    }
}
exports.InstIf = InstIf;
