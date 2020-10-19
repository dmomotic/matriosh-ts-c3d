"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Primitivo = void 0;
const codigo3D_1 = require("../generales/codigo3D");
const nodoAST_1 = require("../generales/nodoAST");
const temporal_1 = require("../generales/temporal");
const control_1 = require("../utils/control");
const control_funcion_1 = require("../utils/control_funcion");
class Primitivo extends nodoAST_1.NodoAST {
    constructor(linea, valor, tipo) {
        super(linea);
        Object.assign(this, { valor, tipo });
    }
    traducir(ts) {
        const temporal = temporal_1.Temporal.getSiguiente();
        //GUARDO EL TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(temporal);
        switch (this.tipo) {
            case 1 /* NUMBER */:
                codigo3D_1.Codigo3D.addComentario('Lectura de number');
                codigo3D_1.Codigo3D.add(`${temporal} = ${this.valor};`);
                return new control_1.Control({ temporal, tipo: this.tipo });
            case 6 /* INT */:
                codigo3D_1.Codigo3D.addComentario('Lectura de int');
                codigo3D_1.Codigo3D.add(`${temporal} = ${this.valor};`);
                return new control_1.Control({ temporal, tipo: this.tipo });
            case 7 /* FLOAT */:
                codigo3D_1.Codigo3D.addComentario('Lectura de float');
                codigo3D_1.Codigo3D.add(`${temporal} = ${this.valor};`);
                return new control_1.Control({ temporal, tipo: this.tipo });
            case 0 /* STRING */:
                codigo3D_1.Codigo3D.addComentario('Lectura de String');
                //Capturo la posicion libre del Heap
                codigo3D_1.Codigo3D.add(`${temporal} = H; //Punto donde inicia la cadena`);
                //Lleno las posiciones correspondientes
                for (let i = 0; i < this.valor.length; i++) {
                    //Si es una linea nueva \n
                    if (this.valor.charAt(i) == '\\' && i + 1 < this.valor.length && this.valor.charAt(i + 1) == 'n') {
                        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${10};`);
                        codigo3D_1.Codigo3D.add(`H = H + 1;`);
                        i++;
                    }
                    else {
                        let ascii = this.valor.charCodeAt(i);
                        codigo3D_1.Codigo3D.add(`Heap[(int)H] = ${ascii};`);
                        codigo3D_1.Codigo3D.add(`H = H + 1;`);
                    }
                }
                //Asigno caracter de escape
                codigo3D_1.Codigo3D.add(`Heap[(int)H] = -1;`);
                codigo3D_1.Codigo3D.add(`H = H + 1;`);
                return new control_1.Control({ temporal, tipo: this.tipo });
            case 2 /* BOOLEAN */:
                codigo3D_1.Codigo3D.addComentario('Lectura de boolean');
                codigo3D_1.Codigo3D.add(`${temporal} = ${this.valor};`);
                return new control_1.Control({ temporal, tipo: this.tipo });
        }
    }
}
exports.Primitivo = Primitivo;
