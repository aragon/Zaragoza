import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useForm, FormProvider} from 'react-hook-form';
import React from 'react';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import SetupVotingForm from 'containers/setupVotingForm';
import DefineProposal from 'containers/defineProposal';
import ConfigureActions from 'containers/configureActions';
import AddActionMenu from 'containers/addActionMenu';

const NewProposal: React.FC = () => {
  const {t} = useTranslation();
  const formMethods = useForm();

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <FullScreenStepper wizardProcessName={t('newProposal.title')}>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm />
        </Step>
        <Step
          wizardTitle={t('newProposal.configureActions.heading')}
          wizardDescription={t('newProposal.configureActions.description')}
        >
          <ConfigureActions />
        </Step>
      </FullScreenStepper>
      <AddActionMenu onActionSelect={alert} />
    </FormProvider>
  );
};

export default withTransaction('NewProposal', 'component')(NewProposal);
