export const enum TIPO_DATO {
  STRING, NUMBER, BOOLEAN, TYPE, ARRAY, VOID, INT, FLOAT, NULL
}

export function getTypeOfNumber(valor: string): TIPO_DATO {
  if (valor.includes('.')) return TIPO_DATO.FLOAT;
  return TIPO_DATO.INT;
}

export function tiposValidos(t1: TIPO_DATO, t2: TIPO_DATO): boolean {
  if (t1 === t2) return true;
  //Si el tipo1 es NUMBER
  if (t1 === TIPO_DATO.NUMBER && (t2 === TIPO_DATO.INT || t2 === TIPO_DATO.FLOAT)) {
    return true;
  }
  //Si el tipo2 es NUMBER
  if (t2 === TIPO_DATO.NUMBER && (t1 === TIPO_DATO.INT || t1 === TIPO_DATO.FLOAT)) {
    return true;
  }

  return false;
}

export function isTipoNumber(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.NUMBER || tipo == TIPO_DATO.INT || tipo == TIPO_DATO.FLOAT;
}

export function isTipoBoolean(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.BOOLEAN;
}

export function isTipoString(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.STRING;
}

export function isTipoType(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.TYPE;
}

export function isTipoArray(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.ARRAY;
}

export function isTipoNull(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.NULL;
}

export function isTipoVoid(tipo: TIPO_DATO): boolean{
  return tipo == TIPO_DATO.VOID;
}

export function getNombreDeTipo(tipo: TIPO_DATO): string {
  switch (tipo) {
    case TIPO_DATO.STRING:
      return 'String';
    case TIPO_DATO.NUMBER:
      return 'Number';
    case TIPO_DATO.BOOLEAN:
      return 'Boolean';
    case TIPO_DATO.TYPE:
      return 'Type';
    case TIPO_DATO.ARRAY:
      return 'Array';
    case TIPO_DATO.VOID:
      return 'Void';
    case TIPO_DATO.INT:
      return 'Int';
    case TIPO_DATO.FLOAT:
      return 'Float';
    case TIPO_DATO.NULL:
      return 'Null';
  }
}
