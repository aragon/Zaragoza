import {useWatch} from 'react-hook-form';
import React from 'react';
import {MultisigEligibility} from '../../components/multisigEligibility';
import {SelectEligibility} from '../../components/selectEligibility';

export const ProposalCreation = () => {
  const [membership, isCustomToken, tokenType] = useWatch({
    name: ['membership', 'isCustomToken', 'tokenType'],
  });

  const isAllowedToConfigureVotingEligibility =
    isCustomToken || tokenType === 'ERC-20' || tokenType === 'governance-ERC20';

  return (
    <div>
      {membership === 'multisig' && <MultisigEligibility />}
      {membership === 'token' && isAllowedToConfigureVotingEligibility && (
        <SelectEligibility />
      )}
    </div>
  );
};
