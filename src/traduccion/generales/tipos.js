"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tiposValidos = exports.getTypeOfNumber = void 0;
function getTypeOfNumber(valor) {
    if (valor.includes('.'))
        return 7 /* FLOAT */;
    return 6 /* INT */;
}
exports.getTypeOfNumber = getTypeOfNumber;
function tiposValidos(t1, t2) {
    if (t1 === t2)
        return true;
    //Si el tipo1 es NUMBER
    if (t1 === 1 /* NUMBER */ && (t2 === 6 /* INT */ || t2 === 7 /* FLOAT */)) {
        return true;
    }
    //Si el tipo2 es NUMBER
    if (t2 === 1 /* NUMBER */ && (t1 === 6 /* INT */ || t1 === 7 /* FLOAT */)) {
        return true;
    }
    return false;
}
exports.tiposValidos = tiposValidos;
