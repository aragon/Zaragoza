import React from 'react';
import styled from 'styled-components';
import {constants} from 'ethers';
import {TokenCard} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

import {
  TokenSectionWrapper,
  TransferSectionWrapper,
} from 'components/sectionWrapper';
import usePollTokens from 'hooks/usePollTokens';

const TEMP_FETCH_INTERVAL = 300000;

const TOKENS = [
  {
    name: 'Ethereum',
    address: constants.AddressZero,
    imgUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png',
    count: 0.255555,
    symbol: 'ETH',
  },
  {
    name: 'Aragon',
    address: '0xa117000000f279d81a1d3cc75430faa017fa5a2e',
    imgUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/1680.png',
    count: 6,
    symbol: 'ANT',
  },
  {
    name: 'Dai',
    address: '0x6b175474e89094c44da98b954eedeac495271d0f',
    imgUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png',
    count: 245,
    symbol: 'DAI',
  },
  {
    name: 'Patito DAO TOken',
    address: 'randomAddress',
    imgUrl: null,
    count: 500000,
    symbol: 'PDT',
  },
  {
    name: 'Tether',
    address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    imgUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/825.png',
    count: 344578,
    symbol: 'USDT',
  },
];

const TOKEN_ADDRESSES = TOKENS.map(({address}) => address);

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 4,
});

const Finance: React.FC = () => {
  const {t} = useTranslation();
  const {prices} = usePollTokens(TOKEN_ADDRESSES, TEMP_FETCH_INTERVAL);

  return (
    <div className={'m-auto mt-4 w-8/12'}>
      <h1 className={'text-2xl font-bold text-center '}>Finance Page</h1>
      <div className={'h-4'} />
      <TokenSectionWrapper title={t('finance.tokenSection')}>
        <div className="py-2 space-y-2 border-solid">
          {prices &&
            TOKENS.map(token => {
              return (
                <TokenCard
                  key={token.name}
                  tokenName={token.name}
                  tokenSymbolURL={token.imgUrl}
                  treasurySharePercentage="20%"
                  tokenCount={`${numberFormatter.format(token.count)} ${
                    token.symbol
                  }`}
                  tokenUSDValue={
                    prices[token.address]
                      ? usdFormatter.format(Number(prices[token.address]))
                      : t('finance.unknownUSDValue')
                  }
                  treasuryShare={
                    prices[token.address]
                      ? usdFormatter.format(
                          Number(prices[token.address]) * token.count
                        )
                      : t('finance.unknownUSDValue')
                  }
                  changeDuringInterval="+$150,002.3"
                  percentageChangeDuringInterval="+ 0.01%"
                />
              );
            })}
        </div>
      </TokenSectionWrapper>
      <div className={'h-4'} />
      <TransferSectionWrapper title={t('finance.transferSection')}>
        <div className="my-2 space-y-2 border-solid">
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
          <ColoredDiv />
        </div>
      </TransferSectionWrapper>
    </div>
  );
};

export default Finance;

const ColoredDiv = styled.div.attrs({className: 'h-6 w-full bg-blue-100'})``;
