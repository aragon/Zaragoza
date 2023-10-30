import {
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  WidgetStatus,
} from '@aragon/ods-old';
import {
  MultisigClient,
  MultisigProposal,
  TokenVotingClient,
  TokenVotingProposal,
  VotingMode,
} from '@aragon/sdk-client';
import {DaoAction, ProposalStatus} from '@aragon/sdk-client-common';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {BigNumber, constants} from 'ethers';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import sanitizeHtml from 'sanitize-html';
import styled from 'styled-components';
import {Address} from 'viem';
import {useBalance} from 'wagmi';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {UpdateVerificationCard} from 'containers/updateVerificationCard';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useProviders} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoToken} from 'hooks/useDaoToken';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {usePastVotingPower} from 'services/aragon-sdk/queries/use-past-voting-power';
import {useProposal} from 'services/aragon-sdk/queries/use-proposal';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  useVotingSettings,
} from 'services/aragon-sdk/queries/use-voting-settings';
import {useTokenAsync} from 'services/token/queries/use-token';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {featureFlags} from 'utils/featureFlags';
import {
  decodeAddMembersToAction,
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodeMultisigSettingsToAction,
  decodePluginSettingsToAction,
  decodeRemoveMembersToAction,
  decodeToExternalAction,
  decodeWithdrawToAction,
  shortenAddress,
  toDisplayEns,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  getLiveProposalTerminalProps,
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getVoteButtonLabel,
  getVoteStatus,
  isEarlyExecutable,
  isErc20VotingProposal,
  isMultisigProposal,
} from 'utils/proposals';
import {Action} from 'utils/types';

const PENDING_PROPOSAL_STATUS_INTERVAL = 1000 * 10;
const PROPOSAL_STATUS_INTERVAL = 1000 * 60;
const NumberFormatter = new Intl.NumberFormat('en-US');

