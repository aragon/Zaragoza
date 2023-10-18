import {
  ButtonIcon,
  IconChevronRight,
  IconClose,
  IconHome,
  IconType,
} from '@aragon/ods-old';
import React from 'react';
import styled from 'styled-components';

type SearchHeader = {
  onClose?: () => void;
  selectedValue?: string;
  onSearch?: (search: string) => void;
  buttonIcon?: React.FunctionComponentElement<IconType>;
  searchPlaceholder: string;
  onHomeButtonClick?: () => void;
};

const SearchHeader: React.FC<SearchHeader> = props => {
  return (
    <Container>
      <LeftContent>
        <ButtonIcon
          icon={props.buttonIcon || <IconHome />}
          mode="secondary"
          bgWhite
          onClick={props.onHomeButtonClick}
        />
        <IconChevronRight />
        {props.selectedValue && (
          <>
            <SelectedValue>{props.selectedValue}</SelectedValue>
            <IconChevronRight />
          </>
        )}

        <ActionSearchInput
          type="text"
          placeholder={props.searchPlaceholder}
          onChange={e => props.onSearch?.(e.target.value)}
        />
      </LeftContent>
      <ButtonIcon
        mode="secondary"
        icon={<IconClose />}
        onClick={props.onClose}
        bgWhite
      />
    </Container>
  );
};

export default SearchHeader;

const Container = styled.div.attrs({
  className:
    'flex sticky top-0 justify-between items-center py-5 px-6 bg-neutral-0 border-b border-neutral-100',
})``;

const LeftContent = styled.div.attrs({
  className: 'flex gap-x-2 items-center text-neutral-300 ft-text-base',
})``;

const SelectedValue = styled.p.attrs({
  className: 'font-semibold text-neutral-600 ft-text-base',
})``;

const ActionSearchInput = styled.input.attrs({
  className:
    'flex-1 text-neutral-300 bg-neutral-0 ft-text-base focus:outline-none',
})``;
