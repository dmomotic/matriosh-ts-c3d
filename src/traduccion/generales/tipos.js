"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNombreDeTipo = exports.isTipoVoid = exports.isTipoNull = exports.isTipoArray = exports.isTipoType = exports.isTipoString = exports.isTipoBoolean = exports.isTipoNumber = exports.tiposValidos = exports.getTypeOfNumber = void 0;
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
function isTipoNumber(tipo) {
    return tipo == 1 /* NUMBER */ || tipo == 6 /* INT */ || tipo == 7 /* FLOAT */;
}
exports.isTipoNumber = isTipoNumber;
function isTipoBoolean(tipo) {
    return tipo == 2 /* BOOLEAN */;
}
exports.isTipoBoolean = isTipoBoolean;
function isTipoString(tipo) {
    return tipo == 0 /* STRING */;
}
exports.isTipoString = isTipoString;
function isTipoType(tipo) {
    return tipo == 3 /* TYPE */;
}
exports.isTipoType = isTipoType;
function isTipoArray(tipo) {
    return tipo == 4 /* ARRAY */;
}
exports.isTipoArray = isTipoArray;
function isTipoNull(tipo) {
    return tipo == 8 /* NULL */;
}
exports.isTipoNull = isTipoNull;
function isTipoVoid(tipo) {
    return tipo == 5 /* VOID */;
}
exports.isTipoVoid = isTipoVoid;
function getNombreDeTipo(tipo) {
    switch (tipo) {
        case 0 /* STRING */:
            return 'String';
        case 1 /* NUMBER */:
            return 'Number';
        case 2 /* BOOLEAN */:
            return 'Boolean';
        case 3 /* TYPE */:
            return 'Type';
        case 4 /* ARRAY */:
            return 'Array';
        case 5 /* VOID */:
            return 'Void';
        case 6 /* INT */:
            return 'Int';
        case 7 /* FLOAT */:
            return 'Float';
        case 8 /* NULL */:
            return 'Null';
    }
}
exports.getNombreDeTipo = getNombreDeTipo;
