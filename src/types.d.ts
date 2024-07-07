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

type DataItem = {
  id: number;
  semana: string;
  usd_amount: number;
  estado: Estado;
  tipo_tarjeta: TipoTarjeta;
  codigo_rechazo: CodigoRechazo;
  nro_comercio: string;
  nro_cuenta: string;
  es_ultimo_intento_diario: string;
};

type Filters = {
  estado?: Estado[];
  tipo_tarjeta?: TipoTarjeta[];
  semana?: string[];
  codigoRechazo?: CodigoRechazo[];
  ultimoItentoDiario?: string[];
  nroCuenta?: string[];
  nroComercio?: string[];
};
