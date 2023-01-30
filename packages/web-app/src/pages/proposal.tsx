import {useApolloClient} from '@apollo/client';
import {
  DaoAction,
  TokenVotingClient,
  TokenVotingProposal,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
  Tag,
  WidgetStatus,
} from '@aragon/ui-components';
import {shortenAddress} from '@aragon/ui-components/src/utils/addresses';
import {withTransaction} from '@elastic/apm-rum-react';
import TipTapLink from '@tiptap/extension-link';
import {useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {TerminalTabs, VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useProposalTransactionContext} from 'context/proposalTransaction';
import {useSpecificProvider} from 'context/providers';
import {useCache} from 'hooks/useCache';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePluginSettings} from 'hooks/usePluginSettings';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {CHAIN_METADATA} from 'utils/constants';
import {
  decodeMetadataToAction,
  decodeMintTokensToAction,
  decodePluginSettingsToAction,
  decodeWithdrawToAction,
} from 'utils/library';
import {NotFound} from 'utils/paths';
import {
  isEarlyExecutable,
  getProposalExecutionStatus,
  getProposalStatusSteps,
  getTerminalProps,
  getVoteStatusAndLabel,
  isErc20VotingProposal,
  isMultisigProposal,
} from 'utils/proposals';
import {Action} from 'utils/types';

// TODO: @Sepehr Please assign proper tags on action decoding
const PROPOSAL_TAGS = ['Finance', 'Withdraw'];

