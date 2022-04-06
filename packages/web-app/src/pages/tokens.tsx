import {SearchInput} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useState} from 'react';

import TokenList from 'components/tokenList';
import {TEST_DAO} from 'utils/constants';
import {useDaoVault} from 'hooks/useDaoVault';
import {PageWrapper} from 'components/wrappers';
import {filterTokens} from 'utils/tokens';
import type {VaultToken} from 'utils/types';
import {useGlobalModalContext} from 'context/globalModals';

const Tokens: React.FC = () => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {tokens} = useDaoVault(TEST_DAO);

  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const filteredTokens: VaultToken[] = filterTokens(tokens, searchTerm);

  return (
    <PageWrapper
      title={t('allTokens.title') as string}
      subtitle={
        tokens.length === 1
          ? t('allTokens.subtitleSingular')
          : t('allTokens.subtitle', {count: tokens.length})
      }
      buttonLabel={t('TransferModal.newTransfer') as string}
      onClick={open}
    >
      <div className="mt-3 desktop:mt-8 space-y-3 desktop:space-y-5">
        <SearchInput
          placeholder="Type to filter"
          value={searchTerm}
          onChange={handleChange}
        />
        <TokenList tokens={filteredTokens} />
      </div>
    </PageWrapper>
  );
};

export default withTransaction('Tokens', 'component')(Tokens);
