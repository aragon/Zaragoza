import {
  AvatarDao,
  AvatarDaoProps,
  ButtonIcon,
  shortenAddress,
} from '@aragon/ods-old';
import {Icon, IconType} from '@aragon/ods';
import React from 'react';
import styled from 'styled-components';

import useScreen from 'hooks/useScreen';

type DaoSelectorProps = {
  daoName: string;
  /** Dao's ethereum address **or** ENS name */
  daoAddress: string;
  /** Handler for the switch button. Will be called when the button is clicked. */
  onClick: () => void;
} & Pick<AvatarDaoProps, 'src'>;

export const DaoSelector: React.FC<DaoSelectorProps> = ({
  daoName,
  daoAddress,
  onClick,
  src,
}: DaoSelectorProps) => {
  const {isDesktop} = useScreen();

  return (
    <Card data-testid="cardDao" onClick={onClick}>
      <LeftContent>
        <AvatarWrapper>
          <AvatarDao daoName={daoName} src={src} />
        </AvatarWrapper>
        <TextContainer>
          <DaoName>{daoName}</DaoName>
          <DaoAddress>{shortenAddress(daoAddress)}</DaoAddress>
        </TextContainer>
      </LeftContent>

      <ButtonIcon
        icon={<Icon icon={IconType.CHEVRON_DOWN} />}
        mode="secondary"
        size="small"
        bgWhite={!isDesktop}
      />
    </Card>
  );
};

const Card = styled.div.attrs(() => ({
  className:
    'flex xl:inline-flex items-center space-x-4 bg-neutral-0' +
    ' xl:bg-[transparent] p-6 xl:p-0 rounded-xl cursor-pointer',
}))``;

const LeftContent = styled.div.attrs({
  className: 'inline-flex flex-1 space-x-3 min-w-0',
})``;

const AvatarWrapper = styled.div``;

const TextContainer = styled.div.attrs({
  className: 'flex flex-col justify-center min-w-0 ',
})``;

const DaoName = styled.p.attrs({
  className: 'text-neutral-800 font-semibold truncate',
})`
  max-width: 88px;
`;

const DaoAddress = styled.p.attrs({
  className: 'text-neutral-500 ft-text-sm xl:hidden truncate',
})``;
