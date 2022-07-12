import {
  ButtonIcon,
  ButtonText,
  IconChevronLeft,
  IconLinkExternal,
  ListItemDao,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';

import {useReactiveVar} from '@apollo/client';
import {useGlobalModalContext} from 'context/globalModals';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {favoriteDAOs, selectedDAO} from 'context/apolloClient';
import useScreen from 'hooks/useScreen';

// NOTE: the state setting is temporary until backend integration
const DaoSelectMenu: React.FC = () => {
  const {t} = useTranslation();
  const {isDesktop} = useScreen();
  const navigate = useNavigate();
  const selectedDao = useReactiveVar(selectedDAO);
  const favoriteDaos = useReactiveVar(favoriteDAOs);
  const {isSelectDaoOpen, close, open} = useGlobalModalContext();

  const handleDaoSelect = (dao: {daoName: string; daoAddress: string}) => {
    selectedDAO(dao);
    close('selectDao');
  };

  const handleBackButtonClick = useCallback(() => {
    close('selectDao');
    if (!isDesktop) open('mobileMenu');
  }, [close, isDesktop, open]);

  return (
    <ModalBottomSheetSwitcher
      isOpen={isSelectDaoOpen}
      onClose={() => close('selectDao')}
      onOpenAutoFocus={e => e.preventDefault()}
    >
      <ModalHeader>
        <ButtonIcon
          mode="secondary"
          size="small"
          bgWhite
          icon={<IconChevronLeft />}
          onClick={handleBackButtonClick}
        />
        <Title>{t('daoSwitcher.title')}</Title>
        <div role="presentation" className="w-4 h-4" />
      </ModalHeader>
      <ModalContentContainer>
        <ListGroup>
          {favoriteDaos.map(dao => (
            <ListItemDao
              {...dao}
              selected={dao.daoAddress === selectedDao?.daoAddress}
              key={dao.daoAddress}
              onClick={() => handleDaoSelect(dao)}
            />
          ))}
        </ListGroup>
        {/* TODO: Change click */}
        <ButtonText
          mode="secondary"
          size="large"
          label={t('daoSwitcher.subtitle')}
          iconLeft={<IconLinkExternal />}
          className="w-full"
          onClick={() => {
            navigate('/');
            close('selectDao');
          }}
        />
      </ModalContentContainer>
    </ModalBottomSheetSwitcher>
  );
};

export default DaoSelectMenu;

const ModalHeader = styled.div.attrs({
  className: 'flex items-center p-2 space-x-2 bg-ui-0 rounded-xl sticky top-0',
})`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;

const Title = styled.div.attrs({
  className: 'flex-1 font-bold text-center text-ui-800',
})``;

const ModalContentContainer = styled.div.attrs({
  className: 'p-3 space-y-3',
})``;

const ListGroup = styled.div.attrs({
  className: 'space-y-1.5',
})``;
