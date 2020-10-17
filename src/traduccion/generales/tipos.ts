export const enum TIPO_DATO {
  STRING, NUMBER, BOOLEAN, TYPE, ARRAY, VOID, INT, FLOAT, NULL
}

export function getTypeOfNumber(valor: string): TIPO_DATO{
  if(valor.includes('.')) return TIPO_DATO.FLOAT;
  return TIPO_DATO.INT;
}

export function tiposValidos(t1: TIPO_DATO, t2: TIPO_DATO) : boolean {
  if(t1 === t2) return true;
  //Si el tipo1 es NUMBER
  if(t1 === TIPO_DATO.NUMBER && (t2 === TIPO_DATO.INT || t2 === TIPO_DATO.FLOAT )){
    return true;
  }
  //Si el tipo2 es NUMBER
  if(t2 === TIPO_DATO.NUMBER && (t1 === TIPO_DATO.INT || t1 === TIPO_DATO.FLOAT )){
    return true;
  }

  return false;
}
