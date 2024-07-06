import { useMemo, useState } from "react";
import { XAxis, YAxis, Line, Tooltip, ComposedChart, Bar } from "recharts";
import { Select } from "antd";
import "./App.css";
import { data, filterData, getUniques } from "./utils.ts";

const allWeeks = getUniques(data, "semana");
const allNroComercio = getUniques(data, "nro_comercio");

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="desc">Semana: {label}</p>
        <p className="label">{`tpn : ${payload[0].value.toFixed(2)}`}</p>
        <p className="label">{`ratio tpn : ${(payload[1].value * 100).toFixed(2)}%`}</p>
      </div>
    );
  }

  return null;
};

function App() {
  const [filteredWeeks, setFilteredWeeks] = useState<number[]>(allWeeks);
  const [filteredNroComercio, setFilteredNroComercio] =
    useState<string[]>(allNroComercio);

  const filteredData = useMemo(
    () =>
      filterData({ semana: filteredWeeks, nroComercio: filteredNroComercio }),
    [filteredNroComercio, filteredWeeks],
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
          <Tooltip content={<CustomTooltip />} />
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
          <Tooltip content={<CustomTooltip />} />
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
      </div>
    </>
  );
}

export default App;
