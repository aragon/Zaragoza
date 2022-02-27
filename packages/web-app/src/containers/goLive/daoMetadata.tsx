import React from 'react';
import styled from 'styled-components';
import {
  ButtonText,
  CheckboxSimple,
  AvatarDao,
  ListItemLink,
} from '@aragon/ui-components';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';

import {useFormStep} from 'components/fullScreenStepper';

import {
  Card,
  Header,
  Title,
  Body,
  Row,
  Label,
  LabelWrapper,
  TextContent,
  Footer,
  ActionWrapper,
} from './blockchain';

const DaoMetadata: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {t} = useTranslation();
  const {daoLogo, daoName, daoSummary, links} = getValues();

  return (
    <Card>
      <Header>
        <Title>{t('labels.review.daoMetadata')}</Title>
      </Header>
      <Body>
        <Row>
          <LabelWrapper>
            <Label>{t('labels.logo')}</Label>
          </LabelWrapper>
          {daoLogo && (
            <AvatarDao
              {...{daoName}}
              src={daoLogo ? URL.createObjectURL(daoLogo) : ''}
            />
          )}
        </Row>
        <Row>
          <LabelWrapper>
            <Label>{t('labels.daoName')}</Label>
          </LabelWrapper>
          <TextContent>{daoName}</TextContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>{t('labels.description')}</Label>
          </LabelWrapper>
          <DescriptionContent>{daoSummary}</DescriptionContent>
        </Row>
        <Row>
          <LabelWrapper>
            <Label>{t('labels.links')}</Label>
          </LabelWrapper>
          <ContentWrapper>
            {links.map(
              ({label, href}: {label: string; href: string}, index: number) => {
                console.log(links);
                return (
                  href !== '' && (
                    <ListItemLink key={index} {...{label, href}} external />
                  )
                );
              }
            )}
          </ContentWrapper>
        </Row>
      </Body>
      <Footer>
        <ActionWrapper>
          <ButtonText label="Edit" mode="ghost" onClick={() => setStep(3)} />
        </ActionWrapper>
        <Controller
          name="reviewCheck.daoMetadata"
          control={control}
          defaultValue={false}
          rules={{
            required: t('errors.required.recipient'),
          }}
          render={({field: {onChange, value}}) => (
            <CheckboxSimple
              state={value ? 'active' : 'default'}
              label="These values are correct"
              onClick={() => onChange(!value)}
              multiSelect
            />
          )}
        />
      </Footer>
    </Card>
  );
};

const ContentWrapper = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const DescriptionContent = styled.p.attrs({
  className: 'w-9/12',
})``;

export default DaoMetadata;
