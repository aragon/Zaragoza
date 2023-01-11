import {
  ButtonGroup,
  ButtonText,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import React, {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {DaoCard} from 'components/daoCard';
import {useDaos} from 'hooks/useDaos';
import {PluginTypes} from 'hooks/usePluginClient';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {Dashboard} from 'utils/paths';

const EXPLORE_FILTER = ['favorite', 'newest', 'popular'] as const;

export type ExploreFilter = typeof EXPLORE_FILTER[number];

export function isExploreFilter(
  filterValue: string
): filterValue is ExploreFilter {
  return EXPLORE_FILTER.some(ef => ef === filterValue);
}

const PAGE_SIZE = 4;

export const DaoExplorer = () => {
  const {t} = useTranslation();
  const [showCount, setShowCount] = useState(PAGE_SIZE);
  const navigate = useNavigate();
  const {address} = useWallet();

  const [filterValue, setFilterValue] = useState<ExploreFilter>(() =>
    address ? 'favorite' : 'newest'
  );

  const {data, isLoading} = useDaos(filterValue, showCount);

  const handleShowMoreClick = () => {
    setShowCount(prev => prev + PAGE_SIZE);
  };

  const handleFilterChange = (filterValue: string) => {
    if (isExploreFilter(filterValue)) {
      setFilterValue(filterValue);
      setShowCount(PAGE_SIZE);
    } else throw Error(`${filterValue} is not an acceptable filter value`);
    return;
  };

  return (
    <Container>
      <MainContainer>
        <HeaderWrapper>
          <Title>{t('explore.explorer.title')}</Title>
          <ButtonGroupContainer>
            <ButtonGroup
              defaultValue={filterValue}
              onChange={v => handleFilterChange(v)}
              bgWhite={false}
            >
              {address ? (
                <Option label={t('explore.explorer.myDaos')} value="favorite" />
              ) : (
                <></>
              )}
              <Option label={t('explore.explorer.popular')} value="popular" />
              <Option label={t('explore.explorer.newest')} value="newest" />
            </ButtonGroup>
          </ButtonGroupContainer>
        </HeaderWrapper>
        <CardsWrapper>
          {isLoading ? (
            <Spinner size="default" />
          ) : (
            data.slice(0, showCount).map((dao, index) => (
              <DaoCard
                name={dao.metadata.name}
                logo={dao.metadata.avatar}
                // TODO: replace with -> description={dao.metadata.description}
                description="This is a DAO."
                chainId={dao.chain || CHAIN_METADATA.goerli.id} // Default to Goerli
                daoType={
                  (dao?.plugins[0].id as PluginTypes) === 'erc20voting.dao.eth'
                    ? 'token-based'
                    : 'wallet-based'
                }
                key={index}
                onClick={() =>
                  navigate(
                    generatePath(Dashboard, {
                      network: getSupportedNetworkByChainId(
                        dao.chain || CHAIN_METADATA.goerli.id
                      ),
                      dao: dao.address,
                    })
                  )
                }
              />
            ))
          )}
        </CardsWrapper>
      </MainContainer>
      {data.length > PAGE_SIZE && (
        <div>
          <ButtonText
            label={t('explore.explorer.showMore')}
            iconRight={<IconChevronDown />}
            bgWhite
            mode="ghost"
            onClick={handleShowMoreClick}
            disabled={showCount > data.length}
          />
        </div>
      )}
    </Container>
  );
};

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex',
})``;

const MainContainer = styled.div.attrs({
  className: 'flex flex-col space-y-2 desktop:space-y-3',
})``;
const Container = styled.div.attrs({
  className: 'flex flex-col space-y-1.5',
})``;
const HeaderWrapper = styled.div.attrs({
  className:
    'flex flex-col space-y-2 desktop:flex-row desktop:space-y-0 desktop:justify-between',
})``;
const CardsWrapper = styled.div.attrs({
  className: 'grid grid-cols-1 gap-1.5 desktop:grid-cols-2 desktop:gap-3',
})``;
const Title = styled.p.attrs({
  className: 'font-bold ft-text-xl text-ui-800',
})``;
