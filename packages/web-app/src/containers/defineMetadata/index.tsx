import {
  AlertInline,
  InputImageSingle,
  Label,
  TextareaSimple,
  TextInput,
} from '@aragon/ui-components';
import React, {useCallback} from 'react';
import {Controller, FieldError, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import AddLinks from 'components/addLinks';
import {URL_PATTERN} from 'utils/constants';
import {isOnlyWhitespace} from 'utils/library';

const DAO_LOGO = {
  maxDimension: 2400,
  minDimension: 256,
  maxFileSize: 3000000,
};

const DefineMetadata: React.FC<{bgWhite?: boolean}> = ({bgWhite = false}) => {
  const {t} = useTranslation();
  const {control, setError} = useFormContext();

  const handleImageError = useCallback(
    (error: {code: string; message: string}) => {
      const imgError: FieldError = {type: 'manual'};
      const {minDimension, maxDimension, maxFileSize} = DAO_LOGO;

      switch (error.code) {
        case 'file-invalid-type':
          imgError.message = t('errors.invalidImageType');
          break;
        case 'file-too-large':
          imgError.message = t('errors.imageTooLarge', {maxFileSize});
          break;
        case 'wrong-dimension':
          imgError.message = t('errors.imageDimensions', {
            minDimension,
            maxDimension,
          });
          break;
        default:
          imgError.message = t('errors.invalidImage');
          break;
      }

      setError('daoLogo', imgError);
    },
    [setError, t]
  );

  return (
    <>
      {/* Name */}
      <FormItem>
        <Label
          label={t('labels.daoName')}
          helpText={t('createDAO.step2.nameSubtitle')}
        />

        <Controller
          name="daoName"
          control={control}
          defaultValue=""
          rules={{
            required: t('errors.required.name'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.name') : true,
          }}
          render={({
            field: {onBlur, onChange, value, name},
            fieldState: {error},
          }) => (
            <>
              <TextInput
                {...{name, value, onBlur, onChange}}
                placeholder={t('placeHolders.daoName')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Logo */}
      <FormItem>
        <Label
          label={t('labels.logo')}
          helpText={t('createDAO.step2.logoSubtitle')}
          isOptional
          badgeLabel={t('labels.optional')}
        />

        <Controller
          name="daoLogo"
          control={control}
          render={({field: {value, onChange}, fieldState: {error}}) => {
            let preview;

            // in case url does not need to be created
            if (URL_PATTERN.test(value)) {
              preview = value;
            } else {
              preview = value ? URL.createObjectURL(value) : '';
            }

            return (
              <>
                <LogoContainer>
                  <InputImageSingle
                    {...{DAO_LOGO, preview}}
                    onError={handleImageError}
                    onChange={onChange}
                    onlySquare
                  />
                </LogoContainer>
                {error?.message && (
                  <AlertInline label={error.message} mode="critical" />
                )}
              </>
            );
          }}
        />
      </FormItem>

      {/* Summary */}
      <FormItem>
        <Label
          label={t('labels.description')}
          helpText={t('createDAO.step2.descriptionSubtitle')}
        />
        <Controller
          name="daoSummary"
          rules={{
            required: t('errors.required.summary'),
            validate: value =>
              isOnlyWhitespace(value) ? t('errors.required.summary') : true,
          }}
          control={control}
          render={({field, fieldState: {error}}) => (
            <>
              <TextareaSimple
                {...field}
                placeholder={t('placeHolders.daoDescription')}
              />
              {error?.message && (
                <AlertInline label={error.message} mode="critical" />
              )}
            </>
          )}
        />
      </FormItem>

      {/* Links */}
      <FormItem>
        <Label
          label={t('labels.links')}
          helpText={t('createDAO.step2.linksSubtitle')}
          isOptional
        />
        <AddLinks arrayName="daoLinks" bgWhite={bgWhite} />
      </FormItem>
    </>
  );
};

export default DefineMetadata;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

const LogoContainer = styled.div.attrs({
  className: 'pt-0.5',
})``;
