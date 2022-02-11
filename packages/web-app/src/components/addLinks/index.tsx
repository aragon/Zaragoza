import React from 'react';
import styled from 'styled-components';
import {ButtonText, IconAdd} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';
import {useFormContext, useFieldArray} from 'react-hook-form';

import Row from './row';
import Header from './header';

export type AddLinks = {
  buttonPlusIcon?: boolean;
};

const AddLinks: React.FC<AddLinks> = ({buttonPlusIcon}) => {
  const {t} = useTranslation();
  const {control} = useFormContext();
  const {fields, append, remove} = useFieldArray({name: 'links', control});

  // TODO: research focus after input refactor
  const handleAddLink = () => {
    append({label: '', link: ''});
  };

  return (
    <Container data-testid="add-links">
      {fields.length > 0 && (
        <ListGroup>
          <Header />
          {fields.map((field, index) => (
            <Row
              key={field.id}
              index={index}
              control={control}
              onDelete={() => remove(index)}
            />
          ))}
        </ListGroup>
      )}
      <ButtonText
        label={t('labels.addLink')}
        iconLeft={buttonPlusIcon ? <IconAdd /> : undefined}
        mode="secondary"
        size="large"
        onClick={handleAddLink}
      />
    </Container>
  );
};

export default AddLinks;

const Container = styled.div.attrs({className: 'space-y-1.5'})``;
const ListGroup = styled.div.attrs({
  className: 'flex flex-col overflow-hidden space-y-0.25 rounded-xl',
})``;
