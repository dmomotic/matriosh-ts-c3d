"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Potencia = void 0;
const error_1 = require("../../../arbol/error");
const errores_1 = require("../../../arbol/errores");
const codigo3D_1 = require("../../generales/codigo3D");
const etiqueta_1 = require("../../generales/etiqueta");
const nodoAST_1 = require("../../generales/nodoAST");
const temporal_1 = require("../../generales/temporal");
const tipos_1 = require("../../generales/tipos");
const control_1 = require("../../utils/control");
const control_funcion_1 = require("../../utils/control_funcion");
class Potencia extends nodoAST_1.NodoAST {
    constructor(linea, op_izq, op_der) {
        super(linea);
        Object.assign(this, { op_izq, op_der });
    }
    traducir(ts) {
        const control_izq = this.op_izq.traducir(ts);
        const control_der = this.op_der.traducir(ts);
        //Validaciones
        if (!control_izq) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando izquierdo de la Potencia` }));
            return;
        }
        if (!control_der) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se pudo obtener la instancia de control para el operando derecho de la Potencia` }));
            return;
        }
        //Comprobacion de tipo
        const tipo = this.getTipoResultante(control_izq.tipo, control_der.tipo);
        if (tipo === 8 /* NULL */) {
            errores_1.Errores.push(new error_1.Error({ tipo: 'semantico', linea: this.linea, descripcion: `No se puede realizar una Potencia con los tipos ${tipos_1.getNombreDeTipo(control_izq.tipo)} y ${tipos_1.getNombreDeTipo(control_der.tipo)}` }));
            return;
        }
        const temporal = temporal_1.Temporal.getSiguiente();
        //REMUEVO TEMPORALES A UTILIZAR
        control_funcion_1.ControlFuncion.removerTemporal(control_izq.temporal);
        control_funcion_1.ControlFuncion.removerTemporal(control_der.temporal);
        //GUARDO TEMPORAL
        control_funcion_1.ControlFuncion.guardarTemporal(temporal);
        switch (tipo) {
            case 6 /* INT */:
                codigo3D_1.Codigo3D.addComentario('Potencia con resultado int');
                codigo3D_1.Codigo3D.add(`${temporal} = 1;`); //Valor inicial
                const temp_ciclo = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_ciclo} = (int) ${control_der.temporal};`);
                const lbl_ciclo = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_true = etiqueta_1.Etiqueta.getSiguiente();
                const lbl_false = etiqueta_1.Etiqueta.getSiguiente();
                codigo3D_1.Codigo3D.add(`${lbl_ciclo}:`);
                codigo3D_1.Codigo3D.add(`if(${temp_ciclo} > 0) goto ${lbl_true};`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_false};`);
                codigo3D_1.Codigo3D.add(`${lbl_true}:`);
                const temp_redondeo = temporal_1.Temporal.getSiguiente();
                codigo3D_1.Codigo3D.add(`${temp_redondeo} = (int)${control_izq.temporal};`);
                codigo3D_1.Codigo3D.add(`${temporal} = ${temporal} * ${temp_redondeo};`);
                codigo3D_1.Codigo3D.add(`${temp_ciclo} = ${temp_ciclo} - 1;`);
                codigo3D_1.Codigo3D.add(`goto ${lbl_ciclo};`);
                codigo3D_1.Codigo3D.add(`${lbl_false}:`);
                return new control_1.Control({ temporal, tipo });
        }
    }
    getTipoResultante(t1, t2) {
        //Number ** Number
        if ((t1 == 7 /* FLOAT */ || t1 == 6 /* INT */) && (t2 == 7 /* FLOAT */ || t2 == 6 /* INT */))
            return 6 /* INT */;
        //Solo por seguridad
        if (tipos_1.isTipoNumber(t1) && tipos_1.isTipoNumber(t2))
            return 6 /* INT */;
        //Cualquier otra combinacion
        return 8 /* NULL */;
    }
}
exports.Potencia = Potencia;
