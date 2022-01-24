import React, {useEffect, useState} from 'react';
import styled from 'styled-components';
import {
  IconCheckboxDefault,
  IconCheckboxMulti,
  IconCheckboxSelected,
  IconRadioDefault,
  IconRadioSelected,
} from '../icons';

const Icons = {
  multiSelect: {
    active: <IconCheckboxSelected />,
    multi: <IconCheckboxMulti />,
    default: <IconCheckboxDefault />,
  },
  radio: {
    active: <IconRadioSelected />,
    multi: <IconRadioDefault />,
    default: <IconRadioDefault />,
  },
};

export type CheckboxListItemProps = {
  label: string;
  helptext: string;
  multiSelect: boolean;
  disabled?: boolean;
  state?: 'default' | 'active' | 'multi';
  onClick: (nextState: string) => void;
};

export const CheckboxListItem: React.FC<CheckboxListItemProps> = ({
  label,
  helptext,
  multiSelect,
  disabled = false,
  state = 'default',
  onClick,
}) => {
  const [checkboxState, setCheckboxState] = useState(state);

  useEffect(() => {
    setCheckboxState(state);
  }, [state]);

  const handleClick = () => {
    const nextState = checkboxState === 'default' ? 'active' : 'default';
    setCheckboxState(nextState);
    onClick(nextState);
  };

  return (
    <Container
      data-testid="checkboxListItem"
      disabled={disabled}
      state={checkboxState}
      onClick={handleClick}
    >
      <HStack disabled={disabled} state={checkboxState}>
        <p className="font-bold">{label}</p>
        {Icons[multiSelect ? 'multiSelect' : 'radio'][checkboxState]}
      </HStack>
      <Helptext>{helptext}</Helptext>
    </Container>
  );
};

type ContainerTypes = {
  disabled: boolean;
  state: 'default' | 'active' | 'multi';
};

const Container = styled.div.attrs(({disabled, state}: ContainerTypes) => ({
  className: `py-1.5 px-2 rounded-xl border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer ${
    disabled
      ? 'bg-ui-100 border-ui-300'
      : `bg-ui-0 group hover:border-primary-500 ${
          state !== 'default' ? 'border-primary-500' : 'border-ui-100'
        }`
  }`,
  tabIndex: disabled ? -1 : 0,
}))<ContainerTypes>``;

const HStack = styled.div.attrs(({disabled, state}: ContainerTypes) => ({
  className: `flex justify-between items-center group-hover:text-primary-500 ${
    disabled
      ? 'text-ui-600'
      : state !== 'default'
      ? 'text-primary-500'
      : 'text-ui-600'
  }`,
}))<ContainerTypes>``;

const Helptext = styled.p.attrs({
  className: 'text-sm text-ui-500 mt-0.25',
})``;
