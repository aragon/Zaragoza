import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {CheckboxListItem, Label} from '@aragon/ui-components';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import ExistingTokenPartialForm from './addExistingToken';

const SetupCommunityForm: React.FC = () => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const isCustomToken = useWatch({name: 'isCustomToken'});

  return (
    <>
      {/* Eligibility */}
      <FormItem>
        <Label label={t('labels.membership')} />
        <Controller
          name="membership"
          control={control}
          defaultValue="token"
          render={({field: {onChange, value}}) => (
            <CheckboxListItem
              label={t('createDAO.step3.tokenMembership')}
              helptext={t('createDAO.step3.tokenMembershipSubtitle')}
              multiSelect={false}
              onClick={() => onChange('token')}
              {...(value === 'token' ? {state: 'active'} : {})}
            />
          )}
        />

        <CheckboxListItem
          label={t('createDAO.step3.walletMemberShip')}
          helptext={t('createDAO.step3.walletMemberShipSubtitle')}
          disabled
          onClick={() => null}
          multiSelect={false}
        />
      </FormItem>

      {/* Token creation */}
      <FormItem>
        <Label label={t('labels.communityToken')} />
        <Controller
          name="isCustomToken"
          defaultValue={null}
          control={control}
          render={({field: {onChange, value}}) => (
            <CheckboxListItem
              label={t('createDAO.step3.newToken')}
              helptext={t('createDAO.step3.newTokenSubtitle')}
              multiSelect={false}
              onClick={() => onChange(true)}
              state={value ? 'active' : 'default'}
            />
          )}
        />
        <Controller
          control={control}
          name="isCustomToken"
          defaultValue={null}
          render={({field: {onChange, value}}) => (
            <CheckboxListItem
              label={t('createDAO.step3.existingToken')}
              helptext={t('createDAO.step3.existingTokenSubtitle')}
              state={value === false ? 'active' : 'default'}
              multiSelect={false}
              onClick={() => onChange(false)}
            />
          )}
        />
      </FormItem>

      {/* Add existing token */}

      {isCustomToken && <div>Create Token</div>}

      {isCustomToken === false && <ExistingTokenPartialForm />}
    </>
  );
};

export default SetupCommunityForm;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;
