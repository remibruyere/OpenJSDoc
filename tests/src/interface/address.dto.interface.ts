import { AddressCountryCode } from './address-country-code.enum';

export type IAddressApiDto =
  | IAddressStructuredApiDto
  | IAddressUnstructuredApiDto;

/**
 * DEPRECATED
 * TODO: Remove from November 23, 2025
 *
 * See online documentation at:
 * https://docs.numeral.io/reference/address
 */
export interface IAddressUnstructuredApiDto {
  /**
   * First address line
   * @example "1, rue de l'Abondance"
   */
  readonly line1?: string;
  /**
   * Second address line
   * @example ""
   */
  readonly line2?: string;
  /**
   * The building / street number
   * @example "1"
   */
  readonly buildingNumber?: string;
  /**
   * The street name
   * @example "rue de l'Abondance"
   */
  readonly streetName?: string;
  /**
   * The postal / zip code
   * @example "69003"
   */
  readonly postalCode?: string;
  /**
   * The region or state
   * @example "Auvergne-Rhône-Alpes"
   */
  readonly regionState?: string;
  /**
   * The city
   * @example "Lyon"
   *
   * TODO: Make mandatory from November 23, 2025 - Structured address
   */
  readonly city?: string;
  /**
   * The ISO 3166 alpha-2 country code
   * @example "FR"
   */
  readonly country?: AddressCountryCode | '';
}

/**
 * See online documentation at:
 * https://docs.numeral.io/reference/address
 */
export interface IAddressStructuredApiDto {
  /**
   * The building / street number
   * @example "1"
   */
  readonly buildingNumber?: string;
  /**
   * The street name
   * @example "rue de l'Abondance"
   */
  readonly streetName?: string;
  /**
   * The postal / zip code
   * @example "69003"
   */
  readonly postalCode?: string;
  /**
   * The region or state
   * @example "Auvergne-Rhône-Alpes"
   */
  readonly regionState?: string;
  /**
   * The city
   * @example "Lyon"
   */
  readonly city: string;
  /**
   * The ISO 3166 alpha-2 country code
   * @example "FR"
   */
  readonly country: AddressCountryCode;
}
