import React from 'react';
import styled from 'styled-components';

import {SizedButton} from './button';
import {Avatar} from '../avatar';
import {Spinner} from '../spinner';
import {BeautifyLabel} from '../../utils/addresses';

export type WalletButtonProps = {
  /**
   * set wallet Address/Ens
   */
  label: string;
  /**
   * Avatar Image source
   */
  src: string;
  /**
   * Loading mode
   */
  isLoading?: boolean;
  onClick: () => void;
  /**
   * Whether the current item is active
   */
  isSelected?: boolean;
};

export const WalletButton = ({
  label,
  src,
  isSelected = false,
  isLoading,
  onClick,
}: WalletButtonProps) => {
  return (
    <StyledButton onClick={onClick} size={'default'} isSelected={isSelected}>
      <StyledLabel {...{isLoading}}>{BeautifyLabel(label)}</StyledLabel>
      {!isLoading ? (
        <Avatar src={src} size={'small'} />
      ) : (
        <Spinner size={'small'} />
      )}
    </StyledButton>
  );
};

type StyledButtonProp = Pick<WalletButtonProps, 'isSelected'>;
type StyledLabelProp = Pick<WalletButtonProps, 'isLoading'>;

const StyledButton = styled(SizedButton).attrs(
  ({isSelected}: StyledButtonProp) => ({
    className: `flex md:space-x-1.5 py-1.5 active:text-primary-500 active:bg-primary-50
  ${isSelected ? ' text-primary-500 bg-primary-50' : ' text-ui-600 bg-ui-0'}`,
  })
)<StyledButtonProp>``;

const StyledLabel = styled.p.attrs(({isLoading}: StyledLabelProp) => ({
  className: `tablet:inline hidden ${isLoading && 'text-primary-500'}`,
}))``;
