export const prepareData = (dataRaw: DataItemRaw[]): DataItem[] =>
  dataRaw.map((item, id) => {
    try {
      return {
        ...item,
        id,
        semana: item.semana,
        usd_amount: Number(item.usd_amount),
        estado: item.estado.trim() as Estado,
        tipo_tarjeta: item.tipo_tarjeta.trim() as TipoTarjeta,
        codigo_rechazo: item.codigo_rechazo as CodigoRechazo,
      };
    } catch {
      console.log({ item });
      return {
        ...item,
        id,
        semana: item.semana,
        usd_amount: Number(item.usd_amount),
        estado: item.estado as Estado,
        tipo_tarjeta: item.tipo_tarjeta.trim() as TipoTarjeta,
        codigo_rechazo: item.codigo_rechazo as CodigoRechazo,
      };
    }
  });

export const filterData = (
  data: DataItem[],
  {
    semana,
    tipo_tarjeta,
    estado,
    codigoRechazo,
    ultimoItentoDiario,
    nroCuenta,
    nroComercio,
  }: Filters,
) => {
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
  if (n !== Math.floor(n)) {
    return n.toFixed(2);
  } else {
    return n.toString();
  }
};
