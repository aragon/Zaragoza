import {
  Badge,
  Breadcrumb,
  ButtonText,
  CardExecution,
  IconChevronDown,
  IconGovernance,
  IconChevronUp,
  Link,
  ProgressStatusProps,
  WidgetStatus,
} from '@aragon/ui-components';
import styled from 'styled-components';
import useScreen from 'hooks/useScreen';
import useBreadcrumbs from 'use-react-router-breadcrumbs';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {useNavigate, useParams} from 'react-router-dom';
import React, {useMemo, useState} from 'react';

import * as paths from 'utils/paths';
import ResourceList from 'components/resourceList';
import {VotingTerminal} from 'containers/votingTerminal';

// TODO: This is just some mock data. Remove this while integration
const publishedDone: ProgressStatusProps = {
  label: 'Published',
  mode: 'done',
  date: '2021/11/16 4:30 PM UTC+2',
  block: '132,123,231',
};

const stepDataRunning: ProgressStatusProps[] = [
  publishedDone,
  {
    label: 'Running',
    date: '2021/11/16 4:30 PM UTC+2',
    mode: 'active',
  },
];

const proposalTags = ['Finance', 'Withdraw'];
//////////////////////////////////////////////////////////////////////

const Proposal: React.FC = () => {
  const [expandedProposal, setExpandedProposal] = useState(false);
  const {t} = useTranslation();
  const {id} = useParams();
  const navigate = useNavigate();
  const {isDesktop} = useScreen();

  const publisher = useMemo(() => {
    // if (publisherAddress === account) return 'you';
    // return shortenAddress(publisherAddress);
    return 'you';
  }, []);

  if (!id) {
    navigate(paths.NotFound);
  }

  const breadcrumbs = useBreadcrumbs(undefined, {
    excludePaths: [paths.Dashboard, paths.NotFound, 'governance/proposals'],
  }).map(item => ({
    path: item.match.pathname,
    label: item.breadcrumb as string,
  }));

  return (
    <Content>
      {/* Proposal Header */}
      <HeaderContainer>
        {!isDesktop && (
          <Breadcrumb
            onClick={navigate}
            crumbs={breadcrumbs}
            icon={<IconGovernance />}
          />
        )}
        <ProposalTitle>Proposal {id}</ProposalTitle>
        <ContentWrapper>
          <BadgeContainer>
            {proposalTags.map(tag => (
              <Badge label={tag} key={tag} />
            ))}
          </BadgeContainer>
          <ProposerLink>
            {t('governance.proposals.publishedBy')}{' '}
            <Link
              external
              label={publisher}
              // href={`${explorers[chainId]}${publisherAddress}`}
            />
          </ProposerLink>
        </ContentWrapper>
        <SummaryText>
          As most community members know, Aragon has strived to deploy its
          products to more cost-efficient blockchain networks to facilitate more
          adoption. Since Aragon is building products on Arbitrum which will use
          Aragon Court, it seems to be a natural chain of choice for L2
          deployment.
        </SummaryText>

        {!expandedProposal && (
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
          {/* TODO: Render content using Tiptap https://tiptap.dev/guide/output#option-1-read-only-instance-of-tiptap */}
          {expandedProposal && (
            <>
              <h2 className="text-xl">Second level title</h2>
              <p className="mt-1.5">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nec
                laoreet urna. Mauris eu vestibulum urna, vel lacinia velit.
                Quisque hendrerit mi libero, quis sollicitudin magna porta
                commodo. Sed ornare lacus ut leo rutrum, eu hendrerit massa
                gravida. Maecenas vehicula dolor sed ante sagittis egestas.{' '}
                <br />
                Duis et tortor id enim ullamcorper bibendum eget sed dolor.
                <br />
                Unordered list #1
                <br />
                Unordered list #2 and so on Lorem ipsum dolor sit amet,
                consectetur adipiscing elit. Sed nec laoreet urna. Mauris eu
                vestibulum urna, vel lacinia velit. Quisque hendrerit mi libero,
                quis sollicitudin magna porta commodo. Sed ornare lacus ut leo
                rutrum, eu hendrerit massa gravida. Maecenas vehicula dolor sed
                ante sagittis egestas. Duis et tortor id enim ullamcorper
                bibendum eget sed dolor.
              </p>
              <ButtonText
                className="mt-3 w-full tablet:w-max"
                label={t('governance.proposals.buttons.closeFullProposal')}
                mode="secondary"
                iconRight={<IconChevronUp />}
                onClick={() => setExpandedProposal(false)}
              />
            </>
          )}

          <VotingTerminal />

          <CardExecution
            title="Execution"
            description="These smart actions are executed when the proposal reaches sufficient support. Find out which actions are executed."
            to="Patito DAO"
            from="0x3430008404144CD5000005A44B8ac3f4DB2a3434"
            toLabel="To"
            fromLabel="From"
            tokenName="DAI"
            tokenImageUrl="https://s2.coinmarketcap.com/static/img/coins/64x64/4943.png"
            tokenSymbol="DAI"
            tokenCount="15,000,230.2323"
            treasuryShare="$1000.0"
          />
        </ProposalContainer>

        <AdditionalInfoContainer>
          <ResourceList
            links={[
              {
                label: 'Draft of Proposal',
                href: 'https://docs.google.com/spreadsheets/d/1qpUXGUrR3LXed4VkONYzRQhic0ahMb9wJxOzSLiuoYs/edit#gid=289257943',
              },
              {
                label: 'Thread in discord',
                href: 'https://discord.com/channels/672466989217873929/910124501264658442/936598604804685884',
              },
            ]}
          />
          <WidgetStatus steps={stepDataRunning} />
        </AdditionalInfoContainer>
      </ContentContainer>
    </Content>
  );
};

export default withTransaction('Proposal', 'component')(Proposal);

const Content = styled.div.attrs({
  className: 'tablet:w-4/5 mx-auto px-2 pt-3 pb-14',
})``;

const HeaderContainer = styled.div.attrs({
  className:
    'flex flex-col gap-y-2 desktop:p-0 px-2 tablet:px-3 pt-2 border border-red-500',
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
