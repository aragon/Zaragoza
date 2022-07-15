import React from 'react';
import {useTranslation} from 'react-i18next';
import {ButtonText, IconChevronRight} from '@aragon/ui-components';
import {IlluObject} from '@aragon/ui-components/src/components/illustrations';

import CardWithImage from 'components/cardWithImage';
import {useFormStep} from 'components/fullScreenStepper';
import useScreen from 'hooks/useScreen';
import {ActiveIndicator, Indicator, StyledCarousel} from 'containers/carousel';
import styled from 'styled-components';
import {i18n} from '../../../i18n.config';

export const OverviewDAOHeader: React.FC = () => {
  const {t} = useTranslation();
  const {next} = useFormStep();

  return (
    <div className="tablet:flex items-end p-2 tablet:p-6 tablet:space-x-6 bg-ui-0 tablet:rounded-xl">
      <div>
        <h1 className="font-bold text-ui-800 ft-text-3xl">
          {t('createDAO.overview.title')}
        </h1>
        <p className="mt-2 text-ui-600 ft-text-lg">
          {t('createDAO.overview.description')}
        </p>
      </div>
      <div className="flex mt-2 tablet:mt-0 space-x-2">
        {/* <ButtonText
          size="large"
          mode="secondary"
          bgWhite
          className="whitespace-nowrap"
          label={'Continue Draft'}
        /> */}
        <ButtonText
          size="large"
          className="w-full tablet:w-max whitespace-nowrap"
          iconRight={<IconChevronRight />}
          label={t('createDAO.overview.button')}
          onClick={next}
        />
      </div>
    </div>
  );
};

const OverviewCards = [
  <CardWithImage
    key="SelectBlockchain"
    imgSrc={<IlluObject object="chain" />}
    caption={i18n.t('createDAO.step1.label')}
    title={i18n.t('createDAO.step1.shortTitle')}
    subtitle={i18n.t('createDAO.step1.shortDescription')}
  />,
  <CardWithImage
    key="DefineMetadata"
    imgSrc={<IlluObject object="labels" />}
    caption={i18n.t('createDAO.step2.label')}
    title={i18n.t('createDAO.step2.shortTitle')}
    subtitle={i18n.t('createDAO.step2.shortDescription')}
  />,
  <CardWithImage
    key="SetupCommunity"
    imgSrc={<IlluObject object="users" />}
    caption={i18n.t('createDAO.step3.label')}
    title={i18n.t('createDAO.step3.shortTitle')}
    subtitle={i18n.t('createDAO.step3.shortDescription')}
  />,
  <CardWithImage
    key="ConfigureGovernance"
    imgSrc={<IlluObject object="settings" />}
    caption={i18n.t('createDAO.step4.label')}
    title={i18n.t('createDAO.step4.shortTitle')}
    subtitle={i18n.t('createDAO.step4.shortDescription')}
  />,
];

export const OverviewDAOStep: React.FC = () => {
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <div className="tablet:flex space-y-3 tablet:space-y-0 tablet:space-x-3">
        {OverviewCards}
      </div>
    );
  }
  return (
    <MobileCTA>
      <StyledCarousel
        swipeable
        emulateTouch
        centerMode
        autoPlay
        preventMovementUntilSwipeScrollTolerance
        swipeScrollTolerance={100}
        interval={4000}
        showArrows={false}
        showStatus={false}
        transitionTime={300}
        centerSlidePercentage={92}
        showThumbs={false}
        renderIndicator={(onClickHandler, isSelected, index, label) => {
          if (isSelected) {
            return (
              <ActiveIndicator
                aria-label={`Selected: ${label} ${index + 1}`}
                title={`Selected: ${label} ${index + 1}`}
              />
            );
          }
          return (
            <Indicator
              onClick={onClickHandler}
              onKeyDown={onClickHandler}
              value={index}
              key={index}
              role="button"
              tabIndex={0}
              title={`${label} ${index + 1}`}
              aria-label={`${label} ${index + 1}`}
            />
          );
        }}
      >
        {OverviewCards}
      </StyledCarousel>
    </MobileCTA>
  );
};

const MobileCTA = styled.div.attrs({
  className: 'mb-5 -mx-2 tablet:-mx-3 desktop:mx-0',
})``;
