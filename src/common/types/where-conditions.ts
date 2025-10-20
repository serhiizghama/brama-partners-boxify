import { BoxStatus } from '../../domain/boxes/enums/box-status.enum';

export interface ProductWhereConditions {
  name?: any;
  barcode?: any;
}

export interface BoxWhereConditions {
  label?: any;
  status?: BoxStatus;
}

export type SortDirection = 'ASC' | 'DESC';

export interface SortOptions {
  [key: string]: SortDirection;
}
