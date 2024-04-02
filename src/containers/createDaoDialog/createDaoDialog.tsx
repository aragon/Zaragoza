import React, {useState} from 'react';
import {ModalProps} from '@aragon/ods-old';
import {TransactionDialog} from 'containers/transactionDialog';
import {useNetwork} from 'context/network';
import {useCreateDaoTransaction} from 'services/transactions/queries/useCreateDaoTransaction';
import {createDaoUtils} from './utils';
import {useFormContext} from 'react-hook-form';
import {CreateDaoFormData} from 'utils/types';
import {IBuildCreateDaoTransactionParams} from 'services/transactions/transactionsService.api';
import {generatePath, useNavigate} from 'react-router-dom';
import {Dashboard} from 'utils/paths';
import {useClient} from 'hooks/useClient';
import {useSendCreateDaoTransaction} from './hooks';
import {CreateDaoDialogSteps} from './createDaoDialogSteps';

export interface ICreateDaoDialogProps extends ModalProps {}

const createDaoProcess = 'CREATE_DAO';

export const CreateDaoDialog: React.FC<ICreateDaoDialogProps> = props => {
  const {isOpen, ...otherProps} = props;

  const {network} = useNetwork();
  const {client} = useClient();
  const navigate = useNavigate();

  const {getValues} = useFormContext<CreateDaoFormData>();
  const formValues = getValues();

  const [metadataCid, setMetadataCid] = useState<string>();

  const createDaoParams = createDaoUtils.buildCreateDaoParams(
    formValues,
    metadataCid
  );

  const {data: transaction, isInitialLoading: isTransactionLoading} =
    useCreateDaoTransaction(
      {...createDaoParams, client} as IBuildCreateDaoTransactionParams,
      {enabled: createDaoParams != null && client != null}
    );

  const sendTransactionResults = useSendCreateDaoTransaction({
    process: createDaoProcess,
    transaction,
    metadataCid,
    createDaoParams,
  });

  const onSuccessButtonClick = () => {
    const {daoAddress} = createDaoUtils.getDaoAddressesFromReceipt(
      sendTransactionResults.txReceipt
    )!;
    const daoPathParams = {network, dao: daoAddress};
    const daoPath = generatePath(Dashboard, daoPathParams);
    navigate(daoPath);

    if (network === 'ethereum') {
      open('poapClaim');
    }
  };

  return (
    <TransactionDialog
      title="Deploy your DAO"
      isOpen={isOpen}
      sendTransactionResult={sendTransactionResults}
      displayTransactionStatus={transaction != null}
      sendTransactionLabel="Deploy DAO now"
      successButton={{
        label: 'Launch DAO Dashboard',
        onClick: onSuccessButtonClick,
      }}
      {...otherProps}
    >
      <CreateDaoDialogSteps
        process={createDaoProcess}
        isLoading={isTransactionLoading}
        onPinDaoMetadataSuccess={setMetadataCid}
        pinMetadata={isOpen}
      />
    </TransactionDialog>
  );
};
