import React from 'react';
import styled from 'styled-components';
import {Avatar} from '../avatar';

export type TokenListItemProps = {
  /**
  * name of the token
  */
  tokenName: string;
  /**
  * Symbol of the token
  */
  tokenSymbol: string;
  /**
  * Amount of the token
  */
  tokenAmount: string | number;
  /**
   * src of token logo
   */
  tokenLogo: string;
  onClick?: () => void;
};

export const TokenListItem: React.FC<TokenListItemProps> = ({
  tokenName,
  tokenSymbol,
  tokenAmount,
  tokenLogo,
  onClick,
}) => {
  return (
    <Container
      {...{onClick}}
       data-testid="tokenListItem"
    >
      <TextWrapper>
        <Avatar src={tokenLogo} size={'small'} />
        <Name>
          {tokenName}
        </Name>
      </TextWrapper>
      <AmountWrapper>
        {tokenAmount} {tokenSymbol}
      </AmountWrapper>
    </Container>
  );
};

const Container = styled.button.attrs({
  className:`w-full flex justify-between items-center py-1.5
  px-2 hover:text-ui-800 hover:bg-ui-100 active:text-ui-800 
  active:bg-ui-200 disabled:text-ui-300 bg-white rounded-xl`,
})``;

const AmountWrapper = styled.h3.attrs({
  className:'font-semibold text-ui-600 text-base',
})``;

const TextWrapper = styled.div.attrs({
  className:'flex space-x-2',
})``;

const Name = styled.h2.attrs({
  className:'font-bold text-ui-600 text-base',
})``;
