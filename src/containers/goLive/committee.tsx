import {Controller, useFormContext} from 'react-hook-form';
import {useFormStep} from '../../components/fullScreenStepper';
import {useGlobalModalContext} from '../../context/globalModals';
import {useTranslation} from 'react-i18next';
import {
  Dd,
  DescriptionListContainer,
  Dl,
  Dt,
} from '../../components/descriptionList';
import {Link} from '@aragon/ods-old';
import React from 'react';
import CommitteeAddressesModal from '../committeeAddressesModal';

const Committee = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {open} = useGlobalModalContext();
  const {t} = useTranslation();

  const {
    reviewCheckError,
    committee,
    committeeMinimumApproval,
    executionExpirationMinutes,
    executionExpirationHours,
    executionExpirationDays,
  } = getValues();

  return (
    <Controller
      name="reviewCheck.committee"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('label.executionMultisig')}
          onEditClick={() => setStep(6)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.changeableVote')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.eligibleMembers')}</Dt>
            <Dd>{t('labels.multisigMembers')}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.members')}</Dt>
            <Dd>
              <Link
                label={t('createDAO.review.distributionLink', {
                  count: committee?.length,
                })}
                onClick={() => open('committeeMembers')}
              />
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.minimumApproval')}</Dt>
            <Dd>
              {committeeMinimumApproval}&nbsp;
              {t('labels.review.multisigMinimumApprovals', {
                count: committee.length,
              })}
            </Dd>
          </Dl>
          <Dl>
            <Dt>{t('createDao.executionMultisig.executionTitle')}</Dt>
            <Dd>
              <div className="flex space-x-1.5">
                <div>
                  {t('createDAO.review.days', {days: executionExpirationDays})}
                </div>
                {executionExpirationHours > 0 && (
                  <div>
                    {t('createDAO.review.hours', {
                      hours: executionExpirationHours,
                    })}
                  </div>
                )}
                {executionExpirationMinutes > 0 && (
                  <div>
                    {t('createDAO.review.minutes', {
                      minutes: executionExpirationMinutes,
                    })}
                  </div>
                )}
              </div>
            </Dd>
          </Dl>

          <CommitteeAddressesModal />
        </DescriptionListContainer>
      )}
    />
  );
};

export default Committee;
