import React from 'react';
import styled from 'styled-components';
import {ButtonText} from '@aragon/ui-components';

type Props = {
  // temporary property, to be removed once all actions available
  actionAvailable?: boolean;
  actionLabel: string;
  className?: string;
  path: string;
  imgSrc: string;
  onClick: (path: string) => void;
  subtitle: string;
  title: string;
};

const CTACard: React.FC<Props> = props => {
  return (
    <CTACardWrapper className={props.className}>
      <Content>
        <img src={props.imgSrc} />
        <Title>{props.title}</Title>
        <Subtitle>{props.subtitle}</Subtitle>
      </Content>

      <ButtonText
        size="large"
        label={props.actionLabel}
        {...(props.actionAvailable
          ? {mode: 'primary'}
          : {mode: 'ghost', disabled: true})}
        onClick={() => props.onClick(props.path)}
      />
    </CTACardWrapper>
  );
};

export default CTACard;

const CTACardWrapper = styled.div.attrs({
  className: 'p-3 space-y-3 rounded-xl' as string,
})`
  background: rgba(255, 255, 255, 0.68);
  backdrop-filter: blur(50px);
`;

const Content = styled.div.attrs({className: 'space-y-2'})``;

const Title = styled.p.attrs({className: 'text-2xl font-bold text-ui-800'})``;

const Subtitle = styled.p.attrs({className: 'text-ui-600'})``;
