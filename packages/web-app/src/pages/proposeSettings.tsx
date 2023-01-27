import {useReactiveVar} from '@apollo/client';
import {
  DaoAction,
  ICreateProposalParams,
  InstalledPluginListItem,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenVotingClient,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {pendingProposalsVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {PENDING_PROPOSALS_KEY, TransactionState} from 'utils/constants';
import {getCanonicalUtcOffset, getSecondsFromDHM} from 'utils/date';
import {customJSONReplacer} from 'utils/library';
import {EditSettings, Proposal} from 'utils/paths';
import {
  mapToDetailedProposal,
  MapToDetailedProposalParams,
  prefixProposalIdWithPlgnAdr,
} from 'utils/proposals';
import {
  Action,
  ActionUpdateMetadata,
  ActionUpdatePluginSettings,
  ProposalResource,
} from 'utils/types';

const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {data: daoId, isLoading: daoParamLoading} = useDaoParam();
  const {network} = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  if (daoParamLoading) {
    return <Loading />;
  }

  return (
    <ProposeSettingWrapper
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(EditSettings, {network, dao: daoId})}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
        >
          <CompareSettings />
        </Step>
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
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitWithdraw')}
          onNextButtonClicked={enableTxModal}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </ProposeSettingWrapper>
  );
};

export default withTransaction('ProposeSettings', 'component')(ProposeSettings);

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

const ProposeSettingWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {getValues, setValue} = useFormContext();

  const {preferences} = usePrivacyContext();
  const {network} = useNetwork();
  const {address, isOnWrongNetwork} = useWallet();

  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);
  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);
  const {data: pluginSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );
  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );
  const {client} = useClient();
  const pluginClient = usePluginClient(
    // TODO update context to work with multisig
    // pluginType as PluginTypes
    'token-voting.plugin.dao.eth'
  ) as unknown as TokenVotingClient | undefined;

  const [proposalCreationData, setProposalCreationData] =
    useState<ICreateProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const [proposalId, setProposalId] = useState<string>();

  const cachedProposals = useReactiveVar(pendingProposalsVar);

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // Not a fan, but this sets the actions on the form
  // context so that the Action Widget can read them
  useEffect(() => {
    {
      const [
        daoName,
        daoSummary,
        daoLogo,
        minimumApproval,
        minimumParticipation,
        earlyExecution,
        voteReplacement,
        durationDays,
        durationHours,
        durationMinutes,
        resourceLinks,
        tokenSupply,
      ] = getValues([
        'daoName',
        'daoSummary',
        'daoLogo',
        'minimumApproval',
        'minimumParticipation',
        'earlyExecution',
        'voteReplacement',
        'durationDays',
        'durationHours',
        'durationMinutes',
        'daoLinks',
        'tokenTotalSupply',
      ]);

      const metadataAction: ActionUpdateMetadata = {
        name: 'modify_metadata',
        inputs: {
          name: daoName,
          description: daoSummary,
          avatar: daoLogo,
          links: resourceLinks,
        },
      };

      const voteSettingsAction: ActionUpdatePluginSettings = {
        name: 'modify_token_voting_settings',
        inputs: {
          token: daoToken,
          totalVotingWeight: tokenSupply?.raw || BigInt(0),

          minDuration: getSecondsFromDHM(
            durationDays,
            durationHours,
            durationMinutes
          ),
          supportThreshold: Number(minimumApproval) / 100,
          minParticipation: Number(minimumParticipation) / 100,
          votingMode: earlyExecution
            ? VotingMode.EARLY_EXECUTION
            : voteReplacement
            ? VotingMode.VOTE_REPLACEMENT
            : VotingMode.STANDARD,
        },
      };

      setValue('actions', [metadataAction, voteSettingsAction]);
    }
  }, [daoToken, getValues, setValue]);

  useEffect(() => {
    // encoding actions
    const encodeActions = async (): Promise<DaoAction[]> => {
      // return an empty array for undefined clients
      const actions: Array<Promise<DaoAction>> = [];
      if (!pluginClient || !client) return Promise.all(actions);

      for (const action of getValues('actions') as Array<Action>) {
        if (action.name === 'modify_metadata') {
          const ipfsUri = await client.methods.pinMetadata(action.inputs);
          actions.push(client.encoding.updateDaoMetadataAction(dao, ipfsUri));
        } else if (action.name === 'modify_token_voting_settings') {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updatePluginSettingsAction(
                dao,
                action.inputs
              )
            )
          );
        }
      }
      return Promise.all(actions);
    };

    const getProposalCreationParams =
      async (): Promise<ICreateProposalParams> => {
        const [
          title,
          summary,
          description,
          resources,
          startDate,
          startTime,
          startUtc,
          endDate,
          endTime,
          endUtc,
        ] = getValues([
          'proposalTitle',
          'proposalSummary',
          'proposal',
          'links',
          'startDate',
          'startTime',
          'startUtc',
          'endDate',
          'endTime',
          'endUtc',
        ]);

        const actions = await encodeActions();

        const metadata: ProposalMetadata = {
          title,
          summary,
          description,
          resources: resources.filter((r: ProposalResource) => r.name && r.url),
        };

        const ipfsUri = await pluginClient?.methods.pinMetadata(metadata);

        // Ignore encoding if the proposal had no actions
        return {
          pluginAddress,
          metadataUri: ipfsUri || '',
          startDate: new Date(
            `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
          ),
          endDate: new Date(
            `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
          ),
          actions,
        };
      };

    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    setProposalData();
  }, [
    creationProcessState,
    showTxModal,
    getValues,
    dao,
    pluginAddress,
    pluginClient,
    client,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = () => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Proposal, {network, dao, id: proposalId}));
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  };

  const handlePublishSettings = async () => {
    if (!pluginClient) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE: {
            //TODO: replace with step.proposal id when SDK returns proper format
            const prefixedId = prefixProposalIdWithPlgnAdr(
              step.proposalId.toString(),
              pluginAddress
            );

            console.log('proposal id', prefixedId);
            setProposalId(prefixedId);
            setCreationProcessState(TransactionState.SUCCESS);

            // cache proposal
            handleCacheProposal(prefixedId);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  };

  const handleCacheProposal = useCallback(
    (proposalId: string) => {
      if (!address || !daoDetails || !pluginSettings || !proposalCreationData)
        return;

      const [title, summary, description, resources] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
      ]);

      const metadata: ProposalMetadata = {
        title,
        summary,
        description,
        resources: resources.filter((r: ProposalResource) => r.name && r.url),
      };

      const proposalData: MapToDetailedProposalParams = {
        creatorAddress: address,
        daoAddress: daoDetails?.address,
        daoName: daoDetails?.metadata.name,
        daoToken,
        totalVotingWeight:
          pluginType === 'token-voting.plugin.dao.eth' && tokenSupply
            ? tokenSupply.formatted
            : members.length,
        // TODO: Add multisig
        pluginSettings: pluginSettings as VotingSettings,
        proposalParams: proposalCreationData,
        proposalId,
        metadata: metadata,
      };

      const cachedProposal = mapToDetailedProposal(proposalData);
      const newCache = {
        ...cachedProposals,
        [daoDetails.address]: {
          ...cachedProposals[daoDetails.address],
          [proposalId]: {...cachedProposal},
        },
      };
      pendingProposalsVar(newCache);

      // persist new cache if functional cookies enabled
      if (preferences?.functional) {
        localStorage.setItem(
          PENDING_PROPOSALS_KEY,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedProposals,
      daoDetails,
      daoToken,
      getValues,
      members.length,
      pluginSettings,
      pluginType,
      preferences?.functional,
      proposalCreationData,
      tokenSupply,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || daoDetailsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishSettings}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposalNow')}
        buttonLabelSuccess={t('TransactionModal.launchGovernancePage')}
      />
    </>
  );
};
