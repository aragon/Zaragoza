import {SupportedNetworks} from 'utils/constants';

export interface IFetchTokenMarketDataParams {
  tokenIds: string[];
}

export interface IFetchTokenParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}

export interface IFetchTokenPriceParams {
  address: string;
  network: SupportedNetworks;
  symbol?: string;
}