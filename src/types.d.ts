declare module "*.csv" {
  const content: DataItemRaw[];
  export default content;
}

type DataItemRaw = {
  codigo_rechazo: string;
  descripcion_regla_fraude: string;
  es_ultimo_intento_diario: string;
  estado: string;
  nombre_comercio: string;
  nro_comercio: string;
  nro_cuenta: string;
  semana: string;
  tipo_tarjeta: string;
  txn: string;
  usd_amount: string;
};

type Estado = "ANULADA" | "APROBADA" | "RECHAZADA";
type TipoTarjeta = "debito" | "credito";
type CodigoRechazo = string;

type DataItem = DataItemRaw & {
  id: number;
  semana: number;
  usd_amount: number;
  estado: Estado;
  tipo_tarjeta: TipoTarjeta;
  codigo_rechazo: CodigoRechazo;
};

type Filters = {
  estado?: Estado[];
  tipo_tarjeta?: TipoTarjeta[];
  semana?: number[];
  codigoRechazo?: CodigoRechazo[];
  ultimoItentoDiario?: string[];
  nroCuenta?: string[];
  nroComercio?: string[];
};
