import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {
  ActionListItem,
  AvatarDao,
  IconLinkExternal,
} from '@aragon/ui-components';

const TEMP_ICON =
  'https://banner2.cleanpng.com/20180325/sxw/kisspng-computer-icons-avatar-avatar-5ab7529a8e4e14.9936310115219636745829.jpg';

type DaoSwitcherMenuProps = {
  daos?: {name: string; ens: string; icon?: string}[];

  // Note: This onClick function must be called to close the popover
  onClick: () => void;
};

const DaoSwitcherMenu: React.FC<DaoSwitcherMenuProps> = ({
  daos = [],
  onClick,
}) => {
  const {t} = useTranslation();

  return (
    <Container>
      <DaoListContainer>
        {/* NOTE: Temporarily static  */}
        <AvatarDao daoName="Bushido DAO" src={TEMP_ICON} onClick={onClick} />
        {daos.map(({name, icon}) => (
          <div key={name}>
            <AvatarDao daoName={name} src={icon} onClick={onClick} />
          </div>
        ))}
      </DaoListContainer>
      <ActionListItem
        icon={<IconLinkExternal />}
        onClick={onClick}
        title={t('daoSwitcher.title')}
        subtitle={t('daoSwitcher.subtitle')}
        disabled
      />
    </Container>
  );
};

export default DaoSwitcherMenu;

const Container = styled.div.attrs({className: 'space-y-3'})`
  padding: 20px 16px;
`;

const DaoListContainer = styled.div.attrs({className: 'space-y-2'})``;
