import type { Timestamp } from 'firebase/firestore';

export type TemperatureRecord = {
  id: string;
  turno: '1' | '2';
  local: string;
  codigo: string;
  produto: string;
  tipo: 'MI' | 'ME' | '';
  estado: 'Congelado' | 'Resfriado';
  temperaturas: {
    inicio: number;
    meio: number;
    fim: number;
  };
  data: Timestamp;
  dataManual: string;
  horarioManual: string;
};

export type TemperatureRecordClient = Omit<TemperatureRecord, 'data'> & {
    data: Date;
}
