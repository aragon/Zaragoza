import React from 'react';
import {useFormContext} from 'react-hook-form';

import {useActionsContext} from 'context/actions';
import WithdrawAction from './withdraw/withdrawAction';
import {ActionsTypes} from 'utils/types';
import {AddActionItems} from '../addActionMenu';
import TokenMenu from 'containers/tokenMenu';
import {BaseTokenInfo, ActionItem} from 'utils/types';
import {fetchTokenPrice} from 'services/prices';
import {formatUnits} from 'utils/library';
import {useDaoBalances} from 'hooks/useDaoBalances';
import {useNetwork} from 'context/network';
import {useDaoParam} from 'hooks/useDaoParam';
import MintTokens from './mintTokens';
import AddRemoveAddresses from './addRemoveAddress';

/**
 * This Component is responsible for generating all actions that append to pipeline context (actions)
 * In future we can add more action template like: mint token Component
 * or custom action component (for smart contracts methods)
 * @returns List of actions
 */

type actionsComponentType = {
  name: ActionsTypes;
  index: number;
};

const Action: React.FC<actionsComponentType> = ({name, index}) => {
  switch (name) {
    case AddActionItems.WITHDRAW_ASSETS:
      return <WithdrawAction {...{index}} />;
    case AddActionItems.MINT_TOKENS:
      return <MintTokens {...{index}} />;
    case AddActionItems.ADD_REMOVE_ADDRESS:
      return <AddRemoveAddresses {...{index}} />;
    default:
      return null;
  }
};

const ActionBuilder: React.FC = () => {
  const {data: daoAddress} = useDaoParam();
  const {network} = useNetwork();
  const {actionsCounter: index, actions} = useActionsContext();
  const {data: tokens} = useDaoBalances(daoAddress);
  const {setValue, resetField, clearErrors, formState, trigger} =
    useFormContext();

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/

  const handleTokenSelect = (token: BaseTokenInfo) => {
    setValue(`actions.${index}.tokenSymbol`, token.symbol);

    if (token.address === '') {
      setValue(`actions.${index}.isCustomToken`, true);
      resetField(`actions.${index}.tokenName`);
      resetField(`actions.${index}.tokenImgUrl`);
      resetField(`actions.${index}.tokenAddress`);
      resetField(`actions.${index}.tokenBalance`);
      clearErrors(`actions.${index}.amount`);
      return;
    }

    clearErrors([
      `actions.${index}.tokenAddress`,
      `actions.${index}.tokenSymbol`,
    ]);
    setValue(`actions.${index}.isCustomToken`, false);
    setValue(`actions.${index}.tokenName`, token.name);
    setValue(`actions.${index}.tokenImgUrl`, token.imgUrl);
    setValue(`actions.${index}.tokenAddress`, token.address);
    setValue(
      `actions.${index}.tokenBalance`,
      formatUnits(token.count, token.decimals)
    );

    if (formState.dirtyFields.actions[index].amount) {
      trigger(`actions.${index}.amount`);
    }

    fetchTokenPrice(token.address, network).then(price => {
      setValue(`actions.${index}.tokenPrice`, price);
    });
  };

  return (
    <>
      {actions?.map((action: ActionItem, index: number) => (
        <Action key={index} name={action?.name} {...{index}} />
      ))}
      <TokenMenu
        isWallet={false}
        onTokenSelect={handleTokenSelect}
        tokenBalances={tokens}
      />
    </>
  );
};

export default ActionBuilder;
