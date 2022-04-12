import styled from 'styled-components';
import * as Locales from 'date-fns/locale';
import {format, Locale} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import {Option, ButtonGroup, SearchInput} from '@aragon/ui-components';
import React, {useCallback, useMemo, useState} from 'react';

import {Transfer} from 'utils/types';
import TransferList from 'components/transferList';
import {PageWrapper} from 'components/wrappers';
import TransactionDetail from 'containers/transactionDetail';
import useCategorizedTransfers from 'hooks/useCategorizedTransfers';
import {useGlobalModalContext} from 'context/globalModals';
import {TransferSectionWrapper} from 'components/wrappers';
import {TEST_DAO, TransferTypes} from 'utils/constants';

const Transfers: React.FC = () => {
  const {t, i18n} = useTranslation();
  const {open} = useGlobalModalContext();
  const [filterValue, setFilterValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const {data: categorizedTransfers, totalTransfers} =
    useCategorizedTransfers(TEST_DAO);

  // Transaction detail
  const [selectedTransfer, setSelectedTransfer] = useState<Transfer>(
    {} as Transfer
  );
  const [showTransactionDetail, setShowTransactionDetail] =
    useState<boolean>(false);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const handleTransferClicked = useCallback((transfer: Transfer) => {
    setSelectedTransfer(transfer);
    setShowTransactionDetail(true);
  }, []);

  const handleButtonGroupChange = (selected: string) => {
    const val = selected === 'all' ? '' : selected;
    setFilterValue(val);
  };

  const filterValidator = useCallback(
    (transfer: Transfer) => {
      let returnValue = true;
      if (filterValue !== '') {
        returnValue = Boolean(transfer.transferType === filterValue);
      }
      if (searchValue !== '') {
        const re = new RegExp(searchValue, 'i');
        returnValue = Boolean(transfer?.title.match(re));
      }
      return returnValue;
    },
    [searchValue, filterValue]
  );

  const displayedTransfers = useMemo(
    () => ({
      week: categorizedTransfers.week.filter(filterValidator),
      month: categorizedTransfers.month.filter(filterValidator),
      year: categorizedTransfers.year.filter(filterValidator),
    }),
    [
      categorizedTransfers.week,
      categorizedTransfers.month,
      categorizedTransfers.year,
      filterValidator,
    ]
  );

  const noTransfers = useMemo(
    () =>
      categorizedTransfers.week.length === 0 &&
      categorizedTransfers.month.length === 0 &&
      categorizedTransfers.year.length === 0,
    [
      categorizedTransfers.month.length,
      categorizedTransfers.week.length,
      categorizedTransfers.year.length,
    ]
  );

  /**
   * Note: We can add a nested iterator for both sections and transfer cards
   */
  return (
    <>
      <PageWrapper
        title={t('TransferModal.allTransfers')}
        buttonLabel={t('TransferModal.newTransfer')}
        subtitle={`${totalTransfers} Total Volume`}
        onClick={open}
      >
        <div className="mt-3 desktop:mt-8">
          <div className="space-y-1.5">
            <SearchInput
              value={searchValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setSearchValue(e.target.value)
              }
              placeholder={t('placeHolders.searchTransfers')}
            />
            <div className="flex">
              <ButtonGroup
                bgWhite
                defaultValue="all"
                onChange={handleButtonGroupChange}
              >
                <Option value="all" label={t('labels.all')} />
                <Option
                  value={TransferTypes.Deposit}
                  label={t('labels.deposit')}
                />
                <Option
                  value={TransferTypes.Withdraw}
                  label={t('labels.withdraw')}
                />
                <Option
                  value="externalContract"
                  label={t('labels.externalContract')}
                />
              </ButtonGroup>
            </div>
          </div>
          {noTransfers ? (
            <SectionContainer>
              <p>{t('allTransfer.noTransfers')}</p>
            </SectionContainer>
          ) : (
            <>
              {displayedTransfers.week.length > 0 && (
                <SectionContainer>
                  <TransferSectionWrapper title={t('allTransfer.thisWeek')}>
                    <div className="my-2 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.week}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
              {displayedTransfers.month.length !== 0 && (
                <SectionContainer>
                  <TransferSectionWrapper
                    title={format(new Date(), 'MMMM', {
                      locale: (Locales as {[key: string]: Locale})[
                        i18n.language
                      ],
                    })}
                  >
                    <div className="my-2 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.month}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
              {displayedTransfers.year.length !== 0 && (
                <SectionContainer>
                  <TransferSectionWrapper title={format(new Date(), 'yyyy')}>
                    <div className="my-2 space-y-1.5 border-solid">
                      <TransferList
                        transfers={displayedTransfers.year}
                        onTransferClick={handleTransferClicked}
                      />
                    </div>
                  </TransferSectionWrapper>
                </SectionContainer>
              )}
            </>
          )}
        </div>
      </PageWrapper>
      <TransactionDetail
        isOpen={showTransactionDetail}
        onClose={() => setShowTransactionDetail(false)}
        transfer={selectedTransfer}
      />
    </>
  );
};

const SectionContainer = styled.div.attrs({className: 'my-3 desktop:my-5'})``;

export default withTransaction('Transfers', 'component')(Transfers);
