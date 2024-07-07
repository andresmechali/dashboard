import dataRaw from "./data.csv";

export const data: DataItem[] = dataRaw.map((item, id) => ({
  ...item,
  id,
  semana: Number(item.semana),
  usd_amount: Number(item.usd_amount),
  estado: item.estado.trim() as Estado,
  tipo_tarjeta: item.tipo_tarjeta.trim() as TipoTarjeta,
  codigo_rechazo: item.codigo_rechazo as CodigoRechazo,
}));

export const filterData = ({
  semana,
  tipo_tarjeta,
  estado,
  codigoRechazo,
  ultimoItentoDiario,
  nroCuenta,
  nroComercio,
}: Filters) => {
  return data.filter((item) => {
    if (semana && !semana.includes(item.semana)) {
      return false;
    }
    if (tipo_tarjeta && !tipo_tarjeta.includes(item.tipo_tarjeta)) {
      return false;
    }
    if (estado && !estado.includes(item.estado)) {
      return false;
    }
    if (codigoRechazo && !codigoRechazo.includes(item.codigo_rechazo)) {
      return false;
    }
    if (
      ultimoItentoDiario &&
      !ultimoItentoDiario.includes(item.es_ultimo_intento_diario)
    ) {
      return false;
    }
    if (nroCuenta && !nroCuenta.includes(item.nro_cuenta)) {
      return false;
    }
    if (nroComercio && !nroComercio.includes(item.nro_comercio)) {
      return false;
    }
    return true;
  });
};

export const getUniques = <T, K extends keyof T>(
  items: T[],
  key: K,
): T[K][] => {
  const uniqueSet = new Set<T[K]>();
  items.forEach((item) => {
    uniqueSet.add(item[key]);
  });
  const array = Array.from(uniqueSet);

  return array.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
};

export const formatNumber = (n: number): string => {
  // Check if the number is different from its integer part
  if (n !== Math.floor(n)) {
    // If true, it has decimals, so apply toFixed
    return n.toFixed(2);
  } else {
    // If false, return the number as a string without modification
    return n.toString();
  }
};
