import {
  ButtonIcon,
  ButtonText,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';
import {ActionIndex} from 'utils/types';
import AccordionSummary from './accordionSummary';
import {AddressRow} from './addressRow';

export type CustomHeaderProps = {
  useCustomHeader?: boolean;
};

type AddAddressesProps = ActionIndex & CustomHeaderProps;

const AddAddresses: React.FC<AddAddressesProps> = ({
  actionIndex,
  useCustomHeader = false,
}) => {
  const {t} = useTranslation();
  const {removeAction} = useActionsContext();

  // form context
  const {control, trigger, setValue} = useFormContext();
  const memberListKey = `actions.${actionIndex}.inputs.memberWallets`;
  const memberWallets = useWatch({
    name: memberListKey,
    control,
  });

  const {fields, update, append, remove} = useFieldArray({
    control,
    name: memberListKey,
  });

  const controlledWallets = fields.map((field, ctrlledIndex) => {
    return {
      ...field,
      ...(memberWallets && {...memberWallets[ctrlledIndex]}),
    };
  });

  /*************************************************
   *                Hooks & Effects                *
   *************************************************/
  useEffect(() => {
    if (controlledWallets.length === 0) {
      append({address: ''});
    }

    setValue(`actions.${actionIndex}.name`, 'add_address');
  }, [actionIndex, append, controlledWallets.length, setValue]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // if there are more than one address, trigger validation
  // to fix duplicate address error
  const validateFields = () => {
    if (controlledWallets.length > 1) {
      setTimeout(() => {
        trigger(memberListKey);
      }, 50);
    }
  };

  // reset all rows
  const handleResetAll = () => {
    controlledWallets.forEach((_, index) => {
      update(index, {address: ''});
    });
  };

  // reset single row
  const handleRowClear = (index: number) => {
    update(index, {address: ''});
    validateFields();
  };

  // remove all rows
  const handleDeleteAll = () => {
    remove();
  };

  // remove single row
  const handleRowDelete = (index: number) => {
    remove(index);
    validateFields();
  };

  // add empty wallet
  const handleAdd = () => {
    append({address: ''});
  };

  // TODO: extract actions out of component
  // separating this because rows sometimes don't have the same actions
  const rowActions = [
    {
      component: (
        <ListItemAction
          title={t('labels.whitelistWallets.deleteEntry')}
          bgWhite
        />
      ),
      callback: (rowIndex: number) => {
        handleRowDelete(rowIndex);
      },
    },
  ];

  const methodActions = [
    {
      component: <ListItemAction title={t('labels.resetAction')} bgWhite />,
      callback: handleResetAll,
    },
    {
      component: (
        <ListItemAction title={t('labels.removeEntireAction')} bgWhite />
      ),
      callback: () => {
        removeAction(actionIndex);
      },
    },
  ];

  /*************************************************
   *                    Render                    *
   *************************************************/
  return (
    <AccordionMethod
      verified
      type="action-builder"
      methodName={t('labels.addWallets')}
      smartContractName={t('labels.aragonCore')}
      methodDescription={t('labels.addWalletsDescription')}
      dropdownItems={methodActions}
      customHeader={useCustomHeader && <CustomHeader />}
    >
      <FormItem className="hidden desktop:block py-1.5">
        <Label label={t('labels.whitelistWallets.address')} />
      </FormItem>
      {controlledWallets.map((field, fieldIndex) => {
        return (
          <FormItem key={field.id}>
            <div className="desktop:hidden mb-0.5 desktop:mb-0">
              <Label label={t('labels.whitelistWallets.address')} />
            </div>
            <AddressRow
              actionIndex={actionIndex}
              fieldIndex={fieldIndex}
              dropdownItems={rowActions}
              onClearRow={handleRowClear}
            />
          </FormItem>
        );
      })}
      <FormItem className="flex justify-between">
        <ButtonText
          label={t('labels.addWallet')}
          mode="secondary"
          size="large"
          bgWhite
          onClick={handleAdd}
        />

        <Dropdown
          side="bottom"
          align="start"
          sideOffset={4}
          trigger={
            <ButtonIcon
              size="large"
              mode="secondary"
              icon={<IconMenuVertical />}
              data-testid="trigger"
              bgWhite
            />
          }
          listItems={[
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.resetAllEntries')}
                  bgWhite
                />
              ),
              callback: handleResetAll,
            },
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.deleteAllEntries')}
                  bgWhite
                />
              ),
              callback: handleDeleteAll,
            },
            {
              component: (
                <ListItemAction
                  title={t('labels.whitelistWallets.uploadCSV')}
                  bgWhite
                  mode="disabled"
                />
              ),
              callback: () => {},
            },
          ]}
        />
      </FormItem>
      <AccordionSummary
        total={controlledWallets.filter(wallet => wallet.address).length}
      />
    </AccordionMethod>
  );
};

export default AddAddresses;

const CustomHeader: React.FC = () => {
  const {t} = useTranslation();

  return (
    <div className="mb-1.5 space-y-0.5">
      <p className="text-base font-bold text-ui-800">
        {t('labels.addWallets')}
      </p>
      <p className="text-sm text-ui-600">{t('labels.addWalletsDescription')}</p>
    </div>
  );
};

export const FormItem = styled.div.attrs({
  className: 'px-3 py-1.5 bg-ui-0 border border-ui-100 border-t-0' as
    | string
    | undefined,
})``;
