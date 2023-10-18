import {IconInfo, Link} from '@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';

import {GridLayout} from 'components/layout';
import useScreen from 'hooks/useScreen';
import IconLogoBlue from 'public/iconLogoBlue.svg';
import {EXPLORE_NAV_LINKS, PRIVACY_NAV_LINKS} from 'utils/constants';
import {useWallet} from 'hooks/useWallet';

const Footer: React.FC = () => {
  const {isDesktop} = useScreen();
  const {isOnWrongNetwork} = useWallet();

  const ExploreNavLinks = EXPLORE_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link href={item.path} label={item.label} type="neutral" />
    </li>
  ));

  const PrivacyNavLinks = PRIVACY_NAV_LINKS.map(item => (
    <li key={item.label}>
      <Link label={item.label} href={item.path} type="neutral" />
    </li>
  ));

  return (
    <Section data-testid="footer">
      <GridLayout>
        <FullSpan>
          <ActionContainer>
            {isDesktop ? (
              <>
                <FlexDiv>
                  <LogoContainer src={IconLogoBlue} />
                  <StyledNavList>{ExploreNavLinks}</StyledNavList>
                </FlexDiv>
                <FlexDiv>
                  <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                  <Copyright>
                    &copy;{`  ${new Date().getFullYear()}  `}Aragon
                  </Copyright>
                </FlexDiv>
              </>
            ) : (
              <>
                <LogoContainer src={IconLogoBlue} />
                <StyledNavList>{ExploreNavLinks}</StyledNavList>
                <StyledNavList>{PrivacyNavLinks}</StyledNavList>
                <Copyright>
                  &copy;{`  ${new Date().getFullYear()}  `}Aragon
                </Copyright>
              </>
            )}
          </ActionContainer>
        </FullSpan>
      </GridLayout>
      <div
        className={`z-10 flex items-center justify-center space-x-2 bg-primary-400 py-1 text-sm leading-normal text-neutral-0 xl:mb-0 ${
          isOnWrongNetwork ? 'mb-[88px] md:mb-[120px]' : 'mb-16 md:mb-24'
        }`}
      >
        <IconInfo />
        <span>Aragon App Public Beta</span>
      </div>
    </Section>
  );
};

const FullSpan = styled.div.attrs({
  className: 'col-span-full',
})`
  overflow-y: clip;
`;

const Section = styled.section.attrs({
  className: 'w-full overflow-hidden bg-neutral-0 mt-16',
})``;

const ActionContainer = styled.div.attrs({
  className:
    'relative flex flex-col xl:flex-row xl:justify-between items-center space-y-8 xl:space-y-0 pt-10 xl:pt-6 pb-16 xl:pb-6',
})``;

const FlexDiv = styled.div.attrs({
  className: 'flex space-x-8 items-center',
})``;

const LogoContainer = styled.img.attrs({
  className: 'h-10',
})``;

const StyledNavList = styled.ul.attrs({
  className: 'flex space-x-8',
})``;

const Copyright = styled.span.attrs({
  className: 'text-neutral-600 font-normal',
})``;

export default Footer;
