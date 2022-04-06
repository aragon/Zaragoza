import React from 'react';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useForm, FormProvider} from 'react-hook-form';

import TokenMenu from 'containers/tokenMenu';
import {Finance} from 'utils/paths';
import {TEST_DAO} from 'utils/constants';
import {formatUnits} from 'utils/library';
import DefineProposal from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import {BaseTokenInfo} from 'utils/types';
import {useDaoBalances} from 'hooks/useDaoBalances';
import ConfigureWithdrawForm from 'containers/configureWithdraw';
import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {fetchTokenPrice} from 'services/prices';

export type TokenFormData = {
  tokenName: string;
  tokenSymbol: string;
  tokenImgUrl: string;
  tokenAddress: Address;
  tokenBalance: string;
  tokenPrice?: number;
  isCustomToken: boolean;
};

type WithdrawAction = TokenFormData & {
  to: Address;
  from: Address;
  amount: string;
  name: string; // This indicates the type of action; Deposit is NOT an action
};

type WithdrawFormData = {
  actions: WithdrawAction[];

  // Proposal data
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  startUtc: string;
  endUtc: string;
};

export const defaultValues = {
  actions: [
    {
      name: 'withdraw_assets',
      to: '',
      from: '',
      amount: '',
      tokenAddress: '',
      tokenSymbol: '',
      tokenName: '',
      tokenImgUrl: '',
    },
  ],

  // Proposal data
  startDate: '',
  startTime: '',
  endDate: '',
  endTime: '',
  duration: 5,
  startUtc: '',
  endUtc: '',

  // Form metadata
  isCustomToken: false,
};

const NewWithdraw: React.FC = () => {
  const {t} = useTranslation();
  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const {data: balances} = useDaoBalances(TEST_DAO);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    formMethods.setValue('actions.0.tokenSymbol', token.symbol);

    if (token.address === '') {
      formMethods.setValue('actions.0.isCustomToken', true);
      formMethods.resetField('actions.0.tokenName');
      formMethods.resetField('actions.0.tokenImgUrl');
      formMethods.resetField('actions.0.tokenAddress');
      formMethods.resetField('actions.0.tokenBalance');
      formMethods.clearErrors('actions.0.amount');
      return;
    }

    formMethods.clearErrors([
      'actions.0.tokenAddress',
      'actions.0.tokenSymbol',
    ]);
    formMethods.setValue('actions.0.isCustomToken', false);
    formMethods.setValue('actions.0.tokenName', token.name);
    formMethods.setValue('actions.0.tokenImgUrl', token.imgUrl);
    formMethods.setValue('actions.0.tokenAddress', token.address);
    formMethods.setValue(
      'actions.0.tokenBalance',
      formatUnits(token.count, token.decimals)
    );

    fetchTokenPrice(token.address).then(price => {
      formMethods.setValue('actions.0.tokenPrice', price);
    });

    if (formMethods.formState.dirtyFields.actions?.[0].amount) {
      formMethods.trigger('actions.0.amount');
    }
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <>
      <FormProvider {...formMethods}>
        <FullScreenStepper
          wizardProcessName={t('newWithdraw.withdrawAssets')}
          navLabel={t('allTransfer.newTransfer')}
          returnPath={Finance}
        >
          {/* FIXME: Each step needs to be able to disable the back
        button. Otherwise, if the user leaves step x in an invalid state and
        goes back to a step < x, they won't be able to move forward. */}

          {/* TODO: Removing isNextButtonDisabled is disabled till the above is fixed */}
          <Step
            wizardTitle={t('newWithdraw.configureWithdraw.title')}
            wizardDescription={t('newWithdraw.configureWithdraw.subtitle')}
            // isNextButtonDisabled={!formMethods.formState.isValid}
          >
            <ConfigureWithdrawForm />
          </Step>
          <Step
            wizardTitle={t('newWithdraw.setupVoting.title')}
            wizardDescription={t('newWithdraw.setupVoting.description')}
            // isNextButtonDisabled={!formMethods.formState.isValid}
          >
            <SetupVotingForm />
          </Step>
          <Step
            wizardTitle={t('newWithdraw.defineProposal.heading')}
            wizardDescription={t('newWithdraw.defineProposal.description')}
            // isNextButtonDisabled={!formMethods.formState.isValid}
          >
            <DefineProposal />
          </Step>
          <Step
            wizardTitle={t('newWithdraw.reviewProposal.heading')}
            wizardDescription={t('newWithdraw.reviewProposal.description')}
            nextButtonLabel={t('labels.submitWithdraw')}
            isNextButtonDisabled
            fullWidth
          >
            <ReviewProposal />
          </Step>
        </FullScreenStepper>
        <TokenMenu
          isWallet={false}
          onTokenSelect={handleTokenSelect}
          tokenBalances={balances}
        />
      </FormProvider>
    </>
  );
};

export default withTransaction('NewWithdraw', 'component')(NewWithdraw);
