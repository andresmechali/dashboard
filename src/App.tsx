import { useEffect, useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  Line,
  Tooltip,
  ComposedChart,
  Bar,
  TooltipProps,
} from "recharts";
import Papa from "papaparse";
import { Select, Spin } from "antd";
import "./App.css";
import { filterData, formatNumber, getUniques, prepareData } from "./utils.ts";

const CustomTooltip = ({
  active,
  payload,
  label,
  type,
}: TooltipProps<number, number> & { type: "tpn" | "tpv" }) => {
  if (active && payload && payload.length) {
    const value = payload[0].payload[type];
    const ratio =
      type === "tpv"
        ? payload[0].payload.ratioTpv
        : payload[0].payload.ratioTpn;
    return (
      <div className="custom-tooltip">
        <p className="desc">Semana: {label}</p>
        <p className="label">{`${type} : ${formatNumber(value)}` || "-"}</p>
        <p className="label">{`ratio ${type} : ${formatNumber(ratio * 100)}%`}</p>
      </div>
    );
  }

  return null;
};

function App() {
  const [data, setData] = useState<DataItem[]>();
  const [appliedFilters, setAppliedFilters] = useState<Filters>({});
  const [allSemana, setAllSemana] = useState<string[]>([]);
  const [allNroComercio, setAllNroComercio] = useState<string[]>([]);
  const [allNroCuenta, setAllNroCuenta] = useState<string[]>([]);
  const [allReintento, setAllReintento] = useState<string[]>([]);
  const [allTipoTarjeta, setAllTipoTarjeta] = useState<TipoTarjeta[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetch("/data.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<DataItemRaw>(csvText, {
          complete: (result) => {
            console.log(result.data);
            console.log("---");
            const preparedData = prepareData(result.data);
            setData(preparedData);

            const allSemana = getUniques(preparedData, "semana");
            setAllSemana(allSemana);
            const allNroComercio = getUniques(preparedData, "nro_comercio");
            setAllNroComercio(allNroComercio);
            const allNroCuenta = getUniques(preparedData, "nro_cuenta");
            setAllNroCuenta(allNroCuenta);
            const allReintento = ["0", "1"];
            setAllReintento(allReintento);
            const allTipoTarjeta: TipoTarjeta[] = ["debito", "credito"];
            setAllTipoTarjeta(allTipoTarjeta);

            setAppliedFilters({
              semana: allSemana,
              nroComercio: allNroComercio,
              nroCuenta: allNroCuenta,
              ultimoItentoDiario: allReintento,
              tipo_tarjeta: allTipoTarjeta,
            });

            setLoading(false);
          },
          header: true,
        });
      });
  }, []);

  const filteredData = useMemo(() => {
    if (data) {
      return filterData(data, appliedFilters);
    }
  }, [data, appliedFilters]);

  const dataByWeek = useMemo(() => {
    return filteredData?.reduce<
      Record<
        string,
        {
          tpn: number;
          tpv: number;
          approTpn: number;
          approTpv: number;
          anuladoTpn: number;
          anuladoTpv: number;
          rechazadoTpn: number;
          rechazadoTpv: number;
        }
      >
    >((acc, curr) => {
      if (!acc[curr.semana]) {
        acc[curr.semana] = {
          tpn: 0,
          tpv: 0,
          approTpn: 0,
          approTpv: 0,
          anuladoTpn: 0,
          anuladoTpv: 0,
          rechazadoTpn: 0,
          rechazadoTpv: 0,
        };
      }

      acc[curr.semana].tpn += 1;
      acc[curr.semana].tpv += curr.usd_amount;

      if (curr.estado === "APROBADA") {
        acc[curr.semana].approTpn += 1;
        acc[curr.semana].approTpv += curr.usd_amount;
      } else if (curr.estado === "ANULADA") {
        acc[curr.semana].anuladoTpn += 1;
        acc[curr.semana].anuladoTpv += curr.usd_amount;
      } else {
        acc[curr.semana].rechazadoTpn += 1;
        acc[curr.semana].rechazadoTpv += curr.usd_amount;
      }

      return acc;
    }, {});
  }, [filteredData]);

  const dataWeekly = useMemo(() => {
    if (!dataByWeek) {
      return undefined;
    }
    return Object.entries(dataByWeek).map(([semana, entry]) => ({
      semana,
      ...entry,
      ratioTpn: entry.approTpn / entry.tpn,
      ratioTpv: entry.approTpv / entry.tpv,
    }));
  }, [dataByWeek]);

  if (loading) {
    return <Spin size="large" />;
  }

  return (
    <>
      <h1>Dashboard</h1>
      <h3>Aprobación TPV/TPN</h3>
      <div className="appro-charts">
        <ComposedChart
          width={500}
          height={300}
          data={dataWeekly}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Tooltip content={<CustomTooltip type="tpv" />} />
          <XAxis dataKey="semana" />
          <YAxis yAxisId="tpvLeft" />
          <YAxis orientation="right" yAxisId="tpvRight" />
          <Bar
            dataKey="anuladoTpv"
            stackId="tpv"
            fill="#ffc658"
            yAxisId="tpvLeft"
          />
          <Bar
            dataKey="rechazadoTpv"
            stackId="tpv"
            fill="#8884d8"
            yAxisId="tpvLeft"
          />
          <Bar
            dataKey="approTpv"
            stackId="tpv"
            fill="#82ca9d"
            yAxisId="tpvLeft"
          />
          <Line
            type="monotone"
            dataKey="ratioTpv"
            stroke="#fff"
            activeDot={{ r: 8 }}
            yAxisId="tpvRight"
          />
        </ComposedChart>

        <ComposedChart
          width={500}
          height={300}
          data={dataWeekly}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <Tooltip content={<CustomTooltip type="tpn" />} />
          <XAxis dataKey="semana" />
          <YAxis yAxisId="tpnLeft" />
          <YAxis orientation="right" yAxisId="tpnRight" />
          <Bar
            dataKey="anuladoTpn"
            stackId="tpv"
            fill="#ffc658"
            yAxisId="tpnLeft"
          />
          <Bar
            dataKey="rechazadoTpn"
            stackId="tpv"
            fill="#8884d8"
            yAxisId="tpnLeft"
          />
          <Bar
            dataKey="approTpn"
            stackId="tpv"
            fill="#82ca9d"
            yAxisId="tpnLeft"
          />
          <Line
            type="monotone"
            dataKey="ratioTpn"
            stroke="#fff"
            activeDot={{ r: 8 }}
            yAxisId="tpnRight"
            strokeWidth={2}
          />
        </ComposedChart>
      </div>

      <div className="filters">
        <div>
          <div>Semana</div>
          <Select
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            maxTagCount="responsive"
            defaultValue={allSemana}
            value={appliedFilters.semana}
            onChange={(newValue) => {
              setAppliedFilters({
                ...appliedFilters,
                semana: newValue.includes("Todos") ? allSemana : newValue,
              });
            }}
            options={[{ value: "Todos", label: "Todos" }].concat(
              allSemana.map((semana) => ({
                value: semana,
                label: semana,
              })),
            )}
          />
        </div>

        <div>
          <div>Nro comercio</div>
          <Select
            id="select-nro-comercio"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            maxTagCount="responsive"
            defaultValue={allNroComercio}
            value={appliedFilters.nroComercio}
            onChange={(newValue) => {
              setAppliedFilters({
                ...appliedFilters,
                nroComercio: newValue.includes("Todos")
                  ? allNroComercio
                  : newValue,
              });
            }}
            options={[{ value: "Todos", label: "Todos" }].concat(
              allNroComercio.map((nroComercio) => ({
                value: nroComercio,
                label: nroComercio,
              })),
            )}
          />
        </div>

        <div>
          <div>Nro cuenta</div>
          <Select
            id="select-nro-cuenta"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            maxTagCount="responsive"
            defaultValue={allNroCuenta}
            value={appliedFilters.nroCuenta}
            onChange={(newValue) => {
              setAppliedFilters({
                ...appliedFilters,
                nroCuenta: newValue.includes("Todos") ? allNroCuenta : newValue,
              });
            }}
            options={[{ value: "Todos", label: "Todos" }].concat(
              allNroCuenta.map((nroCuenta) => ({
                value: nroCuenta,
                label: nroCuenta,
              })),
            )}
          />
        </div>
      </div>
      <div className="filters">
        <div>
          <div>Reintento</div>
          <Select
            id="select-reintento"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            defaultValue={allReintento}
            maxTagCount="responsive"
            onChange={(newValue) => {
              setAppliedFilters({
                ...appliedFilters,
                ultimoItentoDiario: newValue,
              });
            }}
            options={allReintento.map((reintento) => ({
              value: reintento,
              label: reintento === "1" ? "SI" : "NO",
            }))}
          />
        </div>
        <div>
          <div>Tipo tarjeta</div>
          <Select
            id="select-tipo-tarjeta"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            defaultValue={allTipoTarjeta}
            maxTagCount="responsive"
            onChange={(newValue) => {
              setAppliedFilters({
                ...appliedFilters,
                tipo_tarjeta: newValue,
              });
            }}
            options={allTipoTarjeta.map((tipoTarjeta) => ({
              value: tipoTarjeta,
              label: tipoTarjeta.toUpperCase(),
            }))}
          />
        </div>
      </div>
    </>
  );
}

export default App;
