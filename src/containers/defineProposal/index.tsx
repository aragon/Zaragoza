import {
  AlertInline,
  ButtonWallet,
  Label,
  TextareaSimple,
  TextareaWYSIWYG,
  TextInput,
} from '@aragon/ods-old';
import StarterKit from '@tiptap/starter-kit';
import {Markdown} from 'tiptap-markdown';
import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import AddLinks from 'components/addLinks';
import {useWallet} from 'hooks/useWallet';
import {ProposalFormData, StringIndexed} from 'utils/types';
import {Controller, useFormContext, useWatch} from 'react-hook-form';
import {isOnlyWhitespace} from 'utils/library';
import {UpdateListItem} from 'containers/updateListItem/updateListItem';
import {useParams} from 'react-router-dom';
import {VersionSelectionMenu} from 'containers/versionSelectionMenu/versionSelectionMenu';
import {useUpdateContext} from 'context/update';
import {Loading} from 'components/temporary';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useReleaseNotes} from 'services/aragon-sdk/queries/use-release-notes';
import {osxUpdates} from 'utils/osxUpdates';
import {useEditor} from '@tiptap/react';
import {useProtocolVersions} from 'hooks/useDaoVersions';

const DefineProposal: React.FC = () => {
  const {t} = useTranslation();
  const {address, ensAvatarUrl} = useWallet();
  const {control, setValue} = useFormContext();
  const {data: dao} = useDaoDetailsQuery();
  const {handlePreparePlugin, osxAvailableVersions, pluginAvailableVersions} =
    useUpdateContext();

  const {data: releases} = useReleaseNotes();
  const editor = useEditor({extensions: [StarterKit, Markdown]});
  const {data: versions} = useProtocolVersions(dao?.address);

  const pluginSelectedVersion = useWatch<
    ProposalFormData,
    'pluginSelectedVersion'
  >({
    name: 'pluginSelectedVersion',
  });
  const osSelectedVersion = useWatch<ProposalFormData, 'osSelectedVersion'>({
    name: 'osSelectedVersion',
  });
  const updateFramework = useWatch<ProposalFormData, 'updateFramework'>({
    name: 'updateFramework',
  });

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
      label: osxUpdates.getProtocolUpdateLabel(osSelectedVersion?.version),
      releaseNote: osxUpdates.getReleaseNotes({
        releases,
        version: osSelectedVersion?.version,
      }),
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(osxAvailableVersions?.get(osSelectedVersion?.version ?? '')
        ?.isLatest && {
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
      releaseNote: osxUpdates.getReleaseNotes({
        releases,
        version: pluginSelectedVersion?.version,
        isPlugin: true,
      }),
      label: osxUpdates.getPluginUpdateLabel(pluginSelectedVersion?.version),
      linkLabel: t('update.item.releaseNotesLabel'),
      ...(pluginAvailableVersions?.get(
        osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
      )?.isLatest && {
        tagLabelNatural: t('update.item.tagLatest'),
      }),
      ...(pluginAvailableVersions?.get(
        osxUpdates.getPluginVersion(pluginSelectedVersion?.version) ?? ''
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
    let index = 0;
    if (updateFramework?.os && pluginSelectedVersion?.version) {
      setValue(`actions.${index}.name`, 'os_update');
      setValue(`actions.${index}.inputs.version`, osSelectedVersion?.version);
      index++;
    }
    if (updateFramework?.plugin && pluginSelectedVersion?.version) {
      setValue(`actions.${index}.name`, 'plugin_update');
      setValue(`actions.${index}.inputs`, {
        versionTag: pluginSelectedVersion.version,
      });
    }
  }, [
    osSelectedVersion?.version,
    pluginSelectedVersion?.version,
    setValue,
    updateFramework?.os,
    updateFramework?.plugin,
  ]);

  useEffect(() => {
    if (type === 'os-update') {
      const proposalTitle = t('update.proposal.title');
      const proposalSummary = t('update.proposal.summary', {
        daoName: dao?.metadata.name,
      });

      setValue('proposalTitle', proposalTitle);
      setValue('proposalSummary', proposalSummary);
    }
  }, [setValue, type, dao, t]);

  useEffect(() => {
    if (type === 'os-update') {
      let proposalBody = t('update.proposal.descriptionHeader');

      if (updateFramework?.os) {
        const updatedVersion = osxUpdates.getProtocolUpdateLabel(
          osSelectedVersion?.version
        );
        const releaseNotes = osxUpdates.getReleaseNotes({
          releases,
          version: osSelectedVersion?.version,
        });
        editor?.commands.setContent(releaseNotes?.summary ?? '');
        proposalBody += t('update.proposal.descriptionProtocolUpgrade', {
          updatedVersion,
          description: editor?.getHTML().replace(/<(\/){0,1}p>/g, ''),
          releaseNotesLink: releaseNotes?.html_url,
          currentVersion: osxUpdates.getProtocolUpdateLabel(versions),
        });
      }
      if (updateFramework?.plugin) {
        const updatedVersion = osxUpdates.getPluginUpdateLabel(
          pluginSelectedVersion?.version
        );
        const releaseNotes = osxUpdates.getReleaseNotes({
          releases,
          version: pluginSelectedVersion?.version,
          isPlugin: true,
        });
        editor?.commands.setContent(releaseNotes?.summary ?? '');
        proposalBody += t('update.proposal.descriptionPluginUpgrade', {
          updatedVersion,
          description: editor?.getHTML().replace(/<(\/){0,1}p>/g, ''),
          releaseNotesLink: releaseNotes?.html_url,
          currentVersion: osxUpdates.getPluginUpdateLabel(dao?.plugins[0]),
        });
      }

      proposalBody += t('update.proposal.descriptionFooter');

      setValue('proposal', proposalBody);
    }
  }, [
    setValue,
    type,
    dao,
    t,
    editor,
    versions,
    releases,
    osSelectedVersion,
    pluginSelectedVersion,
    updateFramework,
  ]);

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
