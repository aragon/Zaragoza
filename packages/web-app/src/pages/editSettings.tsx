import {
  AlertInline,
  Breadcrumb,
  ButtonText,
  IconGovernance,
  ListItemAction,
  Wizard,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useEffect, useMemo} from 'react';
import {
  useFieldArray,
  useFormContext,
  useFormState,
  useWatch,
} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import {Loading} from 'components/temporary';
import ConfigureCommunity from 'containers/configureCommunity';
import DefineMetadata from 'containers/defineMetadata';
import {useNetwork} from 'context/network';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {getDHMFromSeconds} from 'utils/date';
import {ProposeNewSettings} from 'utils/paths';
import {AccordionItem, AccordionMultiple} from 'components/accordionMethod';

const EditSettings: React.FC = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isMobile} = useScreen();
  const {breadcrumbs, icon, tag} = useMappedBreadcrumbs();

  const {setValue, control} = useFormContext();
  const {fields, replace} = useFieldArray({
    name: 'daoLinks',
    control,
  });
  const {errors} = useFormState({control});

  const {data: daoId, isLoading: paramAreLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoId!
  );
  const {data: daoSettings, isLoading: settingsAreLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {days, hours, minutes} = getDHMFromSeconds(daoSettings.minDuration);

  const [
    daoName,
    daoSummary,
    daoLogo,
    minimumApproval,
    minimumParticipation,
    support,
    durationDays,
    durationHours,
    durationMinutes,
    membership,
    resourceLinks,
  ] = useWatch({
    name: [
      'daoName',
      'daoSummary',
      'daoLogo',
      'minimumApproval',
      'minimumParticipation',
      'support',
      'durationDays',
      'durationHours',
      'durationMinutes',
      'membership',
      'daoLinks',
    ],
    control,
  });

  const controlledLinks = fields.map((field, index) => {
    return {
      ...field,
      ...(resourceLinks && {...resourceLinks[index]}),
    };
  });

  const resourceLinksAreEqual: boolean = useMemo(() => {
    if (!daoDetails?.metadata.links || !resourceLinks) return true;

    // length validation
    const lengthDifference =
      resourceLinks.length - daoDetails.metadata.links.length;

    // links were added to form
    if (lengthDifference > 0) {
      // loop through extra links
      for (
        let i = daoDetails.metadata.links.length;
        i < resourceLinks.length;
        i++
      ) {
        // check if link is filled without error -> then consider it as a proper change
        if (
          resourceLinks[i].name &&
          resourceLinks[i].url &&
          !errors.daoLinks?.[i]
        )
          return false;
      }
    }

    // links were removed
    if (lengthDifference < 0) return false;

    // content validation (i.e. same number of links)
    for (let i = 0; i < daoDetails.metadata.links.length; i++) {
      if (
        controlledLinks[i].name !== daoDetails.metadata.links[i].name ||
        controlledLinks[i].url !== daoDetails.metadata.links[i].url
      )
        return false;
    }

    return true;
  }, [
    controlledLinks,
    daoDetails?.metadata.links,
    errors.daoLinks,
    resourceLinks,
  ]);

  // metadata setting changes
  const isMetadataChanged = useMemo(
    () =>
      daoDetails?.metadata.name
        ? daoName !== daoDetails.metadata.name ||
          daoSummary !== daoDetails.metadata.description ||
          daoLogo !== daoDetails.metadata.avatar ||
          !resourceLinksAreEqual
        : false,
    [
      daoDetails?.metadata.avatar,
      daoDetails?.metadata.description,
      daoDetails?.metadata.name,
      daoLogo,
      daoName,
      daoSummary,
      resourceLinksAreEqual,
    ]
  );

  // governance
  const isGovernanceChanged = useMemo(() => {
    // TODO: We need to force forms to only use one type, Number or string
    return (
      Number(
        membership === 'token' ? minimumApproval : minimumParticipation
      ) !== Math.round(daoSettings.minTurnout * 100) ||
      Number(support) !== Math.round(daoSettings.minSupport * 100) ||
      Number(durationDays) !== days ||
      Number(durationHours) !== hours ||
      Number(durationMinutes) !== minutes
    );
  }, [
    daoSettings.minSupport,
    daoSettings.minTurnout,
    days,
    durationDays,
    durationHours,
    durationMinutes,
    hours,
    membership,
    minimumApproval,
    minimumParticipation,
    minutes,
    support,
  ]);

  const setCurrentMetadata = useCallback(() => {
    setValue('daoName', daoDetails?.metadata.name);
    setValue('daoSummary', daoDetails?.metadata.description);
    setValue('daoLogo', daoDetails?.metadata.avatar);

    //
    /**
     * FIXME - this is the dumbest workaround: because there is an internal
     * field array in 'AddLinks', conflicts arise when removing rows
     * via remove and update. While the append, remove and replace
     * technically happens whe we reset the form, a row is not added to the AddLinks component
     * leaving the component in a state where one or more rows are hidden
     * until the Add Link button is clicked.
     * The workaround is to forcefully set empty fields for each link coming from
     * daoDetails and then replacing them with the proper values
     */
    if (daoDetails?.metadata.links) {
      setValue('daoLinks', [...daoDetails.metadata.links.map(() => ({}))]);
      replace([...daoDetails.metadata.links]);
    }
  }, [
    daoDetails?.metadata.avatar,
    daoDetails?.metadata.description,
    daoDetails?.metadata.links,
    daoDetails?.metadata.name,
    setValue,
    replace,
  ]);

  const setCurrentGovernance = useCallback(() => {
    if (membership === 'token')
      setValue('minimumApproval', Math.round(daoSettings.minTurnout * 100));
    else
      setValue(
        'minimumParticipation',
        Math.round(daoSettings.minTurnout * 100)
      );
    setValue('support', Math.round(daoSettings.minSupport * 100));
    setValue('durationDays', days);
    setValue('durationHours', hours);
    setValue('durationMinutes', minutes);
    // TODO: Need to add community settings later, Also the Alerts share will be added later
    setValue(
      'membership',
      daoDetails?.plugins[0].id === 'erc20voting.dao.eth' ? 'token' : 'wallet'
    );
  }, [
    daoDetails?.plugins,
    daoSettings.minSupport,
    daoSettings.minTurnout,
    days,
    hours,
    membership,
    minutes,
    setValue,
  ]);

  useEffect(() => {
    setCurrentMetadata();
    setCurrentGovernance();
  }, [setCurrentGovernance, setCurrentMetadata]);

  if (paramAreLoading || detailsAreLoading || settingsAreLoading) {
    return <Loading />;
  }

  const metadataAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isMetadataChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentMetadata,
    },
  ];

  const governanceAction = [
    {
      component: (
        <ListItemAction
          title={t('settings.resetChanges')}
          bgWhite
          mode={isGovernanceChanged ? 'default' : 'disabled'}
        />
      ),
      callback: setCurrentGovernance,
    },
  ];

  return (
    <Container>
      <div className="-mx-2 desktop:mx-0">
        <Wizard
          includeStepper={false}
          title={t('settings.editDaoSettings')}
          description={t('settings.editSubtitle')}
          nav={
            <Breadcrumb
              icon={icon}
              crumbs={breadcrumbs}
              onClick={navigate}
              tag={tag}
            />
          }
        />

        {isMobile && (
          <div className="px-2 pb-3 -mt-1 bg-white">
            <ButtonText
              className="w-full tablet:w-max"
              label={t('settings.resetChanges')}
              mode="secondary"
              size={isMobile ? 'large' : 'medium'}
              disabled
            />
          </div>
        )}
      </div>

      <div className="mx-auto mt-5 desktop:mt-8 desktop:w-3/5">
        <AccordionMultiple defaultValue="metadata" className="space-y-3">
          <AccordionItem
            type="action-builder"
            name="metadata"
            methodName={t('labels.review.daoMetadata')}
            alertLabel={
              isMetadataChanged ? t('settings.newSettings') : undefined
            }
            dropdownItems={metadataAction}
          >
            <AccordionContent>
              <DefineMetadata bgWhite />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem
            type="action-builder"
            name="governance"
            methodName={t('labels.review.governance')}
            alertLabel={
              isGovernanceChanged ? t('settings.newSettings') : undefined
            }
            dropdownItems={governanceAction}
          >
            <AccordionContent>
              <ConfigureCommunity />
            </AccordionContent>
          </AccordionItem>
        </AccordionMultiple>
      </div>

      <ButtonContainer>
        <HStack>
          <ButtonText
            className="w-full tablet:w-max"
            label={t('settings.reviewProposal')}
            iconLeft={<IconGovernance />}
            size={isMobile ? 'large' : 'medium'}
            disabled={!isGovernanceChanged && !isMetadataChanged}
            onClick={() =>
              navigate(generatePath(ProposeNewSettings, {network, dao: daoId}))
            }
          />
          <ButtonText
            className="w-full tablet:w-max"
            label={t('settings.resetChanges')}
            mode="secondary"
            size={isMobile ? 'large' : 'medium'}
            onClick={() => {
              setCurrentMetadata();
              setCurrentGovernance();
            }}
          />
        </HStack>

        <AlertInline label={t('settings.proposeSettingsInfo')} mode="neutral" />
      </ButtonContainer>
    </Container>
  );
};

export default withTransaction('EditSettings', 'component')(EditSettings);

const Container = styled.div.attrs({
  className:
    'col-span-full desktop:col-start-2 desktop:col-end-12 desktop:mt-5',
})``;

const AccordionContent = styled.div.attrs({
  className:
    'p-3 pb-6 space-y-3 bg-ui-0 border border-ui-100 rounded-b-xl border-t-0',
})``;

const HStack = styled.div.attrs({
  className:
    'desktop:flex space-x-0 desktop:space-x-3 space-y-2 desktop:space-y-0',
})``;

const ButtonContainer = styled.div.attrs({
  className: 'mx-auto mt-5 desktop:mt-8 space-y-2 desktop:w-3/5',
})``;
