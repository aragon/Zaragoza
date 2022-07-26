import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import {ListItemAction, IconChevronRight} from '@aragon/ui-components';

import {useGlobalModalContext} from 'context/globalModals';
import {useActionsContext} from 'context/actions';
import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {ActionParameter} from 'utils/types';

type AddActionMenuProps = {
  actions: ActionParameter[];
};

const AddActionMenu: React.FC<AddActionMenuProps> = ({actions}) => {
  const {isAddActionOpen, close} = useGlobalModalContext();
  const {addAction} = useActionsContext();
  const {t} = useTranslation();

  return (
    <ModalBottomSheetSwitcher
      isOpen={isAddActionOpen}
      onClose={() => close('addAction')}
      title={t('AddActionModal.title')}
    >
      <Container>
        {actions.map(a => (
          <ListItemAction
            key={a.type}
            title={a.title}
            subtitle={a.subtitle}
            iconRight={<IconChevronRight />}
            onClick={() => {
              addAction({
                name: a.type,
              });
              close('addAction');
            }}
          />
        ))}
      </Container>
    </ModalBottomSheetSwitcher>
  );
};

export default AddActionMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;
