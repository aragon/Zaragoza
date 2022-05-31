import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
// import {DAOFactory} from 'typechain';
// TODO reintroduce this by adding back the postInstall script in packages.json
// that executes the generate-abis-and-types command.
import {Breadcrumb, ButtonText, IconChevronRight} from '@aragon/ui-components';
import {useNavigate} from 'react-router-dom';

import Blockchain from './blockchain';
import DaoMetadata from './daoMetadata';
import Community from './community';
import Governance from './governance';
import goLive from 'public/goLive.svg';
import {Landing} from 'utils/paths';
import {useCreateDaoContext} from 'context/createDao';
import {useWallet} from 'hooks/useWallet';

export const GoLiveHeader: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();

  const clickHandler = (path: string) => {
    navigate(path);
  };

  return (
    <div className="tablet:p-3 desktop:p-6 px-2 pt-2 desktop:pt-3 pb-3 bg-ui-0 tablet:rounded-xl">
      <div className="desktop:hidden">
        <Breadcrumb
          crumbs={{label: t('createDAO.title'), path: Landing}}
          onClick={clickHandler}
        />
      </div>
      <div className="flex justify-between">
        <div className="pt-3 w-full">
          <h1 className="text-3xl font-bold text-ui-800">
            {t('createDAO.review.title')}
          </h1>
          <p className="mt-2 text-lg text-ui-600">
            {t('createDAO.review.description')}
          </p>
        </div>
        <ImageContainer src={goLive} />
      </div>
    </div>
  );
};

const GoLive: React.FC = () => {
  return (
    <Container>
      <Blockchain />
      <DaoMetadata />
      <Community />
      <Governance />
    </Container>
  );
};

export const GoLiveFooter: React.FC = () => {
  const {watch} = useFormContext();
  const {reviewCheck} = watch();
  const {t} = useTranslation();
  const {handlePublishDao} = useCreateDaoContext();
  const {isConnected} = useWallet();

  const IsButtonDisabled = () =>
    !Object.values(reviewCheck).every(v => v === true) || !isConnected;

  return (
    <div className="flex justify-center pt-3">
      <ButtonText
        size="large"
        iconRight={<IconChevronRight />}
        label={t('createDAO.review.button')}
        onClick={handlePublishDao}
        disabled={IsButtonDisabled()}
      />
    </div>
  );
};

export default GoLive;

const Container = styled.div.attrs({
  className: 'tablet:mx-auto tablet:w-3/4',
})``;

const ImageContainer = styled.img.attrs({
  className: 'w-25 hidden tablet:block',
})``;
