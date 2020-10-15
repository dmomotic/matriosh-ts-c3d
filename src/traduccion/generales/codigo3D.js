"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Codigo3D = void 0;
class Codigo3D {
    constructor() {
        this.cadena = '';
    }
    static getInstance() {
        if (!Codigo3D.instance)
            Codigo3D.instance = new Codigo3D();
        return Codigo3D.instance;
    }
    static add(cadena) {
        Codigo3D.getInstance().cadena += cadena + '\n';
    }
    static addComentario(cadena) {
        Codigo3D.getInstance().cadena += `/***** ${cadena} ******/\n`;
    }
    static getCodigo() {
        return Codigo3D.getInstance().cadena;
    }
}
exports.Codigo3D = Codigo3D;
