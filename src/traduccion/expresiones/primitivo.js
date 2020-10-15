"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primitivo = void 0;
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
class Primitivo extends nodoAST_1.NodoAST {
    constructor(linea, valor, tipo) {
        super(linea);
        Object.assign(this, { valor, tipo });
    }
    traducir(ts) {
        const temporal = temporal_1.Temporal.getSiguiente();
        switch (this.tipo) {
            case 1 /* NUMBER */:
                codigo3D_1.Codigo3D.addComentario('Lectura de primitivo');
                codigo3D_1.Codigo3D.add(`${temporal} = ${this.valor};`);
                return new control_1.Control({ temporal, tipo: this.tipo });
        }
    }
}
exports.Primitivo = Primitivo;
