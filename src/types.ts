export const TRANSMISSIONS = ['manual', 'auto'] as const;
export const BODY_TYPES = ['sedan', 'hatchback', 'suv', 'pickup', 'minivan'] as const;
export const CONDITIONS = ['new', 'used', 'damaged'] as const;
export const STATUSES = ['available', 'reserved', 'sold'] as const;

export type Transmission = (typeof TRANSMISSIONS)[number];
export type BodyType = (typeof BODY_TYPES)[number];
export type Condition = (typeof CONDITIONS)[number];
export type Status = (typeof STATUSES)[number];

export interface Brand { id?: number; name: string }
export interface Model { id?: number; brandId: number; name: string }
export interface YearItem { value: number }

export interface Car {
  id?: number;
  brandId: number;
  modelId: number;
  year: number;
  cellId: string | null;
  status: Status;
  mileage?: number;
  transmission?: Transmission;
  bodyType?: BodyType;
  condition?: Condition;
  plate?: string;
  color?: string;
  ownerName?: string;
  ownerPhone?: string;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Line { id: string; name: string }
export interface Grid { rows: Line[]; cols: Line[]; disabled: string[]; seq: number }

export interface Settings {
  lang: 'tm' | 'ru';
  theme: 'light' | 'dark';
  accessUntil: number;
  lastSeenAt: number;
}
