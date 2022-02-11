import React from 'react';
import styled from 'styled-components';
import {useNavigate} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {ActionListItem, IconChevronRight} from '@aragon/ui-components';

import {useWallet} from 'context/augmentedWallet';
import {NewDeposit, NewWithDraw} from 'utils/paths';
import {useGlobalModalContext} from 'context/globalModals';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';

const TransferMenu: React.FC = () => {
  const {isTransferOpen, close} = useGlobalModalContext();
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {isConnected} = useWallet();

  /* TODO: Those should be one method with an argument. */
  const handleNewDepositClick = () => {
    // TODO: change alert to proper error reporting mechanism,
    // Move to proper placing
    if (isConnected()) {
      navigate(NewDeposit);
      close('default');
    } else alert('Please connect your wallet');
  };

  const handleNewWithdrawClick = () => {
    // TODO: change alert to proper error reporting mechanism,
    if (isConnected()) {
      // TODO: Check if wallet address is authorized to access new withdraw page and then navigate
      navigate(NewWithDraw);
      close('default');
    } else alert('Please connect your wallet');
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isTransferOpen}
      onClose={() => close('default')}
      title={t('TransferModal.newTransfer') as string}
    >
      <Container>
        <ActionListItem
          title={t('TransferModal.item1Title') as string}
          subtitle={t('TransferModal.item1Subtitle') as string}
          icon={<IconChevronRight />}
          onClick={handleNewDepositClick}
        />
        <ActionListItem
          title={t('TransferModal.item2Title') as string}
          subtitle={t('TransferModal.item2Subtitle') as string}
          icon={<IconChevronRight />}
          onClick={handleNewWithdrawClick}
        />
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default TransferMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;
