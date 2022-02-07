import {
  ButtonIcon,
  ButtonText,
  ButtonWallet,
  CardDao,
  DaoSelector,
  IconClose,
  IconMenu,
  Popover,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useState, useCallback} from 'react';
import useBreadcrumbs from 'use-react-router-breadcrumbs';

import NavLinks from 'components/navLinks';
import BottomSheet from 'components/bottomSheet';
import Breadcrumbs from 'components/breadcrumbs';
import {useWallet} from 'context/augmentedWallet';
import DaoSwitcherMenu from 'components/daoSwitcherMenu';
import {useWalletMenuContext} from 'context/walletMenu';
import {useWalletProps} from '../walletMenu';
import BreadcrumbDropdown from 'components/breadcrumbMenuDropdown';
import {Dashboard, NotFound} from 'utils/paths';

const TEMP_ICON =
  'https://banner2.cleanpng.com/20180325/sxw/kisspng-computer-icons-avatar-avatar-5ab7529a8e4e14.9936310115219636745829.jpg';

const TEMP_DAOS = [
  {
    name: 'Axolittle Dao',
    ens: 'axolittle-dao.eth',
  },
  {
    name: 'Skullx Dao',
    ens: 'skullx-dao.eth',
  },
];

// Really? How about a sentence as the variable name?
const MIN_ROUTE_DEPTH_FOR_BREADCRUMBS = 2;

const Navbar: React.FC = () => {
  /************************************
   * State and Hooks
   ************************************/
  const {t} = useTranslation();
  const breadcrumbs = useBreadcrumbs(undefined, {
    excludePaths: [Dashboard, NotFound, 'governance/proposals'],
  });

  const {open} = useWalletMenuContext();
  const {
    connect,
    isConnected,
    account,
    chainId,
    ensName,
    ensAvatarUrl,
  }: useWalletProps = useWallet();

  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showCrumbPopover, setShowCrumbPopover] = useState(false);
  const [showSwitcherPopover, setShowSwitcherPopover] = useState(false);

  /************************************
   * Functions and Handlers
   ************************************/
  const handleShowMobileMenu = useCallback(() => {
    setShowMobileMenu(true);
  }, []);

  const handleHideMobileMenu = useCallback(() => {
    setShowMobileMenu(false);
  }, []);

  const handleHideCrumbPopover = useCallback(() => {
    setShowCrumbPopover(false);
  }, []);

  const handleHideSwitcherPopover = useCallback(() => {
    setShowSwitcherPopover(false);
  }, []);

  const handleWalletButtonClick = () => {
    console.log('trigger');
    isConnected() ? open() : connect('injected');
  };

  /************************************
   * Render
   ************************************/
  return (
    <>
      <NavContainer data-testid="navbar">
        <NavigationBar>
          <span className="hidden tablet:inline desktop:hidden">
            <ButtonText
              label={t('menu')}
              mode="secondary"
              size="large"
              onClick={handleShowMobileMenu}
              iconLeft={showMobileMenu ? <IconClose /> : <IconMenu />}
            />
          </span>
          <span className="tablet:hidden">
            <ButtonIcon
              mode="secondary"
              size="large"
              onClick={handleShowMobileMenu}
              icon={showMobileMenu ? <IconClose /> : <IconMenu />}
            />
          </span>

          <Container>
            {/* ------- DAO SELECTOR ------- */}
            <DaoSelectorWrapper>
              {/* TODO: investigate popover trigger nested button warning */}
              <StyledPopover
                open={showSwitcherPopover} // Using open so that clicking on DAO name closes the popover
                side="bottom"
                align="start"
                width={320}
                content={
                  <DaoSwitcherMenu
                    daos={TEMP_DAOS}
                    onClick={handleHideSwitcherPopover}
                  />
                }
                onOpenChange={setShowSwitcherPopover}
              >
                <DaoSelector
                  src={TEMP_ICON}
                  label="Bushido Dao"
                  isSelected={showSwitcherPopover}
                  onClick={() => null}
                />
              </StyledPopover>
            </DaoSelectorWrapper>

            {/* ------- NavLinks (Desktop) ------- */}
            <LinksContainer>
              {breadcrumbs.length >= MIN_ROUTE_DEPTH_FOR_BREADCRUMBS ? (
                <>
                  <Popover
                    open={showCrumbPopover} // Using open so that clicking on MenuItem closes the popover
                    side="bottom"
                    align="start"
                    width={320}
                    content={
                      <BreadcrumbDropdown
                        selected={breadcrumbs[0].match.pathname}
                        onItemClick={handleHideCrumbPopover}
                      />
                    }
                    onOpenChange={setShowCrumbPopover}
                  >
                    <ButtonIcon
                      mode="secondary"
                      size="large"
                      icon={showCrumbPopover ? <IconClose /> : <IconMenu />}
                      isActive={showCrumbPopover}
                    />
                  </Popover>
                  <Breadcrumbs breadcrumbs={breadcrumbs} />
                </>
              ) : (
                <NavLinks />
              )}
            </LinksContainer>
          </Container>

          {/* ------- Wallet Button (Desktop) ------- */}
          <ButtonWallet
            onClick={handleWalletButtonClick}
            isConnected={isConnected()}
            label={
              isConnected() ? ensName || account : t('navButtons.connectWallet')
            }
            src={ensAvatarUrl || account}
          />
        </NavigationBar>
        {chainId === 4 && (
          <TestNetworkIndicator>{t('testnetIndicator')}</TestNetworkIndicator>
        )}
      </NavContainer>

      {/* ------- NavLinks (Mobile) ------- */}
      <BottomSheet
        isOpen={showMobileMenu}
        onOpen={handleShowMobileMenu}
        onClose={handleHideMobileMenu}
      >
        <div className="space-y-3">
          <CardDao
            daoAddress="bushido.aragonid.eth"
            daoName="Bushido DAO"
            onClick={handleHideMobileMenu}
            src={TEMP_ICON}
            wide
          />
          <NavLinks isDropdown onItemClick={handleHideMobileMenu} />
        </div>
      </BottomSheet>
    </>
  );
};

export default Navbar;

const NavContainer = styled.div.attrs({
  className: `flex fixed tablet:static bottom-0 flex-col w-full bg-gradient-to-b tablet:bg-gradient-to-t
   from-gray-50 tablet:from-gray-50 backdrop-filter backdrop-blur-xl`,
})``;

export const NavigationBar = styled.nav.attrs({
  className: `flex tablet:order-1 h-12 justify-between items-center px-2 pb-2 pt-1.5 
    tablet:py-2 tablet:px-3 desktop:py-3 desktop:px-5 wide:px-25 text-ui-600`,
})``;

const Container = styled.div.attrs({
  className: 'flex desktop:flex-1 items-center space-x-6',
})``;

const LinksContainer = styled.div.attrs({
  className:
    'hidden desktop:flex order-1 desktop:order-2 space-x-1.5 items-center',
})``;

const DaoSelectorWrapper = styled.div.attrs({
  className:
    'absolute flex items-center desktop:static left-2/4 desktop:left-auto transform -translate-x-1/2 desktop:-translate-x-0',
})``;

const TestNetworkIndicator = styled.p.attrs({
  className:
    'p-0.5 text-xs font-extrabold text-center text-primary-100 bg-primary-900',
})``;

const StyledPopover = styled(Popover).attrs({
  className: 'hidden desktop:block',
})``;
