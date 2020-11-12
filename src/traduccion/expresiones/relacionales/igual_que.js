"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IgualQue = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class IgualQue extends nodoAST_1.NodoAST {
    constructor(linea, op_izq, op_der) {
        super(linea);
        Object.assign(this, { op_izq, op_der });
    }
    traducir(ts) {
        const control_izq = this.op_izq.traducir(ts);
        const control_der = this.op_der.traducir(ts);
        //Validaciones
        if (!control_izq) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la operacion IGUAL QUE` }));
            return;
        }
        if (!control_der) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la operacion IGUAL QUE` }));
            return;
        }
        //Comprobacion de tipo
        const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
        if (tipo === 8 /* NULL */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una operacion IGUAL QUE con los tipos ${tipos_1.getNombreDeTipo(control_izq.tipo)} y ${tipos_1.getNombreDeTipo(control_der.tipo)}` }));
            return;
        }
        //REMUEVO TEMPORALES A UTILIZAR
        control_funcion_1.ControlFuncion.removerTemporal(control_izq.temporal);
        control_funcion_1.ControlFuncion.removerTemporal(control_der.temporal);
        //CREO LISTA DE ETIQUETAS VERDADERAS Y FALSAS
        let verdaderas = [];
        let falsas = [];
        codigo3D_1.Codigo3D.addComentario(`${tipos_1.getNombreDeTipo(control_izq.tipo)} == ${tipos_1.getNombreDeTipo(control_der.tipo)}`);
        //Si es una comparacion de tipos numericos o si es una comparacion de tipos boolean
        if ((tipos_1.isTipoNumber(control_izq.tipo) && tipos_1.isTipoNumber(control_der.tipo)) || (tipos_1.isTipoBoolean(control_izq.tipo) && tipos_1.isTipoBoolean(control_der.tipo))) {
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            verdaderas.push(lbl_true);
            falsas.push(lbl_false);
            codigo3D_1.Codigo3D.add(`if(${control_izq.temporal} == ${control_der.temporal}) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            return new control_1.Control({ tipo, verdaderas, falsas });
        }
        //Si es una comparacion de tipos string
        else if (tipos_1.isTipoString(control_izq.tipo) && tipos_1.isTipoString(control_der.tipo)) {
            const temp_c1_init = temporal_1.Temporal.getSiguiente();
            const temp_c2_init = temporal_1.Temporal.getSiguiente();
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            verdaderas.push(lbl_true);
            falsas.push(lbl_false);
            codigo3D_1.Codigo3D.add(`${temp_c1_init} = ${control_izq.temporal};`);
            codigo3D_1.Codigo3D.add(`${temp_c2_init} = ${control_der.temporal};`);
            //TODO: hacer validacion de nulls
            const temp_c1 = temporal_1.Temporal.getSiguiente();
            const temp_c2 = temporal_1.Temporal.getSiguiente();
            const lbl_inicio = etiqueta_1.Etiqueta.getSiguiente();
            codigo3D_1.Codigo3D.add(`${lbl_inicio}:`);
            codigo3D_1.Codigo3D.add(`${temp_c1} = Heap[(int)${temp_c1_init}];`);
            codigo3D_1.Codigo3D.add(`${temp_c2} = Heap[(int)${temp_c2_init}];`);
            codigo3D_1.Codigo3D.add(`if(${temp_c1} != ${temp_c2}) goto ${lbl_false};`);
            codigo3D_1.Codigo3D.add(`if(${temp_c1} == -1) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`${temp_c1_init} = ${temp_c1_init} + 1;`);
            codigo3D_1.Codigo3D.add(`${temp_c2_init} = ${temp_c2_init} + 1;`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_inicio};`);
            return new control_1.Control({ tipo, verdaderas, falsas });
        }
        //Para el resto de tipos
        else {
            const temp_c1_init = temporal_1.Temporal.getSiguiente();
            const temp_c2_init = temporal_1.Temporal.getSiguiente();
            const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
            const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
            verdaderas.push(lbl_true);
            falsas.push(lbl_false);
            codigo3D_1.Codigo3D.add(`${temp_c1_init} = ${control_izq.temporal};`);
            codigo3D_1.Codigo3D.add(`${temp_c2_init} = ${control_der.temporal};`);
            codigo3D_1.Codigo3D.add(`if(${temp_c1_init} == ${temp_c2_init}) goto ${lbl_true};`);
            codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
            return new control_1.Control({ tipo, verdaderas, falsas });
        }
    }
    getTipoResultante(t1, t2) {
        if ((t1 == 7 /* FLOAT */ || t1 == 6 /* INT */) && (t2 == 7 /* FLOAT */ || t2 == 6 /* INT */))
            return 2 /* BOOLEAN */;
        if (t1 == 2 /* BOOLEAN */ && t2 == 2 /* BOOLEAN */)
            return 2 /* BOOLEAN */;
        if (t1 == 0 /* STRING */ && t2 == 0 /* STRING */)
            return 2 /* BOOLEAN */;
        if (t1 == 3 /* TYPE */ && t2 == 3 /* TYPE */)
            return 2 /* BOOLEAN */;
        if (t1 == 4 /* ARRAY */ && t2 == 4 /* ARRAY */)
            return 2 /* BOOLEAN */;
        if (t1 == 3 /* TYPE */ && t2 == 8 /* NULL */)
            return 2 /* BOOLEAN */;
        if (t1 == 4 /* ARRAY */ && t2 == 8 /* NULL */)
            return 2 /* BOOLEAN */;
        if (t1 == 0 /* STRING */ && t2 == 8 /* NULL */)
            return 2 /* BOOLEAN */;
        if (t1 == 8 /* NULL */ && t2 == 4 /* ARRAY */)
            return 2 /* BOOLEAN */;
        if (t1 == 8 /* NULL */ && t2 == 0 /* STRING */)
            return 2 /* BOOLEAN */;
        if (t1 == 8 /* NULL */ && t2 == 3 /* TYPE */)
            return 2 /* BOOLEAN */;
        if (t1 == 8 /* NULL */ && t2 == 8 /* NULL */)
            return 2 /* BOOLEAN */;
        //Cualquier otra combinacion
        return 8 /* NULL */;
    }
}
exports.IgualQue = IgualQue;
