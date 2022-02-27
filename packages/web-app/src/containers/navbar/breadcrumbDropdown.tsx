import {
  Breadcrumb,
  ButtonIcon,
  CrumbType,
  IconClose,
  IconMenu,
  Popover,
} from '@aragon/ui-components';
import React from 'react';

import NavLinks from 'components/navLinks';

type BreadcrumbDropdownProps = {
  open: boolean;
  icon: JSX.Element;
  crumbs: CrumbType[];
  onClose?: () => void;
  onCrumbClick: (path: string) => void;
  onOpenChange?: (open: boolean) => void;
};

export const BreadcrumbDropdown: React.FC<BreadcrumbDropdownProps> = props => {
  return (
    <>
      <Popover
        side="bottom"
        align="start"
        width={240}
        open={props.open}
        onOpenChange={props.onOpenChange}
        content={<NavLinks parent="dropdown" onItemClick={props.onClose} />}
      >
        <ButtonIcon
          mode="secondary"
          size="large"
          icon={props.open ? <IconClose /> : <IconMenu />}
          isActive={props.open}
        />
      </Popover>
      <Breadcrumb
        icon={props.icon}
        crumbs={props.crumbs}
        onClick={props.onCrumbClick}
      />
    </>
  );
};
