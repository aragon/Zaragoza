import {
  ButtonText,
  ButtonIcon,
  Dropdown,
  IconMenuVertical,
  Label,
  ListItemAction,
} from '@aragon/ui-components';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';
import React, {useEffect} from 'react';
import {useFieldArray, useFormContext, useWatch} from 'react-hook-form';

import EmptyState from './emptyState';
import {AddressRow} from './addressRow';
import {AccordionMethod} from 'components/accordionMethod';
import {useActionsContext} from 'context/actions';

type Props = {
  index: number;
};

const AddAddresses: React.FC<Props> = ({index: actionIndex}) => {
  const {t} = useTranslation();
  const {removeAction} = useActionsContext();

  // form context
  const {control, trigger} = useFormContext();
  const memberWallets = useWatch({
    name: `actions.${actionIndex}.inputs.memberWallets`,
    control,
  });

  const {fields, update, replace, append, remove} = useFieldArray({
    control,
    name: `actions.${actionIndex}.inputs.memberWallets`,
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

    // disabling because I can. Jk, only need this to happen once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  // reset all rows
  const handleResetAll = () => {
    controlledWallets.forEach((_, index) => {
      update(index, {address: ''});
    });
  };

  // reset single row
  const handleRowReset = (index: number) => {
    update(index, {address: ''});

    // this is quite unfortunate, but now empty fields will all be validated
    // on row reset. Turn off required validation for row if that is not desired
    setTimeout(() => {
      trigger(`actions.${actionIndex}.inputs.memberWallets`);
    }, 50);
  };

  // remove all rows
  const handleDeleteAll = () => {
    replace([]);
  };

  // remove single row
  const handleRowDelete = (index: number) => {
    remove(index);
    setTimeout(() => {
      trigger(`actions.${actionIndex}.inputs.memberWallets`);
    }, 50);
  };

  // add empty wallet
  const handleAdd = () => {
    append({address: ''});
  };

  // separating this because rows sometimes don't have the same actions
  const rowActions = [
    {
      component: (
        <ListItemAction
          title={t('labels.whitelistWallets.resetEntry')}
          bgWhite
        />
      ),
      callback: (rowIndex: number) => {
        handleRowReset(rowIndex);
      },
    },
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
    >
      {controlledWallets.length === 0 ? (
        <EmptyState
          title={t('labels.whitelistWallets.noWallets')}
          subtitle={t('labels.whitelistWallets.addWalletsSubtitle')}
          buttonLabel={t('labels.addWallet')}
          onClick={handleAdd}
        />
      ) : (
        <>
          <FormItem className="hidden desktop:block pb-0">
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
                />
              </FormItem>
            );
          })}
          <FormItem className="flex justify-between">
            <ButtonText
              label="Add Wallet"
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
          <AccordionFooter>
            <BoldedText>Summary</BoldedText>
            <div className="flex justify-between">
              <p className="text-ui-600 ft-text-base">Total Wallets</p>
              <BoldedText>
                {controlledWallets.filter(wallet => wallet.address).length}
              </BoldedText>
            </div>
          </AccordionFooter>
        </>
      )}
    </AccordionMethod>
  );
};

export default AddAddresses;

export const FormItem = styled.div.attrs({
  className: 'p-3 bg-ui-0 border border-ui-100 border-t-0' as
    | string
    | undefined,
})``;

const AccordionFooter = styled.div.attrs({
  className:
    'space-y-1.5 p-3 bg-ui-0 rounded-b-xl border border-t-0 border-ui-100 ',
})``;

const BoldedText = styled.span.attrs({
  className: 'font-bold text-ui-800 ft-text-base',
})``;
