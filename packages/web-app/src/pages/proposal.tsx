import {
  Badge,
  Breadcrumb,
  ButtonText,
  IconChevronDown,
  IconChevronUp,
  IconGovernance,
  Link,
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

import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {StyledEditorContent} from 'containers/reviewProposal';
import {VotingTerminal} from 'containers/votingTerminal';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useCache} from 'hooks/useCache';
import {useDaoParam} from 'hooks/useDaoParam';
import {DisplayedVoter, useDaoProposal} from 'hooks/useDaoProposal';
import {useMappedBreadcrumbs} from 'hooks/useMappedBreadcrumbs';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {useWalletCanVote} from 'hooks/useWalletCanVote';
import {CHAIN_METADATA} from 'utils/constants';
import {NotFound} from 'utils/paths';
import {formatDistance} from 'date-fns';
import {ExecutionWidget} from 'components/executionWidget';

export type ExecutionStatus =
  | 'defeated'
  | 'executed'
  | 'executable'
  | 'executable-failed'
  | 'default';

const Proposal: React.FC = () => {
  const {t} = useTranslation();
  const {id} = useParams();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {set, get} = useCache();
  const {isDesktop} = useScreen();
  const {open} = useGlobalModalContext();
  const {data: daoId} = useDaoParam();
  const {breadcrumbs, tag} = useMappedBreadcrumbs();

  const {address, isConnected, isOnWrongNetwork} = useWallet();
  const {data: canVote, isLoading: canVoteLoading} = useWalletCanVote(
    daoId,
    address!
  );

  if (!id) navigate(NotFound);

  // ref used to hold "memories" of previous "state"
  // across renders in order to automate the following states:
  // loggedOut -> login modal => switch network modal -> vote options selection;
  const statusRef = useRef({wasNotLoggedIn: false, wasOnWrongNetwork: false});

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [metadata, setMetadata] = useState<Record<string, any> | undefined>();
  const [expandedProposal, setExpandedProposal] = useState(false);

  // voting
  const [votingInProcess, setVotingInProcess] = useState(false);

  const {
    data: {
      mappedProposal,
      proposalSteps,
      creator,
      proposalTags,
      proposalContent,
    },
    isLoading: proposalIsLoading,
    error,
  } = useDaoProposal(id);

  const editor = useEditor({
    editable: false,
    content: proposalContent,
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
  useEffect(() => {
    // uncomment when integrating with sdk
    // if (!proposalLoading && proposalData) {
    //   setMetadata(JSON.parse(proposalData.erc20VotingProposals[0].metadata));
    // editor?.commands.setContent(metadata?.proposal, true);
    // }
    setMetadata({
      title: 'Create new Pets United Sub DAO',
      summary: "We're creating a new DAO to manage pets and their owners.",
      proposal: proposalContent,
    });
  }, [proposalContent]);

  // caches the status for breadcrumb
  useEffect(() => {
    const proposalStatus = get('proposalStatus');

    if (mappedProposal && mappedProposal.status !== proposalStatus)
      set('proposalStatus', mappedProposal.status);
  }, [get, mappedProposal, set]);

  useEffect(() => {
    // was not logged in but now logged in
    if (statusRef.current.wasNotLoggedIn && isConnected) {
      if (isOnWrongNetwork) {
        open('network');
      }

      // logged out is technically on wrong network
      statusRef.current.wasOnWrongNetwork = true;

      // reset reference
      statusRef.current.wasNotLoggedIn = false;
    }
  }, [isConnected, canVote, isOnWrongNetwork, open]);

  useEffect(() => {
    // wrong network, no wallet -> no options
    if (isOnWrongNetwork || !address || !canVote) setVotingInProcess(false);

    // was on wrong network but now on correct network
    if (statusRef.current.wasOnWrongNetwork && !isOnWrongNetwork) {
      if (canVote) setVotingInProcess(true);

      // reset "state"
      statusRef.current.wasOnWrongNetwork = false;
    }
  }, [address, canVote, isOnWrongNetwork]);

  // Note: this can also be extracted into the useProposal hook granted we want to give
  // it all the responsibility for data mapping, despite proposal not necessarily having
  // much to do with whether vote button is enabled. Would probably be good clean up of the
  // current component.

  const [
    voteNowDisabled,
    statusLabel,
    alertMessage,
    executionStatus,
    handleVoteClicked,
  ] = useMemo(() => {
    let voteNowDisabled = true;
    let onClick;
    let statusLabel = '';
    let alertMessage = '';
    let executionStatus: ExecutionStatus = 'default';

    const voted = mappedProposal?.voters.some(
      (voter: DisplayedVoter) => voter.wallet === address
    );

    switch (mappedProposal?.status) {
      // not sure how we'll be handling draft proposals so until then, keeping this
      case 'draft':
        statusLabel = t('votingTerminal.status.draft');
        break;

      case 'pending':
        statusLabel = t('votingTerminal.status.pending', {
          startDate: formatDistance(
            new Date(mappedProposal.startDate),
            new Date()
          ),
        });
        break;

      case 'succeeded':
        statusLabel = t('votingTerminal.status.succeeded');
        executionStatus = 'executable';
        break;

      case 'executed':
        statusLabel = t('votingTerminal.status.succeeded');

        // TODO: add cases for failed execution
        // executionStatus = 'executable-failed';

        executionStatus = 'executed';
        break;

      case 'defeated':
        statusLabel = t('votingTerminal.status.defeated');
        executionStatus = 'defeated';
        break;

      case 'active': {
        statusLabel = t('votingTerminal.status.active', {
          endDate: formatDistance(new Date(), new Date(mappedProposal.endDate)),
        });

        // member not yet voted
        if (address && !isOnWrongNetwork && canVote) {
          voteNowDisabled = false;
          onClick = () => {
            setVotingInProcess(true);
          };
        }

        // already voted
        else if (canVote && voted) {
          statusLabel = t('votingTerminal.status.voted') + statusLabel;
        }

        // not a member
        else if (address && !isOnWrongNetwork && !canVote) {
          alertMessage = mappedProposal.token
            ? t('votingTerminal.status.ineligibleTokenBased', {
                token: mappedProposal.token.name,
              })
            : t('votingTerminal.status.ineligibleWhitelist');
        }

        // wrong network
        else if (address && isOnWrongNetwork) {
          voteNowDisabled = false;

          onClick = () => {
            open('network');
            statusRef.current.wasOnWrongNetwork = true;
          };
        }

        // not logged in
        else {
          voteNowDisabled = false;

          onClick = () => {
            open('wallet');
            statusRef.current.wasNotLoggedIn = true;
          };
        }
        break;
      }
    }

    return [
      voteNowDisabled,
      statusLabel,
      alertMessage,
      executionStatus,
      onClick,
    ];
  }, [
    address,
    canVote,
    isOnWrongNetwork,
    mappedProposal?.endDate,
    mappedProposal?.startDate,
    mappedProposal?.status,
    mappedProposal?.token,
    mappedProposal?.voters,
    open,
    t,
  ]);

  /*************************************************
   *                    Render                    *
   *************************************************/
  if (proposalIsLoading) {
    return <Loading />;
  }

  if (error) {
    return <p>Error. Check console</p>;
  }

  if (!editor) {
    return null;
  }

  return (
    <Container>
      {/* Proposal Header */}
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={(path: string) =>
              navigate(generatePath(path, {network, daoId}))
            }
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
            tag={tag}
          />
        )}
        <ProposalTitle>{metadata?.title}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {proposalTags.map((tag: string) => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={
                creator === address?.toLowerCase()
                  ? t('labels.you')
                  : shortenAddress(creator)
              }
              href={`${CHAIN_METADATA[network].explorer}/address/${creator}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>{metadata?.summary}</SummaryText>

        {metadata?.proposal && !expandedProposal && (
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
          {metadata?.proposal && expandedProposal && (
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

          {mappedProposal && !canVoteLoading && (
            <VotingTerminal
              {...mappedProposal}
              votingInProcess={votingInProcess}
              onCancelClicked={() => setVotingInProcess(false)}
              onVoteClicked={handleVoteClicked}
              voteNowDisabled={voteNowDisabled}
              statusLabel={statusLabel}
              alertMessage={alertMessage}
            />
          )}

          <ExecutionWidget status={executionStatus} />
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList links={[]} />
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
