import React from 'react';

import {useActionsContext} from 'context/actions';
import WithdrawAction from './withdrawAction';
import {ActionsTypes} from 'utils/types';
import {AddActionItems} from '../addActionMenu';

/**
 * This Component is responsible for generating all actions that append to pipeline context (actions)
 * In future we can add more action template like: mint token Component
 * or custom action component (for smart contracts methods)
 * @returns List of actions
 */

type actionsComponentType = {
  name: ActionsTypes;
  key: number;
};

const Action: React.FC<actionsComponentType> = ({name, key}) => {
  switch (name) {
    case AddActionItems.WITHDRAW_ASSETS:
      return <WithdrawAction key={key} />;
    default:
      return <></>;
  }
};

const ActionBuilder: React.FC = () => {
  const {actions} = useActionsContext();

  return (
    <>
      {actions.map((action, index: number) => (
        <Action key={index} name={action.name} />
      ))}
    </>
  );
};

export default ActionBuilder;
