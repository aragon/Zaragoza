import React from 'react';
import styled from 'styled-components';
import {Label} from '@aragon/ods-old';
import {useTranslation} from 'react-i18next';

const AddWalletsHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <Container>
      <HeaderItem>
        <Label label={t('labels.whitelistWallets.address')} />
      </HeaderItem>
      <div className="w-[200px]">
        <Label label={t('finance.tokens')} />
      </div>
      <div className="w-10">
        <Label label={t('finance.allocation')} />
      </div>
      <div className="w-6" />
    </Container>
  );
};

export default AddWalletsHeader;

const Container = styled.div.attrs({
  className: 'hidden md:flex p-2 space-x-2 bg-neutral-0',
})``;

const HeaderItem = styled.div.attrs({
  className: 'flex-1',
})``;