const NumberFormatter = new Intl.NumberFormat('en-US');

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {isDesktop} = useScreen();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();

  const navigate = useNavigate();
  const {id: proposalId} = useParams();

  const {data: dao} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(dao);

  const {data} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  // TODO: fix when integrating multisig
  const daoSettings = data as VotingSettings;

  const {client} = useClient();
  const {set, get} = useCache();
  const apolloClient = useApolloClient();

  const {network} = useNetwork();
  const provider = useSpecificProvider(CHAIN_METADATA[network].id);
  const {address, isConnected, isOnWrongNetwork} = useWallet();

  const [decodedActions, setDecodedActions] =
    useState<(Action | undefined)[]>();

  const {
    handleSubmitVote,
    handleExecuteProposal,
    isLoading: paramsAreLoading,
    pluginAddress,
    pluginType,
    voteSubmitted,
    executionFailed,
    transactionHash,
  } = useProposalTransactionContext();

  const {
    data: proposal,
    error: proposalError,
    isLoading: proposalIsLoading,
  } = useDaoProposal(dao, proposalId!, pluginType);

  const {data: canVote} = useWalletCanVote(
    address,
    proposalId!,
    pluginAddress,
    pluginType
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
      editor.commands.setContent(proposal.metadata.description, true);
    }
  }, [editor, proposal]);

  // decode proposal actions
  useEffect(() => {
    if (!proposal) return;

    const mintTokenActions: {
      actions: Uint8Array[];
      index: number;
    } = {actions: [], index: 0};

    const proposalErc20Token = isErc20VotingProposal(proposal)
      ? proposal.token
      : undefined;

    const actionPromises: Promise<Action | undefined>[] = proposal.actions.map(
      (action: DaoAction, index) => {
        const functionParams =
          client?.decoding.findInterface(action.data) ||
          pluginClient?.decoding.findInterface(action.data);

        switch (functionParams?.functionName) {
          case 'withdraw':
            return decodeWithdrawToAction(
              action.data,
              client,
              apolloClient,
              provider,
              network
            );
          case 'mint':
            if (mintTokenActions.actions.length === 0) {
              mintTokenActions.index = index;
            }
            mintTokenActions.actions.push(action.data);
            return Promise.resolve({} as Action);

          // TODO: switch to multisig
          // case 'addAllowedUsers':
          //   return decodeAddMembersToAction(
          //     action.data,
          //     pluginClient as AddresslistVotingClient
          //   );
          // case 'removeAllowedUsers':
          //   return decodeRemoveMembersToAction(
          //     action.data,
          //     pluginClient as AddresslistVotingClient
          //   );
          case 'updateVotingSettings':
            // TODO add multisig option here or inside decoder
            return decodePluginSettingsToAction(
              action.data,
              pluginClient as TokenVotingClient,
              (proposal as TokenVotingProposal).totalVotingWeight as bigint,
              proposalErc20Token
            );
          case 'setMetadata':
            return decodeMetadataToAction(action.data, client);
          default:
            return Promise.resolve({} as Action);
        }
      }
    );

    if (proposalErc20Token && mintTokenActions.actions.length !== 0) {
      // Decode all the mint actions into one action with several addresses
      const decodedMintToken = decodeMintTokensToAction(
        mintTokenActions.actions,
        pluginClient as TokenVotingClient,
        proposalErc20Token.address,
        provider,
        network
      );

      // splice them back to the actions array with all the other actions
      actionPromises.splice(
        mintTokenActions.index,
        mintTokenActions.actions.length,
        decodedMintToken
      );
    }

    Promise.all(actionPromises).then(value => {
      setDecodedActions(value);
    });
  }, [apolloClient, client, network, pluginClient, proposal, provider]);

  // caches the status for breadcrumb
  useEffect(() => {
    if (proposal && proposal.status !== get('proposalStatus'))
      set('proposalStatus', proposal.status);
  }, [get, proposal, set]);

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
    if (voteSubmitted) {
      setTerminalTab('voters');
      setVotingInProcess(false);
    }
  }, [voteSubmitted]);

  // terminal props
  const mappedProps = useMemo(() => {
    if (proposal) return getTerminalProps(t, proposal, address);
  }, [address, proposal, t]);

  // get early execution status
  const canExecuteEarly = useMemo(
    () =>
      isEarlyExecutable(
        mappedProps?.missingParticipation,
        proposal,
        mappedProps?.results,
        daoSettings.votingMode
      ),
    [
      daoSettings?.votingMode,
      proposal,
      mappedProps?.missingParticipation,
      mappedProps?.results,
    ]
  );

  // proposal execution status
  const executionStatus = useMemo(
    () =>
      getProposalExecutionStatus(
        proposal?.status,
        canExecuteEarly,
        executionFailed
      ),
    [canExecuteEarly, executionFailed, proposal?.status]
  );

  // whether current user has voted
  const voted = useMemo(() => {
    // TODO: updated with multisig
    if (isMultisigProposal(proposal)) return false;

    return address &&
      proposal?.votes.some(
        voter =>
          voter.address.toLowerCase() === address.toLowerCase() &&
          voter.vote !== undefined
      )
      ? true
      : false;
  }, [address, proposal]);

  // vote button and status
  const [voteStatus, buttonLabel] = useMemo(() => {
    const earlyExecution =
      daoSettings.votingMode === VotingMode.EARLY_EXECUTION;
    return proposal
      ? getVoteStatusAndLabel(proposal, voted, canVote, earlyExecution, t)
      : ['', ''];
  }, [daoSettings.votingMode, proposal, voted, canVote, t]);

  // vote button state and handler
  const {voteNowDisabled, onClick} = useMemo(() => {
    if (proposal?.status !== 'Active') return {voteNowDisabled: true};

    // not logged in
    if (!address) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('wallet');
          statusRef.current.wasNotLoggedIn = true;
        },
      };
    }

    // wrong network
    else if (isOnWrongNetwork) {
      return {
        voteNowDisabled: false,
        onClick: () => {
          open('network');
          statusRef.current.wasOnWrongNetwork = true;
        },
      };
    }

    // member, not yet voted
    else if (canVote) {
      return {
        voteNowDisabled: false,
        onClick: () => setVotingInProcess(true),
      };
    } else return {voteNowDisabled: true};
  }, [address, canVote, isOnWrongNetwork, open, proposal?.status]);

  // alert message, only shown when not eligible to vote
  const alertMessage = useMemo(() => {
    if (
      proposal &&
      proposal.status === 'Active' &&
      address &&
      !isOnWrongNetwork &&
      !canVote
    ) {
      // presence of token delineates token voting proposal
      // people add types to these things!!
      return isErc20VotingProposal(proposal)
        ? t('votingTerminal.status.ineligibleTokenBased', {
            token: proposal.token.name,
          })
        : t('votingTerminal.status.ineligibleWhitelist');
    }
  }, [address, canVote, isOnWrongNetwork, proposal, t]);

  // status steps for proposal
  const proposalSteps = useMemo(() => {
    // TODO: add multisig option
    if (isMultisigProposal(proposal)) return [];

    if (
      proposal?.status &&
      proposal?.startDate &&
      proposal?.endDate &&
      proposal?.creationDate
    ) {
      return getProposalStatusSteps(
        proposal.status,
        proposal.startDate,
        proposal.endDate,
        proposal.creationDate,
        NumberFormatter.format(proposal.creationBlockNumber),
        executionFailed,
        NumberFormatter.format(proposal.executionBlockNumber),
        proposal.executionDate
      );
    } else return [];
  }, [proposal, executionFailed]);

  /*************************************************
   *                     Render                    *
   *************************************************/
  if (proposalError) {
    navigate(NotFound, {replace: true, state: {invalidProposal: proposalId}});
  }

  if (paramsAreLoading || proposalIsLoading || detailsAreLoading || !proposal) {
    return <Loading />;
  }

  return (
    <Container>
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(generatePath(path, {network, dao}))
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{proposal?.metadata.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {PROPOSAL_TAGS.map((tag: string) => (
              <Tag label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                proposal?.creatorAddress.toLowerCase() ===
                address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(proposal?.creatorAddress || '')
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${proposal?.creatorAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{proposal?.metadata.summary}</SummaryText>
        {proposal.metadata.description && !expandedProposal && (
          <ButtonText
            className="w-full tablet:w-max"
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
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          <VotingTerminal
            statusLabel={voteStatus}
            selectedTab={terminalTab}
            alertMessage={alertMessage}
            onTabSelected={setTerminalTab}
            onVoteClicked={onClick}
            onCancelClicked={() => setVotingInProcess(false)}
            voteButtonLabel={buttonLabel}
            voteNowDisabled={voteNowDisabled}
            votingInProcess={votingInProcess}
            onVoteSubmitClicked={vote =>
              handleSubmitVote(
                vote,
                (proposal as TokenVotingProposal).token?.address
              )
            }
            {...mappedProps}
          />

          <ExecutionWidget
            actions={decodedActions}
            status={executionStatus}
            onExecuteClicked={handleExecuteProposal}
            txhash={transactionHash}
          />
        </ProposalContainer>
        <AdditionalInfoContainer>
          <ResourceList links={proposal?.metadata.resources} />
          <WidgetStatus steps={proposalSteps} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Container>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-2 desktop:col-end-12',
})``;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-col gap-y-2 desktop:p-0 px-2 tablet:px-3 pt-2',
})``;

const ProposalTitle = styled.p.attrs({
  className: 'font-bold text-ui-800 text-3xl',
})``;

const ContentWrapper = styled.div.attrs({
  className: 'flex flex-col tablet:flex-row gap-x-3 gap-y-1.5',
})``;

const BadgeContainer = styled.div.attrs({
  className: 'flex flex-wrap gap-x-1.5',
})``;

const ProposerLink = styled.p.attrs({
  className: 'text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

type ContentContainerProps = {
  expandedProposal: boolean;
};

const ContentContainer = styled.div.attrs(
  ({expandedProposal}: ContentContainerProps) => ({
    className: `${
      expandedProposal ? 'tablet:mt-5' : 'tablet:mt-8'
    } mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0`,
  })
)<ContentContainerProps>``;
