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

// const semanaUsdMap = data.reduce<Record<number, number>>((acc, curr) => {
//   acc[curr.semana] = acc[curr.semana]
//     ? acc[curr.semana] + curr.usd_amount
//     : curr.usd_amount;
//   return acc;
// }, {});
//
// const dataSemanaUsd = Object.entries(semanaUsdMap).map(
//   ([semana, usd_amount]) => ({
//     semana,
//     usd_amount,
//   }),
// );

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

console.log(getUniques(data, "nro_comercio"));

// const allWeeks = getUniques(dataSemanaUsd, "semana");
