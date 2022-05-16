import React from 'react';
import styled from 'styled-components';
import {generatePath, useNavigate} from 'react-router-dom';
import {ActionListItem, IconExpand} from '@aragon/ui-components';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

import Hero from 'containers/hero';
import {Finance} from 'utils/paths';
import Carousel from 'containers/carousel';
import {TemporarySection} from 'components/temporary';
import {DaoExplorer} from 'containers/daoExplorer';
import ActiveProposalsExplore from 'containers/activeProposalsExplore';
import {GridLayout} from 'components/layout';

const existingDaos = [
  '0x07de9a02a1c7e09bae5b15b7270e5b1ba2029bfd',
  '0xf1ce79a45615ce1d32af6422ed77b9b7ffc35c88',
];

const Explore: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <Hero />
      <GridLayout>
        <ContentWrapper>
          <Carousel />
          <DaoExplorer />
          <ActiveProposalsExplore />
          <div className="h-20" />
          <TemporarySection purpose="It allows you to navigate to a mock dao to test daos URLs.">
            {existingDaos.map(dao => (
              <ActionListItem
                key={dao}
                title={'Dao: ' + dao}
                subtitle={'Rinkeby Testnet'}
                icon={<IconExpand />}
                background={'white'}
                onClick={() =>
                  navigate(
                    generatePath(Finance, {network: 'rinkeby', dao: dao})
                  )
                }
              />
            ))}
            <ActionListItem
              title={'Non-existing dao: 0x1234'}
              subtitle={'Rinkeby testnet'}
              icon={<IconExpand />}
              background={'white'}
              onClick={() =>
                navigate(
                  generatePath(Finance, {network: 'rinkeby', dao: '0x1234'})
                )
              }
            />
          </TemporarySection>
        </ContentWrapper>
      </GridLayout>
    </>
  );
};

const ContentWrapper = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 space-y-5 desktop:space-y-9 mb-5 desktop:mb-10 pb-5',
})``;

export default Explore;
