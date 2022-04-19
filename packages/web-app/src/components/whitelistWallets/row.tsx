import React, {useState} from 'react';
import {
  ButtonIcon,
  IconMenuVertical,
  ListItemAction,
  AlertInline,
  ValueInput,
} from '@aragon/ui-components';
import {t} from 'i18next';
import {Controller, useFieldArray, useFormContext} from 'react-hook-form';
import styled from 'styled-components';
import {useWallet} from 'hooks/useWallet';
import {handleClipboardActions} from 'utils/library';
import {validateAddress} from 'utils/validators';
import {Dropdown} from '@aragon/ui-components/src';
import {WhitelistWallet} from 'pages/createDAO';

type WhitelistWalletsRowProps = {
  index: number;
};

export const Row = ({index}: WhitelistWalletsRowProps) => {
  const {control, watch, trigger} = useFormContext();
  const {account} = useWallet();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const {remove, update, append} = useFieldArray({
    control,
    name: 'whitelistWallets',
  });
  const whitelistWallets: WhitelistWallet[] = watch('whitelistWallets');

  const addressValidator = (address: string, addressIndex: number) => {
    let validationResult = validateAddress(address);
    const wallets = whitelistWallets;
    if (wallets) {
      wallets.forEach((wallet: WhitelistWallet, walletIndex: number) => {
        if (address === wallet.address && addressIndex !== walletIndex) {
          validationResult = t('errors.duplicateAddress') as string;
        }
      });
    }
    return validationResult;
  };

  return (
    <Controller
      name={`whitelistWallets.${index}.address`}
      defaultValue={null}
      control={control}
      rules={{
        required: t('errors.required.walletAddress') as string,
        validate: value => addressValidator(value, index),
      }}
      render={({field: {onChange, value}, fieldState: {error}}) => (
        <Container>
          <InputContainer>
            <ValueInput
              value={value === account ? 'My Wallet' : value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                onChange(
                  e.target.value === account ? 'My Wallet' : e.target.value
                );
              }}
              mode="default"
              placeholder="0x..."
              adornmentText={value ? 'Copy' : 'Paste'}
              disabled={value === account}
              onAdornmentClick={() => handleClipboardActions(value, onChange)}
            />
            {error?.message && (
              <AlertInline label={error.message} mode="critical" />
            )}
          </InputContainer>
          <Dropdown
            side="bottom"
            align="start"
            open={dropdownOpen}
            onOpenChange={(open: boolean) => setDropdownOpen(open)}
            sideOffset={4}
            trigger={
              <ButtonIcon
                size="large"
                mode="secondary"
                disabled={index === 0}
                icon={<IconMenuVertical />}
                data-testid="trigger"
              />
            }
            listItems={[
              {
                component: (
                  <ListItemAction
                    title={t('labels.whitelistWallets.duplicateEntry')}
                    bgWhite
                  />
                ),
                callback: () => {
                  append(whitelistWallets[index]);
                  trigger('whitelistWallets');
                },
              },
              {
                component: (
                  <ListItemAction
                    title={t('labels.whitelistWallets.resetEntry')}
                    bgWhite
                  />
                ),
                callback: () => update(index, {address: ''}),
              },
              {
                component: (
                  <ListItemAction
                    title={t('labels.whitelistWallets.deleteEntry')}
                    bgWhite
                  />
                ),
                callback: () => {
                  remove(index);
                  trigger('whitelistWallets');
                },
              },
            ]}
          />
        </Container>
      )}
    />
  );
};

const Container = styled.div.attrs(() => ({
  className: 'px-2 py-1.5 flex gap-2 items-start',
}))``;
const InputContainer = styled.div.attrs(() => ({
  className: 'flex flex-col gap-1 flex-1',
}))``;