export const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();
  const navigate = useNavigate();
  const fetchToken = useTokenAsync();

  const {dao, id: proposalId} = useParams();

  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetailsQuery();
  const pluginAddress = daoDetails?.plugins?.[0]?.instanceAddress as string;
  const pluginType = daoDetails?.plugins?.[0]?.id as PluginTypes;
  const isMultisigPlugin = pluginType === 'multisig.plugin.dao.eth';
  const isTokenVotingPlugin = pluginType === 'token-voting.plugin.dao.eth';

  const {data: daoToken} = useDaoToken(pluginAddress);

  const {
    data: {members},
  } = useDaoMembers(pluginAddress, pluginType, {
    enabled: isMultisigPlugin,
  });

  const {client} = useClient();
  const {set, get} = useCache();

  const {network} = useNetwork();
  const {api: provider} = useProviders();
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [voteStatus, setVoteStatus] = useState('');
  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handlePrepareVote,
    handlePrepareApproval,
    handlePrepareExecution,
    isLoading: paramsAreLoading,
    voteOrApprovalSubmitted,
    executionFailed,
    executionTxHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isFetched: proposalIsFetched,
    isLoading: proposalIsLoading,
    refetch,
  } = useProposal(
    {
      pluginType: pluginType,
      id: proposalId ?? '',
    },
    {
      enabled: !!proposalId,

      // refetch active proposal data every minute
      refetchInterval: data =>
        data?.status === ProposalStatus.ACTIVE
          ? PROPOSAL_STATUS_INTERVAL
          : false,
    }
  );

  const {data: votingSettings} = useVotingSettings(
    {
      pluginAddress,
      pluginType,
      blockNumber: proposal?.creationBlockNumber,
    },
    {enabled: !!proposal?.creationBlockNumber}
  );

  const proposalStatus = proposal?.status;

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType,
    proposalStatus as string
  );

  const {data: tokenBalanceData} = useBalance({
    address: address as Address,
    token: daoToken?.address as Address,
    chainId: CHAIN_METADATA[network as SupportedNetworks].id,
    enabled: address != null && daoToken != null,
  });
  const tokenBalance = BigNumber.from(tokenBalanceData?.value ?? 0);

  const {data: pastVotingPower = constants.Zero} = usePastVotingPower(
    {
      address: address as string,
      tokenAddress: daoToken?.address as string,
      blockNumber: proposal?.creationBlockNumber as number,
    },
    {enabled: address != null && daoToken != null && proposal != null}
  );

  const pluginClient = usePluginClient(pluginType);

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // voting
  const [terminalTab, setTerminalTab] = useState<TerminalTabs>('info');
  const [votingInProcess, setVotingInProcess] = useState(false);
  const [expandedProposal, setExpandedProposal] = useState(false);

  // Display the voting-power gating dialog when user has balance but delegated
  // his token to someone else
  const shouldDisplayDelegationVoteGating =
    !isMultisigPlugin &&
    tokenBalance.gt(constants.Zero) &&
    pastVotingPower.lte(constants.Zero);

  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  /*************************************************
   *                     Hooks                     *
   *************************************************/

  // set editor data
  useEffect(() => {
    if (proposal && editor) {
      editor.commands.setContent(
        // Default list of allowed tags and attributes - https://www.npmjs.com/package/sanitize-html#default-options
        sanitizeHtml(proposal.metadata.description, {
          // the disallowedTagsMode displays the disallowed tags to be rendered as a string
          disallowedTagsMode: 'recursiveEscape',
        }),
        true
      );
    }
  }, [editor, proposal]);

  useEffect(() => {
    if (proposalStatus) {
      setTerminalTab(
        proposalStatus === ProposalStatus.PENDING ? 'info' : 'breakdown'
      );
    }
  }, [proposalStatus]);

  // decode proposal actions
  useEffect(() => {
    if (!proposal) return;

    let mintTokenActionsIndex = 0;
    const mintTokenActionsData: Uint8Array[] = [];
    const proposalErc20Token = isErc20VotingProposal(proposal)
      ? proposal.token
      : undefined;

    const multisigClient = pluginClient as MultisigClient;
    const tokenVotingClient = pluginClient as TokenVotingClient;

    const getAction = async (action: DaoAction, index: number) => {
      const functionParams =
        client?.decoding.findInterface(action.data) ||
        pluginClient?.decoding.findInterface(action.data);

      switch (functionParams?.functionName) {
        case 'transfer':
          return decodeWithdrawToAction(
            action.data,
            client,
            provider,
            network,
            action.to,
            action.value,
            fetchToken
          );
        case 'mint':
          if (mintTokenActionsData.length === 0) mintTokenActionsIndex = index;
          mintTokenActionsData.push(action.data);
          return;
        case 'addAddresses':
          return decodeAddMembersToAction(action.data, multisigClient);
        case 'removeAddresses':
          return decodeRemoveMembersToAction(action.data, multisigClient);
        case 'updateVotingSettings':
          return decodePluginSettingsToAction(
            action.data,
            tokenVotingClient,
            (proposal as TokenVotingProposal).totalVotingWeight as bigint,
            proposalErc20Token
          );
        case 'updateMultisigSettings':
          return decodeMultisigSettingsToAction(action.data, multisigClient);
        case 'setMetadata':
          return decodeMetadataToAction(action.data, client);
        default: {
          try {
            const decodedAction = await decodeWithdrawToAction(
              action.data,
              client,
              provider,
              network,
              action.to,
              action.value,
              fetchToken
            );

            // assume that the action is a valid native withdraw
            // if the token name is the same as the chain native token
            if (
              decodedAction?.tokenName.toLowerCase() ===
              CHAIN_METADATA[network].nativeCurrency.name.toLowerCase()
            ) {
              return decodedAction;
            }
          } catch (error) {
            console.warn(
              'decodeWithdrawToAction failed, trying decodeToExternalAction'
            );

            return decodeToExternalAction(
              action,
              proposal.dao.address,
              network,
              t
            );
          }
        }
      }
    };

    const processActions = async () => {
      const actionPromises: Promise<Action | undefined>[] =
        proposal.actions.map(getAction);

      // decode mint tokens actions with all the addresses together
      if (proposalErc20Token && mintTokenActionsData.length !== 0) {
        const decodedMintToken = decodeMintTokensToAction(
          mintTokenActionsData,
          pluginClient as TokenVotingClient,
          proposalErc20Token.address,
          (proposal as TokenVotingProposal).totalVotingWeight,
          provider,
          network
        );

        actionPromises[mintTokenActionsIndex] =
          Promise.resolve(decodedMintToken);
      }

      const results = await Promise.all(actionPromises);
      setDecodedActions(results);
    };

    processActions();
  }, [client, network, pluginClient, proposal, provider, fetchToken, t]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposalStatus !== get('proposalStatus'))
      set('proposalStatus', proposalStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proposalStatus]);

  // handle can vote and wallet connection status
  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      // reset ref
      statusRef.current.wasNotLoggedIn = false;

      // logged out technically wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // throw network modal
      if (isOnWrongNetwork) {
        open('network');
      }
    }
  }, [isConnected, isOnWrongNetwork, open]);

  useEffect(() => {
    // all conditions unmet close voting in process
    if (isOnWrongNetwork || !isConnected || !canVote) {
      setVotingInProcess(false);
    }

    // was on the wrong network but now on the right one
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      // reset ref
      statusRef.current.wasOnWrongNetwork = false;

      // show voting in process
      if (canVote) setVotingInProcess(true);
    }
  }, [
    canVote,
    isConnected,
    isOnWrongNetwork,
    statusRef.current.wasOnWrongNetwork,
  ]);

  // show voter tab once user has voted
  useEffect(() => {
    if (voteOrApprovalSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteOrApprovalSubmitted]);

  useEffect(() => {
    if (proposal) {
      // set the very first time
      setVoteStatus(getVoteStatus(proposal, t));

      const interval = setInterval(async () => {
        const v = getVoteStatus(proposal, t);

        // remove interval timer once the proposal has started
        if (proposal.startDate.valueOf() <= new Date().valueOf()) {
          clearInterval(interval);
          setVoteStatus(v);
          if (proposalStatus === ProposalStatus.PENDING) {
            refetch();
          }
        } else if (proposalStatus === ProposalStatus.PENDING) {
          setVoteStatus(v);
        }
      }, PENDING_PROPOSAL_STATUS_INTERVAL);

      return () => clearInterval(interval);
    }
  }, [proposal, proposalStatus, refetch, t]);

  /*************************************************
   *              Handlers and Callbacks           *
   *************************************************/
  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal && votingSettings)
      return getLiveProposalTerminalProps(
        t,
        proposal,
        address,
        votingSettings,
        isMultisigProposal(proposal) ? members : undefined
      );
  }, [address, votingSettings, members, proposal, t]);

  // get early execution status
  let canExecuteEarly = false;

  if (proposal && mappedProps) {
    if (isTokenVotingSettings(votingSettings)) {
      canExecuteEarly = isEarlyExecutable(
        mappedProps?.missingParticipation,
        proposal,
        mappedProps?.results,
        votingSettings.votingMode
      );
    } else if (isMultisigVotingSettings(votingSettings)) {
      canExecuteEarly =
        (proposal as MultisigProposal)?.approvals?.length >=
        votingSettings.minApprovals;
    }
  }

  // proposal execution status
  const executionStatus = getProposalExecutionStatus(
    proposalStatus,
    canExecuteEarly,
    executionFailed
  );

  // whether current user has voted
  let voted = false;

  if (address == null || proposal == null) {
    voted = false;
  } else if (isMultisigProposal(proposal)) {
    voted = proposal.approvals.some(
      a => a.toLowerCase() === address.toLowerCase()
    );
  } else {
    voted = proposal.votes.some(
      voter =>
        voter.address.toLowerCase() === address.toLowerCase() &&
        voter.vote != null
    );
  }

  // multisig proposal must have at least one action to trigger
  // approve and execute flow
  const executableWithNextApproval =
    isMultisigProposal(proposal) &&
    (proposal.status === ProposalStatus.PENDING ||
      proposal.status === ProposalStatus.ACTIVE) &&
    voted === false &&
    isMultisigVotingSettings(votingSettings) &&
    proposal.actions.length > 0 &&
    proposal.approvals.length + 1 >= votingSettings.minApprovals;

  // vote button label
  let voteButtonLabel = '';
  if (proposal && votingSettings) {
    voteButtonLabel = getVoteButtonLabel(
      proposal,
      votingSettings,
      voted,
      executableWithNextApproval,
      t
    );
  }

  // vote button status
  const canRevote =
    isTokenVotingSettings(votingSettings) &&
    votingSettings.votingMode === VotingMode.VOTE_REPLACEMENT;

  // this tracks whether the voting button should be enabled
  const enableVotingButton =
    proposal?.status === ProposalStatus.ACTIVE && // active proposal
    (address == null || // wallet disconnected
      (voted === false && canVote === true) || // haven't voted and can vote
      (isTokenVotingPlugin && voted && canRevote === true) || // voted but vote replacement enabled
      // can vote but no voting power (voted should status should never be true if shouldDisplayDelegationVotingGating)
      (voted === false && shouldDisplayDelegationVoteGating === true));

  const handleApprovalClick = useCallback(
    (tryExecution: boolean) => {
      if (address == null) {
        open('wallet');
        statusRef.current.wasNotLoggedIn = true;
      } else if (isOnWrongNetwork) {
        open('network');
        statusRef.current.wasOnWrongNetwork = true;
      } else if (canVote && proposal?.id) {
        handlePrepareApproval({tryExecution, proposalId: proposal.id});
      }
    },
    [
      address,
      canVote,
      handlePrepareApproval,
      isOnWrongNetwork,
      open,
      proposal?.id,
    ]
  );

  const handleVoteClick = useCallback(() => {
    if (address == null) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      open('network');
      statusRef.current.wasOnWrongNetwork = true;
    } else if (shouldDisplayDelegationVoteGating) {
      return open('delegationGating');
    } else if (canVote) {
      setVotingInProcess(true);
    }
  }, [
    address,
    canVote,
    shouldDisplayDelegationVoteGating,
    isOnWrongNetwork,
    open,
  ]);

  // handler for execution
  const handleExecuteNowClicked = () => {
    if (!address) {
      open('wallet');
      statusRef.current.wasNotLoggedIn = true;
    } else if (isOnWrongNetwork) {
      // don't allow execution on wrong network
      open('network');
    } else {
      handlePrepareExecution();
    }
  };

  // alert message, only shown when not eligible to vote
  let alertMessage = '';
  if (
    proposal &&
    proposal.status === 'Active' && // active proposal
    address && // logged in
    isOnWrongNetwork === false && // on proper network
    voted === false && // haven't voted
    canVote === false && // cannot vote
    shouldDisplayDelegationVoteGating === false // user delegated tokens
  ) {
    // presence of token delineates token voting proposal
    alertMessage = isErc20VotingProposal(proposal)
      ? t('votingTerminal.status.ineligibleTokenBased', {
          token: proposal.token.name,
        })
      : t('votingTerminal.status.ineligibleWhitelist');
  }

  // status steps for proposal
  const proposalSteps = proposal
    ? getProposalStatusSteps(
        t,
        proposal.status,
        pluginType,
        proposal.startDate,
        proposal.endDate,
        proposal.creationDate,
        proposal.creationBlockNumber
          ? NumberFormatter.format(proposal.creationBlockNumber)
          : '',
        executionFailed,
        proposal.executionBlockNumber
          ? NumberFormatter.format(proposal.executionBlockNumber!)
          : '',
        proposal.executionDate ?? undefined
      )
    : [];

  /*************************************************
   *                     Render                    *
   *************************************************/
  const isLoading = paramsAreLoading || proposalIsLoading || detailsAreLoading;

  // the last check is to make sure Typescript narrows the type properly
  const hasInvalidProposal =
    proposalError || (proposalIsFetched && !proposal) || proposal == null;

  if (isLoading) {
    return <Loading />;
  }

  if (hasInvalidProposal) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
    return null;
  }

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(
                generatePath(path, {
                  network,
                  dao: toDisplayEns(daoDetails?.ensDomain) || dao,
                })
              )
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal.metadata.title}</ProposalTitle>
        <ContentWrapper>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal.creatorAddress.toLowerCase() === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal.creatorAddress)
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creatorAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal.metadata.summary}</SummaryText>
        {proposal.metadata.description && !expandedProposal && (
          <ButtonText
            className="w-full md:w-max"
            size="large"
            label={t('governance.proposals.buttons.readFullProposal')}
            mode="secondary"
            iconRight={<IconChevronDown />}
            onClick={() => setExpandedProposal(true)}
          />
        )}
      </HeaderContainer>

      <ContentContainer expandedProposal={expandedProposal}>
        <ProposalContainer>
          {proposal.metadata.description && expandedProposal && (
            <>
              <StyledEditorContent editor={editor} />
              <ButtonText
                className="mt-6 w-full md:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          {/* @todo: Add isUpdateProposal check once it's developed */}
          {proposal &&
            featureFlags.getValue('VITE_FEATURE_FLAG_OSX_UPDATES') ===
              'true' && (
              <UpdateVerificationCard
                proposal={proposal}
                actions={decodedActions}
                proposalId={proposalId}
              />
            )}

          {votingSettings && (
            <VotingTerminal
              status={proposalStatus}
              pluginType={pluginType}
              daoToken={daoToken}
              blockNumber={proposal.creationBlockNumber}
              statusLabel={voteStatus}
              selectedTab={terminalTab}
              alertMessage={alertMessage}
              onTabSelected={setTerminalTab}
              onVoteClicked={handleVoteClick}
              onApprovalClicked={handleApprovalClick}
              onCancelClicked={() => setVotingInProcess(false)}
              voteButtonLabel={voteButtonLabel}
              voteNowDisabled={!enableVotingButton}
              votingInProcess={votingInProcess}
              executableWithNextApproval={executableWithNextApproval}
              onVoteSubmitClicked={vote =>
                handlePrepareVote({
                  vote,
                  replacement: voted || voteOrApprovalSubmitted,
                  voteTokenAddress: (proposal as TokenVotingProposal).token
                    ?.address,
                })
              }
              {...mappedProps}
            />
          )}

          <ExecutionWidget
            pluginType={pluginType}
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteNowClicked}
            txhash={executionTxHash || proposal.executionTxHash || undefined}
          />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal.metadata.resources} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

const Container = styled.div.attrs({
  className: 'col-span-full xl:col-start-2 xl:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-4 xl:p-0 md:px-6 pt-4',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-semibold text-neutral-800 text-4xl leading-tight',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col md:flex-row gap-x-6 gap-y-3',
})``;

// const BadgeContainer = styled.div.attrs({
//   className: 'flex flex-wrap gap-x-3',
// })``;

const ProposerLink = styled.p.attrs({
  className: 'text-neutral-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-xl leading-normal text-neutral-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-6 md:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-6 md:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs<ContentContainerProps>(
  ({expandedProposal}) => ({
    className: `${
      expandedProposal ? 'md:mt-10' : 'md:mt-16'
    } mt-6 md:flex md:space-x-6 space-y-6 md:space-y-0`,
  })
)<ContentContainerProps>``;
