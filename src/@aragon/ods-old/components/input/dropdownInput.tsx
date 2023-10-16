import React from 'react';
import {styled} from 'styled-components';

import {IconChevronDown} from '../icons';
import {type StyledContainerProps} from './numberInput';

export type DropDownInputProps = {
  /** Changes a input's color schema */
  mode?: 'default' | 'success' | 'warning' | 'critical';
  disabled?: boolean;
  value?: string;
  name?: string;
  placeholder?: string;
  onClick: () => void;
};
/** Dropdown input with variable styling (depending on mode) */

export const DropdownInput: React.FC<DropDownInputProps> = ({
  mode = 'default',
  disabled,
  value,
  name,
  placeholder,
  onClick,
}) => {
  return (
    <Container
      data-testid="dropdown-input"
      {...{mode, name, disabled, onClick}}
    >
      {value ?? <Placeholder>{placeholder}</Placeholder>}
      <StyledIconChevronDown {...{disabled}} />
    </Container>
  );
};

const Container = styled.button.attrs(
  ({mode, disabled}: StyledContainerProps) => {
    let className = `${
      disabled ? 'bg-neutral-100' : 'bg-neutral-0'
    } flex bg-neutral-0 focus:outline-none focus-within:ring-2
    focus-within:ring-primary-500 py-1.5 px-2 rounded-xl w-full
    hover:border-neutral-300 border-2 active:border-primary-500 active:ring-0
    items-center justify-between `;

    if (mode === 'default') {
      className += 'border-neutral-100';
    } else if (mode === 'success') {
      className += 'border-success-600';
    } else if (mode === 'warning') {
      className += 'border-warning-600';
    } else if (mode === 'critical') {
      className += 'border-critical-600';
    }

    return {className};
  }
)`
  height: fit-content;
`;

export type StyledChevronDownProps = Pick<StyledContainerProps, 'disabled'>;

const StyledIconChevronDown = styled(IconChevronDown).attrs(
  ({disabled}: StyledChevronDownProps) => ({
    className: `${disabled ? 'text-neutral-300' : 'text-neutral-600'}`,
  })
)``;

const Placeholder = styled.span.attrs({
  className: 'text-neutral-300',
})``;
