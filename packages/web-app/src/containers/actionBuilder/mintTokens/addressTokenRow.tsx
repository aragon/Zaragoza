import React, {useState} from 'react';
import {
  ButtonIcon,
  IconMenuVertical,
  ValueInput,
  Label,
  NumberInput,
  ListItemAction,
  Dropdown,
  AlertInline,
  TextInput,
} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import styled from 'styled-components';

import {handleClipboardActions} from 'utils/library';
import useScreen from 'hooks/useScreen';
import {validateAddress} from 'utils/validators';
import {WalletField} from 'components/addWallets/row';

type IndexProps = {
  actionIndex: number;
  fieldIndex: number;
};

type AddressAndTokenRowProps = IndexProps & {
  onDelete: (index: number) => void;
};

const AddressField: React.FC<IndexProps> = ({actionIndex, fieldIndex}) => {
  const {t} = useTranslation();
  const {getValues} = useFormContext();
  const walletFieldArray = getValues(
    `actions.${actionIndex}.inputs.mintTokensToWallets`
  );

  const addressValidator = (address: string, index: number) => {
    let validationResult = validateAddress(address);
    if (walletFieldArray) {
      walletFieldArray.forEach((wallet: WalletField, walletIndex: number) => {
        if (address === wallet.address && index !== walletIndex)
          validationResult = t('errors.duplicateAddress') as string;
        if (Number(wallet.amount) > 0 && wallet.address === '')
          validationResult = t('errors.required.walletAddress') as string;
      });
    }
    return validationResult;
  };

  return (
    <Controller
      defaultValue=""
      name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.address`}
      rules={{
        validate: value => addressValidator(value, actionIndex),
      }}
      render={({
        field: {name, value, onBlur, onChange},
        fieldState: {error},
      }) => (
        <div className="flex-1">
          <ValueInput
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              onChange(e.target.value);
            }}
            placeholder={t('placeHolders.walletOrEns')}
            adornmentText={value ? t('labels.copy') : t('labels.paste')}
            onAdornmentClick={() => handleClipboardActions(value, onChange)}
          />
          {error?.message && (
            <ErrorContainer>
              <AlertInline label={error.message} mode="critical" />
            </ErrorContainer>
          )}
        </div>
      )}
    />
  );
};

const TokenField: React.FC<IndexProps> = ({actionIndex, fieldIndex}) => {
  const {trigger} = useFormContext();
  return (
    <Controller
      name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.amount`}
      render={({
        field: {name, value, onBlur, onChange},
        fieldState: {error},
      }) => (
        <div className="flex-1">
          <NumberInput
            name={name}
            value={value}
            onBlur={onBlur}
            onChange={() => {
              trigger(
                `actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.address`
              );
              onChange();
            }}
            placeholder="0"
            min={0}
            includeDecimal
            mode={error?.message ? 'critical' : 'default'}
          />
        </div>
      )}
    />
  );
};

const DropdownMenu: React.FC<AddressAndTokenRowProps> = ({
  fieldIndex,
  onDelete,
}) => {
  const {t} = useTranslation();

  return (
    <Dropdown
      align="start"
      trigger={
        <ButtonIcon mode="ghost" size="large" icon={<IconMenuVertical />} />
      }
      sideOffset={8}
      listItems={[
        {
          component: (
            <ListItemAction title={t('labels.removeWallet')} bgWhite />
          ),
          callback: () => {
            onDelete(fieldIndex);
          },
        },
      ]}
    />
  );
};

const PercentageDistribution: React.FC<IndexProps> = ({
  actionIndex,
  fieldIndex,
}) => {
  return (
    <div style={{maxWidth: '12ch'}}>
      <TextInput
        className="text-right"
        name={`actions.${actionIndex}.inputs.mintTokensToWallets.${fieldIndex}.amount`}
        value={'14.012%'}
        mode="default"
        disabled
      />
    </div>
  );
};

export const AddressAndTokenRow: React.FC<AddressAndTokenRowProps> = ({
  actionIndex,
  fieldIndex,
  onDelete,
}) => {
  const {isDesktop} = useScreen();

  if (isDesktop) {
    return (
      <Container>
        <HStack>
          <AddressField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <TokenField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <PercentageDistribution
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
          />
          <DropdownMenu
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            onDelete={onDelete}
          />
        </HStack>
      </Container>
    );
  }

  return (
    <Container>
      <VStack>
        <Label label="Address" />

        <HStack>
          <AddressField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <DropdownMenu
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
            onDelete={onDelete}
          />
        </HStack>
      </VStack>

      <VStack>
        <Label label="Tokens" />

        <HStackWithPadding>
          <TokenField actionIndex={actionIndex} fieldIndex={fieldIndex} />
          <PercentageDistribution
            actionIndex={actionIndex}
            fieldIndex={fieldIndex}
          />
        </HStackWithPadding>
      </VStack>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-3',
})``;

const ErrorContainer = styled.div.attrs({
  className: 'mt-0.5',
})``;

const VStack = styled.div.attrs({
  className: 'space-y-0.5',
})``;

const HStack = styled.div.attrs({
  className: 'flex space-x-2',
})``;

const HStackWithPadding = styled.div.attrs({
  className: 'flex tablet:pr-8 space-x-2',
})``;
