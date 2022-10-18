import {
  AlertInline,
  Badge,
  ButtonText,
  CheckboxListItem,
  CheckboxListItemProps,
} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

export type DescriptionListProps = {
  title: string;
  onEditClick?: () => void;
  editLabel?: string;
  checkBoxErrorMessage?: string;
  checkedState?: CheckboxListItemProps['type'];
  onChecked?: () => void;
  badgeLabel?: string;
};

export const DescriptionListContainer: React.FC<DescriptionListProps> = ({
  title,
  children,
  onEditClick,
  editLabel,
  checkBoxErrorMessage,
  checkedState,
  onChecked,
  badgeLabel,
}) => {
  const {t} = useTranslation();

  return (
    <Container>
      <HStack>
        <TitleContainer>
          <TitleText>{title}</TitleText>
          {badgeLabel && (
            <div>
              <Badge label={badgeLabel || ''} colorScheme="info" />
            </div>
          )}
        </TitleContainer>
        {onEditClick && (
          <ButtonText
            label={editLabel || t('labels.edit')}
            mode="ghost"
            onClick={onEditClick}
          />
        )}
      </HStack>
      <DlContainer>{children}</DlContainer>
      {onChecked && (
        <div className="ml-auto space-y-1.5 tablet:w-3/4">
          <div className="tablet:flex">
            <CheckboxListItem
              label={t('createDAO.review.valuesCorrect')}
              multiSelect
              onClick={() => onChecked?.()}
              type={checkedState}
            />
          </div>
          {checkedState === 'error' && checkBoxErrorMessage && (
            <AlertInline label={checkBoxErrorMessage} mode="critical" />
          )}
        </div>
      )}
    </Container>
  );
};

export const Dt: React.FC = ({children}) => (
  <DtContainer>{children}</DtContainer>
);

export const Dd: React.FC = ({children}) => (
  <DdContainer>{children}</DdContainer>
);

export const Dl: React.FC = ({children}) => (
  <DlContainer>
    <ListItemContainer>{children}</ListItemContainer>
  </DlContainer>
);

const DescriptionList = {
  Container: DescriptionListContainer,
  Dl,
  Dt,
  Dd,
};

export default DescriptionList;

const Container = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-3 rounded-xl bg-ui-0',
})``;

const TitleText = styled.h1.attrs({
  className: 'text-lg font-bold text-ui-800',
})``;

const TitleContainer = styled.div.attrs({
  className: 'flex space-x-2',
})``;

const DlContainer = styled.dl.attrs({
  className: 'space-y-2',
})``;

const ListItemContainer = styled.div.attrs({
  className:
    'tablet:flex justify-between tablet:space-x-2 space-y-0.5 tablet:space-y-0',
})``;

const DtContainer = styled.dt.attrs({
  className: 'font-bold text-ui-800',
})``;

const DdContainer = styled.dd.attrs({
  className: 'flex-shrink-0 tablet:w-3/4 text-ui-600',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between items-center',
})``;
