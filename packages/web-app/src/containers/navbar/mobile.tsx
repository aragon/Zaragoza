import {
  AvatarDao,
  ButtonIcon,
  ButtonText,
  ButtonWallet,
  IconMenu,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useState} from 'react';

import useScreen from 'hooks/useScreen';
import MobileMenu from './mobileMenu';
import {useWallet} from 'hooks/useWallet';
import NetworkIndicator from './networkIndicator';
import {useGlobalModalContext} from 'context/globalModals';

type MobileNavProps = {
  isProcess?: boolean;
  onWalletClick: () => void;
};

const MobileNav: React.FC<MobileNavProps> = props => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isMobile} = useScreen();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const {isConnected, address, ensName, ensAvatarUrl} = useWallet();

  if (props.isProcess)
    return (
      <Container>
        <NetworkIndicator />
      </Container>
    );

  return (
    <>
      <Container data-testid="navbar">
        <Menu>
          <FlexOne>
            {isMobile ? (
              <ButtonIcon
                mode="secondary"
                size="large"
                icon={<IconMenu />}
                onClick={() => setIsOpen(true)}
              />
            ) : (
              <ButtonText
                size="large"
                mode="secondary"
                label={t('menu')}
                iconLeft={<IconMenu />}
                onClick={() => setIsOpen(true)}
              />
            )}
          </FlexOne>
          <FlexOne className="justify-center">
            <DaoContainer>
              <AvatarDao daoName="DAO Name" onClick={() => open('selectDao')} />
              <DaoName>DAO Name</DaoName>
            </DaoContainer>
          </FlexOne>
          <FlexOne className="justify-end">
            <ButtonWallet
              src={ensAvatarUrl || address}
              onClick={props.onWalletClick}
              isConnected={isConnected}
              label={
                isConnected ? ensName || address : t('navButtons.connectWallet')
              }
            />
          </FlexOne>
        </Menu>
        <NetworkIndicator />
      </Container>
      <MobileMenu isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default MobileNav;

const FlexOne = styled.div.attrs({
  className: 'flex flex-1' as string | undefined,
})``;

const Container = styled.div.attrs({
  className: 'flex flex-col fixed left-0 bottom-0 w-full',
})``;

const Menu = styled.nav.attrs({
  className: `flex justify-between items-center px-2 tablet:px-3 py-1
     tablet:py-1.5`,
})`
  background: linear-gradient(
    180deg,
    rgba(245, 247, 250, 0) 0%,
    rgba(245, 247, 250, 1) 100%
  );
  backdrop-filter: blur(24px);
`;

const DaoContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-0.5 items-center rounded-xl',
})``;

const DaoName = styled.p.attrs({
  className: 'hidden tablet:block text-sm font-bold text-ui-800',
})``;
