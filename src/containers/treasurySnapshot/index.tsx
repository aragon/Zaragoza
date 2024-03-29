import React from 'react';
import {ListItemHeader, TransferListItem} from '@aragon/ods-old';
import {Button, CardEmptyState, IconType} from '@aragon/ods';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';
import styled from 'styled-components';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useTransactionDetailContext} from 'context/transactionDetail';
import {AllTransfers} from 'utils/paths';
import {abbreviateTokenAmount, shortenLongTokenSymbol} from 'utils/tokens';
import {Transfer} from 'utils/types';
import {htmlIn} from 'utils/htmlIn';

type Props = {
  daoAddressOrEns: string;
  transfers: Transfer[];
  totalAssetValue: number;
};

const TreasurySnapshot: React.FC<Props> = ({
  daoAddressOrEns,
  transfers,
  totalAssetValue,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {handleTransferClicked} = useTransactionDetailContext();

  if (transfers.length === 0) {
    return (
      <CardEmptyState
        humanIllustration={{
          body: 'CHART',
          expression: 'EXCITED',
          hairs: 'BUN',
          object: 'WALLET',
          objectPosition: 'right',
        }}
        heading={t('finance.emptyState.title')}
        description={htmlIn(t)('finance.emptyState.description')}
        primaryButton={{
          label: t('finance.emptyState.buttonLabel'),
          onClick: () => open('deposit'),
        }}
        secondaryButton={{
          label: t('navLinks.guide'),
          href: t('finance.emptyState.descriptionLinkURL'),
          iconRight: IconType.LINK_EXTERNAL,
          target: '_blank',
        }}
      />
    );
  }

  return (
    <Container>
      <ListItemHeader
        icon={IconType.APP_ASSETS}
        value={new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
        }).format(totalAssetValue)}
        label={t('labels.treasuryValue')}
        buttonText={t('allTransfer.newTransfer')}
        orientation="vertical"
        onClick={() => open('transfer')}
      />
      {transfers.slice(0, 3).map(({tokenAmount, tokenSymbol, ...rest}) => (
        <TransferListItem
          key={rest.id}
          tokenAmount={abbreviateTokenAmount(tokenAmount)}
          tokenSymbol={shortenLongTokenSymbol(tokenSymbol)}
          {...rest}
          onClick={() =>
            handleTransferClicked({tokenAmount, tokenSymbol, ...rest})
          }
        />
      ))}
      <Button
        variant="tertiary"
        size="lg"
        iconRight={IconType.CHEVRON_RIGHT}
        onClick={() =>
          navigate(generatePath(AllTransfers, {network, dao: daoAddressOrEns}))
        }
      >
        {t('labels.seeAll')}
      </Button>
    </Container>
  );
};

export default TreasurySnapshot;

const Container = styled.div.attrs({
  className: 'space-y-3 xl:space-y-4',
})``;
