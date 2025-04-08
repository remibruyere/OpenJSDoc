import { IAddressApiDto } from './address.dto.interface';

export interface IAccountApiDto {
  readonly accountId: string;
  readonly blockAccountId: string;
  readonly corporateId: string;
  readonly brandId: string;
  readonly profileId: string;
  readonly globalAccountSettingId: string;
  readonly accountNumber: string;
  readonly bankCode: string;
  readonly objectType: 'ACCT';
  readonly accountName: string;
  readonly creditorIdentifier: string;
  readonly accountStatus: 'ACTIVE' | 'BLOCKED' | 'DISABLED';
  readonly schemeSupported: Array<
    'CARD' | 'INTERNAL' | 'SEPA_SCT_INST' | 'SEPA_SCT' | 'SEPA_SDD'
  >;
  readonly accountCurrency: 'EUR';
  readonly balanceCurrent: number;
  readonly balanceCurrentUpdateDate: string;
  readonly balanceSettled: number;
  readonly balanceSettledUpdateDate: string;
  readonly address: IAddressApiDto;
  readonly version: number;
  readonly schemaVersion: 1;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly metadata: Record<string, unknown>;
  readonly blockedCreditAt?: string;
  readonly blockedDebitAt?: string;
  readonly disabledAt?: string;
}
