import { useMemo, useState } from "react";
import {
  XAxis,
  YAxis,
  Line,
  Tooltip,
  ComposedChart,
  Bar,
  TooltipProps,
} from "recharts";
import { Select } from "antd";
import "./App.css";
import { data, filterData, formatNumber, getUniques } from "./utils.ts";

const allWeeks = getUniques(data, "semana");
const allNroComercio = getUniques(data, "nro_comercio");
const allNroCuenta = getUniques(data, "nro_cuenta");
const allReintento = ["0", "1"];
const allTipoTarjeta: TipoTarjeta[] = ["debito", "credito"];

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
  const [filteredWeeks, setFilteredWeeks] = useState<number[]>(allWeeks);
  const [filteredNroComercio, setFilteredNroComercio] =
    useState<string[]>(allNroComercio);
  const [filteredNroCuenta, setFilteredNroCuenta] =
    useState<string[]>(allNroCuenta);
  const [filteredReintento, setFilteredReintento] =
    useState<string[]>(allReintento);
  const [filteredTipoTarjeta, setFilteredTipoTarjeta] =
    useState<TipoTarjeta[]>(allTipoTarjeta);

  const filteredData = useMemo(
    () =>
      filterData({
        semana: filteredWeeks,
        nroComercio: filteredNroComercio,
        nroCuenta: filteredNroCuenta,
        ultimoItentoDiario: filteredReintento,
        tipo_tarjeta: filteredTipoTarjeta,
      }),
    [
      filteredWeeks,
      filteredNroComercio,
      filteredNroCuenta,
      filteredReintento,
      filteredTipoTarjeta,
    ],
  );

  const dataByWeek = useMemo(() => {
    return filteredData.reduce<
      Record<
        number,
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
    return Object.entries(dataByWeek).map(([semana, entry]) => ({
      semana,
      ...entry,
      ratioTpn: entry.approTpn / entry.tpn,
      ratioTpv: entry.approTpv / entry.tpv,
    }));
  }, [dataByWeek]);

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
            defaultValue={filteredWeeks}
            onChange={(newValue) => {
              setFilteredWeeks(newValue);
            }}
            options={allWeeks.map((week) => ({ value: week, label: week }))}
          />
        </div>

        <div>
          <div>Nro comercio</div>
          <Select
            id="select-nro-comercio"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            defaultValue={filteredNroComercio}
            onChange={(newValue) => {
              setFilteredNroComercio(newValue);
            }}
            options={allNroComercio.map((nroComercio) => ({
              value: nroComercio,
              label: nroComercio,
            }))}
          />
        </div>

        <div>
          <div>Nro cuenta</div>
          <Select
            id="select-nro-cuenta"
            mode="multiple"
            allowClear
            style={{ width: "300px" }}
            defaultValue={filteredNroCuenta}
            onChange={(newValue) => {
              setFilteredNroCuenta(newValue);
            }}
            options={allNroCuenta.map((nroCuenta) => ({
              value: nroCuenta,
              label: nroCuenta,
            }))}
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
            defaultValue={filteredReintento}
            onChange={(newValue) => {
              setFilteredReintento(newValue);
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
            defaultValue={filteredTipoTarjeta}
            onChange={(newValue) => {
              setFilteredTipoTarjeta(newValue);
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
