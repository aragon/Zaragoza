import {
  AlertInline,
  ButtonWallet,
  Label,
  TextareaSimple,
  TextareaWYSIWYG,
  TextInput,
} from '@aragon/ods-old';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import AddLinks from 'components/addLinks';
import {useWallet} from 'hooks/useWallet';
import {StringIndexed} from 'utils/types';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {isOnlyWhitespace} from 'utils/library';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {useParams} from 'react-router-dom';
import {VersionSelectionMenu} from 'containers/versionSelectionMenu/versionSelectionMenu';
import {useUpdateContext} from 'context/update';
import {Loading} from 'components/temporary';

const DefineProposal: React.FC = () => {
  const {t} = useTranslation();
  const {address, ensAvatarUrl} = useWallet();
  const {control, setValue} = useFormContext();
  const {handlePreparePlugin, osxAvailableVersions, pluginAvailableVersions} =
    useUpdateContext();

  const pluginSelectedVersion = useWatch({name: 'pluginSelectedVersion'});
  const osSelectedVersion = useWatch({name: 'osSelectedVersion'});

  const {type} = useParams();
  const [showModal, setShowModal] = useState<{
    type: 'os' | 'plugin' | 'none';
    isOpen: boolean;
  }>({
    type: 'none',
    isOpen: false,
  });

  const UpdateItems = [
    {
      id: 'os',
      label: `Aragon OSx v${osSelectedVersion?.version}`,
      helptext: 'TBD inline release notes',
      LinkLabel: t('update.item.releaseNotesLabel'),
      ...(osxAvailableVersions?.get(osSelectedVersion?.version)?.isLatest && {
        tagLabelNatural: t('update.item.tagLatest'),
      }),
      buttonSecondaryLabel: t('update.item.versionCtaLabel'),
      onClickActionSecondary: (e: React.MouseEvent) => {
        setShowModal({
          isOpen: true,
          type: 'os',
        });
        e?.stopPropagation();
      },
      disabled: !osxAvailableVersions?.size,
    },
    {
      id: 'plugin',
      label: `Token voting v${pluginSelectedVersion?.version.release}.${pluginSelectedVersion?.version.build}`,
      helptext: 'TBD inline release notes',
      LinkLabel: t('update.item.releaseNotesLabel'),
      ...(pluginAvailableVersions?.get(
        `${pluginSelectedVersion?.version.release}.${pluginSelectedVersion?.version.build}`
      )?.isLatest && {
        tagLabelNatural: t('update.item.tagLatest'),
      }),
      ...(pluginAvailableVersions?.get(
        `${pluginSelectedVersion?.version.release}.${pluginSelectedVersion?.version.build}`
      )?.isPrepared
        ? {
            tagLabelInfo: t('update.item.tagPrepared'),
          }
        : {
            buttonPrimaryLabel: t('update.item.prepareCtaLabel'),
            onClickActionPrimary: (e: React.MouseEvent) => e?.stopPropagation(),
          }),
      buttonSecondaryLabel: t('update.item.versionCtaLabel'),
      onClickActionSecondary: (e: React.MouseEvent) => {
        setShowModal({
          isOpen: true,
          type: 'plugin',
        });
        e?.stopPropagation();
      },
      disabled: !pluginAvailableVersions?.size,
    },
  ];

  useEffect(() => {
    if (type === 'os-update') {
      setValue('proposalTitle', 'Aragon Update');
      setValue(
        'proposalSummary',
        'This is an update for your Aragon OSx based DAO. Review all the details and vote for it.'
      );
    }
  }, [setValue, type]);

  if (!pluginSelectedVersion) {
    return <Loading />;
  }

  if (type === 'os-update') {
    return (
      <UpdateContainer>
        <UpdateGroupWrapper>
          <Controller
            name="updateFramework"
            rules={{required: 'Validate'}}
            control={control}
            render={({field: {onChange, value}}) => (
              <>
                {UpdateItems.map((data, index) => {
                  if (!data.disabled)
                    return (
                      <UpdateListItem
                        key={index}
                        {...data}
                        type={value?.[data.id] ? 'active' : 'default'}
                        multiSelect
                        onClick={() => {
                          onChange({
                            ...value,
                            [data.id]: !value?.[data.id],
                          });
                        }}
                        onClickActionPrimary={(e: React.MouseEvent) => {
                          e?.stopPropagation();
                          handlePreparePlugin(data.id);
                        }}
                      />
                    );
                })}
              </>
            )}
          />
        </UpdateGroupWrapper>
        <VersionSelectionMenu
          showModal={showModal}
          handleCloseMenu={() => {
            setShowModal({
              isOpen: false,
              type: 'none',
            });
          }}
        />
        <AlertInline label={t('update.itemList.alertInfo')} mode="neutral" />
      </UpdateContainer>
    );
  }

  return (
    <>
      <FormItem>
        <Label label={t('labels.author')} />
        <ButtonWallet
          label="You"
          src={ensAvatarUrl || address}
          isConnected
          disabled
        />
      </FormItem>

      <FormItem>
        <Label label={t('newWithdraw.defineProposal.title')} />
        <Controller
          name="proposalTitle"
          defaultValue=""
          control={control}
          rules={{
            required: t('errors.required.title'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.title') : true,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('newWithdraw.defineProposal.titlePlaceholder')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      <FormItem>
        <Label label={t('labels.summary')} />
        <Controller
          name="proposalSummary"
          control={control}
          rules={{
            required: t('errors.required.summary'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.summary') : true,
          }}
          render={({
            field: {name, onBlur, onChange, value},
            fieldState: {error},
          }) => (
            <>
              <TextareaSimple
                name={name}
                value={value}
                onBlur={onBlur}
                onChange={onChange}
                placeholder={t('newWithdraw.defineProposal.summaryPlaceholder')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      <FormItem>
        <Label label={t('newWithdraw.defineProposal.body')} isOptional={true} />
        <Controller
          name="proposal"
          control={control}
          render={({field: {name, onBlur, onChange, value}}) => (
            <TextareaWYSIWYG
              name={name}
              value={value}
              onBlur={onBlur}
              onChange={onChange}
              placeholder={t('newWithdraw.defineProposal.proposalPlaceholder')}
            />
          )}
        />
      </FormItem>

      <FormItem>
        <Label
          label={t('labels.resources')}
          helpText={t('labels.resourcesHelptext')}
          isOptional
        />
        <AddLinks buttonPlusIcon buttonLabel={t('labels.addResource')} />
      </FormItem>
    </>
  );
};

export default DefineProposal;

/**
 * Check if the screen is valid
 * @param dirtyFields - The fields that have been changed
 * @param errors List of fields with errors
 * @returns Whether the screen is valid
 */
export function isValid(
  dirtyFields: StringIndexed,
  errors: StringIndexed,
  type?: string,
  updateFramework?: {
    os: boolean;
    plugin: boolean;
  },
  isSelectedPluginPrepared?: boolean
) {
  if (
    type === 'os-update' &&
    (updateFramework?.os || updateFramework?.plugin)
  ) {
    if (updateFramework?.plugin && !isSelectedPluginPrepared) return false;
    return true;
  }

  // required fields not dirty
  if (
    !dirtyFields.proposalTitle ||
    !dirtyFields.proposalSummary ||
    errors.proposalTitle ||
    errors.proposalSummary
  )
    return false;
  return true;
}

const FormItem = styled.div.attrs({
  className: 'space-y-3',
})``;

const UpdateGroupWrapper = styled.div.attrs({
  className: 'flex md:flex-row flex-col gap-y-3 gap-x-6',
})``;

const UpdateContainer = styled.div.attrs({
  className: 'space-y-4',
})``;
