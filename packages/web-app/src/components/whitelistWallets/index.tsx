import {
  ButtonIcon,
  ButtonText,
  IconMenuVertical,
  ListItemAction,
} from '@aragon/ui-components';
import {Dropdown} from '@aragon/ui-components/src';
import {t} from 'i18next';
import {WhitelistWallet} from 'pages/createDAO';
import React, {useEffect, useState} from 'react';
import {useFieldArray, useFormContext} from 'react-hook-form';
import styled from 'styled-components';
import {useWallet} from 'hooks/useWallet';
import {Row} from './row';

export const WhitelistWallets = () => {
  const {account} = useWallet();
  const {control, watch} = useFormContext();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {update, replace, append} = useFieldArray({
    control,
    name: 'whitelistWallets',
  });
  const whitelistWallets: WhitelistWallet[] = watch('whitelistWallets');

  // add empty wallet
  const handleAddWallet = () => {
    append({address: ''});
  };

  useEffect(() => {
    if (account) {
      update(0, {address: account});
    }
  });

  // reset all
  const handleDeleteWallets = () => {
    replace([{address: account}, {address: ''}]);
  };
  const handleResetWallets = () => {
    whitelistWallets.forEach((_, index) => {
      // skip the first one because is the own address
      if (index > 0) {
        update(index, {address: ''});
      }
    });
  };

  return (
    <Container>
      {JSON.stringify(whitelistWallets)}
      <TableContainer>
        <Header>{t('labels.whitelistWallets.address')}</Header>
        {whitelistWallets &&
          whitelistWallets.map((_, index) => (
            <div key={index}>
              <Divider />
              <Row index={index} />
            </div>
          ))}
        <Divider />
        <Footer>
          {t('labels.whitelistWallets.addresses', {
            count: whitelistWallets?.length || 0,
          })}
        </Footer>
      </TableContainer>
      <ActionsContainer>
        <TextButtonsContainer>
          <ButtonText
            label={t('labels.whitelistWallets.addAddress')}
            mode="secondary"
            size="large"
            onClick={handleAddWallet}
          />
          <ButtonText
            label={t('labels.whitelistWallets.uploadCSV')}
            mode="ghost"
            size="large"
            onClick={() => alert('upload CSV here')}
          />
        </TextButtonsContainer>
        <Dropdown
          side="bottom"
          align="start"
          sideOffset={4}
          open={dropdownOpen}
          onOpenChange={(open: boolean) => setDropdownOpen(open)}
          trigger={
            <ButtonIcon
              size="large"
              mode="secondary"
              icon={<IconMenuVertical />}
              data-testid="trigger"
            />
          }
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.resetAllEntries')}
                  bgWhite
                />
              ),
              callback: handleResetWallets,
            },
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.deleteAllEntries')}
                  bgWhite
                />
              ),
              callback: handleDeleteWallets,
            },
          ]}
        />
      </ActionsContainer>
    </Container>
  );
};

const TableContainer = styled.div.attrs(() => ({
  className: 'rounded-xl bg-ui-0 flex flex-col',
}))``;
const Container = styled.div.attrs(() => ({
  className: 'gap-2 flex flex-col',
}))``;
const Header = styled.div.attrs(() => ({
  className: 'pt-3 pl-4 pb-1.5 text-ui-800 font-bold',
}))``;
const Footer = styled.div.attrs(() => ({
  className: 'px-3 py-4 text-ui-800 font-bold',
}))``;
const Divider = styled.div.attrs(() => ({
  className: 'flex bg-ui-50 h-0.25',
}))``;
const ActionsContainer = styled.div.attrs(() => ({
  className: 'flex place-content-between',
}))``;
const TextButtonsContainer = styled.div.attrs(() => ({
  className: 'flex gap-2',
}))``;
