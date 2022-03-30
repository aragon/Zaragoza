import {
  AlertInline,
  DropdownInput,
  Label,
  ValueInput,
} from '@aragon/ui-components';

import {
  Controller,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useCallback, useEffect} from 'react';

import {
  validateAddress,
  validateTokenAddress,
  validateTokenAmount,
} from 'utils/validators';
import {TEST_DAO} from 'utils/constants';
import {useWallet} from 'context/augmentedWallet';
import {useProviders} from 'context/providers';
import {fetchTokenData} from 'services/prices';
import {useApolloClient} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {handleClipboardActions} from 'utils/library';
import {fetchBalance, getTokenInfo, isETH} from 'utils/tokens';

type ConfigureWithdrawFormProps = {
  index?: number;
  setActionsCounter?: (index: number) => void;
};

const ConfigureWithdrawForm: React.FC<ConfigureWithdrawFormProps> = ({
  index = 0,
  setActionsCounter,
}) => {
  const {t} = useTranslation();
  const client = useApolloClient();
  const {open} = useGlobalModalContext();
  const {account} = useWallet();
  const {infura: provider} = useProviders();

  const {control, getValues, trigger, resetField, setFocus, setValue} =
    useFormContext();

  const {errors, dirtyFields} = useFormState({control});
  const [from, tokenAddress, isCustomToken, tokenBalance, symbol] = useWatch({
    name: [
      `actions.${index}.from`,
      `actions.${index}.tokenAddress`,
      `actions.${index}.isCustomToken`,
      `actions.${index}.tokenBalance`,
      `actions.${index}.tokenSymbol`,
    ],
  });
  /*************************************************
   *                    Hooks                      *
   *************************************************/
  useEffect(() => {
    if (isCustomToken) setFocus(`actions.${index}.tokenAddress`);

    if (from === '') {
      setValue(`actions.${index}.from`, TEST_DAO);
    }
  }, [account, from, index, isCustomToken, setFocus, setValue]);

  // Fetch custom token information
  useEffect(() => {
    if (!account || !isCustomToken || !tokenAddress) return;

    const fetchTokenInfo = async () => {
      if (errors.tokenAddress !== undefined) {
        if (dirtyFields.amount)
          trigger([`actions.${index}.amount`, `actions.${index}.tokenSymbol`]);
        return;
      }

      try {
        // fetch token balance and token metadata
        // TODO: replace TEST_DAO with DAO address
        const allTokenInfoPromise = Promise.all([
          isETH(tokenAddress)
            ? provider.getBalance(TEST_DAO)
            : fetchBalance(tokenAddress, TEST_DAO, provider),
          fetchTokenData(tokenAddress, client),
        ]);

        // use blockchain if api data unavailable
        const [balance, data] = await allTokenInfoPromise;
        if (data) {
          setValue(`actions.${index}.tokenName`, data.name);
          setValue(`actions.${index}.tokenSymbol`, data.symbol);
          setValue(`actions.${index}.tokenImgUrl`, data.imgUrl);

          // TODO: @Rakesh: is this the proper place to pull this in?
          setValue(`actions.${index}.tokenPrice`, data.price);
        } else {
          const {name, symbol} = await getTokenInfo(tokenAddress, provider);
          setValue(`actions.${index}.tokenName`, name);
          setValue(`actions.${index}.tokenSymbol`, symbol);
        }
        setValue(`actions.${index}.tokenBalance`, balance);
      } catch (error) {
        /**
         * Error is intentionally swallowed. Passing invalid address will
         * return error, but should not be thrown.
         * Also, double safeguard. Should not actually fall into here since
         * tokenAddress should be valid in the first place for balance to be fetched.
         */
        console.error(error);
      }
      if (dirtyFields.amount)
        trigger([`actions.${index}.amount`, `actions.${index}.tokenSymbol`]);
    };

    fetchTokenInfo();
  }, [
    account,
    dirtyFields.amount,
    errors.tokenAddress,
    index,
    isCustomToken,
    provider,
    setValue,
    tokenAddress,
    trigger,
    client,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleMaxClicked = useCallback(
    (onChange: React.ChangeEventHandler<HTMLInputElement>) => {
      if (tokenBalance) {
        onChange(tokenBalance);
      }
    },
    [tokenBalance]
  );

  const renderWarning = useCallback(
    (value: string) => {
      // Insufficient data to calculate warning
      if (!tokenBalance || value === '') return null;

      if (Number(value) > Number(tokenBalance))
        return (
          <AlertInline label={t('warnings.amountGtDaoToken')} mode="warning" />
        );
    },
    [tokenBalance, t]
  );

  /*************************************************
   *                Field Validators               *
   *************************************************/
  const addressValidator = useCallback(
    async (address: string) => {
      if (isETH(address)) return true;

      const validationResult = await validateTokenAddress(address, provider);

      // address invalid, reset token fields
      if (validationResult !== true) {
        resetField(`actions.${index}.tokenName`);
        resetField(`actions.${index}.tokenImgUrl`);
        resetField(`actions.${index}.tokenSymbol`);
        resetField(`actions.${index}.tokenBalance`);
      }

      return validationResult;
    },
    [index, provider, resetField]
  );

  const amountValidator = useCallback(
    async (amount: string) => {
      const tokenAddress = getValues(`actions.${index}.tokenAddress`);

      // check if a token is selected using its address
      if (tokenAddress === '') return t('errors.noTokenSelected');

      // check if token selected is valid
      if (errors.tokenAddress) return t('errors.amountWithInvalidToken');

      try {
        const {decimals} = await getTokenInfo(tokenAddress, provider);

        // run amount rules
        return validateTokenAmount(amount, decimals);
      } catch (error) {
        // catches miscellaneous cases such as not being able to get token decimal
        console.error('Error validating amount', error);
        return t('errors.defaultAmountValidationError');
      }
    },
    [errors.tokenAddress, getValues, index, provider, t]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      {/* Recipient (to) */}
      <FormItem>
        <Label
          label={t('labels.to')}
          helpText={t('newWithdraw.configureWithdraw.toSubtitle')}
        />
        <Controller
          name={`actions.${index}.to`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.recipient'),
            validate: validateAddress,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <ValueInput
                mode={error ? 'critical' : 'default'}
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('placeHolders.walletOrEns')}
                adornmentText={value ? t('labels.copy') : t('labels.paste')}
                onAdornmentClick={() => handleClipboardActions(value, onChange)}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Select token */}
      <FormItem>
        <Label
          label={t('labels.token')}
          helpText={t('newWithdraw.configureWithdraw.tokenSubtitle')}
        />
        <Controller
          name={`actions.${index}.tokenSymbol`}
          control={control}
          defaultValue=""
          rules={{required: t('errors.required.token')}}
          render={({field: {name, value}, fieldState: {error}}) => (
            <>
              <DropdownInput
                name={name}
                mode={error ? 'critical' : 'default'}
                value={value}
                onClick={() => {
                  setActionsCounter?.(index);
                  open('token');
                }}
                placeholder={t('placeHolders.selectToken')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Custom token address */}
      {isCustomToken && (
        <FormItem>
          <Label
            label={t('labels.address')}
            helpText={t('newDeposit.contractAddressSubtitle')}
          />
          <Controller
            name={`actions.${index}.tokenAddress`}
            control={control}
            defaultValue=""
            rules={{
              required: t('errors.required.tokenAddress'),
              validate: addressValidator,
            }}
            render={({
              field: {name, onBlur, onChange, value, ref},
              fieldState: {error},
            }) => (
              <>
                <ValueInput
                  mode={error ? 'critical' : 'default'}
                  ref={ref}
                  name={name}
                  value={value}
                  onBlur={onBlur}
                  onChange={onChange}
                  adornmentText={value ? t('labels.copy') : t('labels.paste')}
                  onAdornmentClick={() =>
                    handleClipboardActions(value, onChange)
                  }
                />
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            )}
          />
        </FormItem>
      )}

      {/* Token amount */}
      <FormItem>
        <Label
          label={t('labels.amount')}
          helpText={t('newWithdraw.configureWithdraw.amountSubtitle')}
        />
        <Controller
          name={`actions.${index}.amount`}
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.amount'),
            validate: amountValidator,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <StyledInput
                mode={error ? 'critical' : 'default'}
                name={name}
                type="number"
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                adornmentText={t('labels.max')}
                onAdornmentClick={() => handleMaxClicked(onChange)}
              />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  {error?.message && (
                    <AlertInline label={error.message} mode="critical" />
                  )}
                  {renderWarning(value)}
                </div>
                {tokenBalance && (
                  <TokenBalance>
                    {`${t('labels.maxBalance')}: ${tokenBalance} ${symbol}`}
                  </TokenBalance>
                )}
              </div>
            </>
          )}
        />
      </FormItem>
    </>
  );
};

export default ConfigureWithdrawForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const TokenBalance = styled.p.attrs({
  className: 'flex-1 px-1 text-xs text-right text-ui-600',
})``;

const StyledInput = styled(ValueInput)`
  ::-webkit-inner-spin-button,
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  -moz-appearance: textfield;
`;
