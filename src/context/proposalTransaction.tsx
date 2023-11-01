import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ExecuteProposalStep,
  VoteProposalParams,
  VoteProposalStep,
  VoteValues,
} from '@aragon/sdk-client';
import {useQueryClient} from '@tanstack/react-query';
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import PublishModal, {
  TransactionStateLabels,
} from 'containers/transactionModals/publishModal';
import {BigNumber} from 'ethers';
import {useDaoDetailsQuery} from 'hooks/useDaoDetails';
import {
  PluginTypes,
  isMultisigClient,
  isTokenVotingClient,
  usePluginClient,
} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {
  AragonSdkQueryItem,
  aragonSdkQueryKeys,
} from 'services/aragon-sdk/query-keys';
import {CHAIN_METADATA, TransactionState} from 'utils/constants';
import {executionStorage, voteStorage} from 'utils/localStorage';
import {ProposalId} from 'utils/types';
import {useNetwork} from './network';
import {useProviders} from './providers';

type SubmitVoteParams = {
  vote: VoteValues;
  votingPower: BigNumber;
  voteTokenAddress?: string;
  replacement?: boolean;
};

type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handlePrepareVote: (params: SubmitVoteParams) => void;
  handlePrepareApproval: (params: ApproveMultisigProposalParams) => void;
  handlePrepareExecution: () => void;
  isLoading: boolean;
  voteOrApprovalSubmitted: boolean;
  executionSubmitted: boolean;
  executionFailed: boolean;
  executionTxHash: string;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution.
 * Note: Break this up when new plugin is added
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id: urlId} = useParams();
  const proposalId = new ProposalId(urlId!).export();

  const {address, isConnected} = useWallet();
  const {network} = useNetwork();
  const queryClient = useQueryClient();
  const {api: provider} = useProviders();
  const {data: daoDetails, isLoading} = useDaoDetailsQuery();

  // state values
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecutionModal, setShowExecutionModal] = useState(false);
  const [voteTokenAddress, setVoteTokenAddress] = useState<string>();

  const [voteParams, setVoteParams] = useState<VoteProposalParams>();
  const [approvalParams, setApprovalParams] =
    useState<ApproveMultisigProposalParams>();

  const [votingPower, setVotingPower] = useState<BigNumber>(BigNumber.from(0));
  const [replacingVote, setReplacingVote] = useState(false);
  const [voteOrApprovalSubmitted, setVoteOrApprovalSubmitted] = useState(false);
  const [voteOrApprovalProcessState, setVoteOrApprovalProcessState] =
    useState<TransactionState>();

  const [executionFailed, setExecutionFailed] = useState(false);
  const [executionSubmitted, setExecuteSubmitted] = useState(false);
  const [executionProcessState, setExecutionProcessState] =
    useState<TransactionState>();

  const [executionTxHash, setExecutionTxHash] = useState<string>('');

  // intermediate values
  const pluginType = daoDetails?.plugins[0].id as PluginTypes;
  const pluginAddress = daoDetails?.plugins[0].instanceAddress;
  const pluginClient = usePluginClient(pluginType);

  const isMultisigPluginClient =
    !!pluginClient && isMultisigClient(pluginClient);
  const isTokenVotingPluginClient =
    !!pluginClient && isTokenVotingClient(pluginClient);

  const isWaitingForVoteOrApproval =
    (voteParams != null || approvalParams != null) &&
    voteOrApprovalProcessState === TransactionState.WAITING;

  const isWaitingForExecution =
    !!proposalId && executionProcessState === TransactionState.WAITING;

  const notInSuccessState =
    executionProcessState !== TransactionState.SUCCESS &&
    voteOrApprovalProcessState !== TransactionState.SUCCESS;

  const noActionsPending = !voteParams && !approvalParams && !proposalId;

  const shouldPollFees = isWaitingForVoteOrApproval || isWaitingForExecution;
  const shouldDisableModalCta = noActionsPending && notInSuccessState;

  /*************************************************
   *              Prepare Transactions             *
   *************************************************/
  const handlePrepareApproval = useCallback(
    (params: ApproveMultisigProposalParams) => {
      setApprovalParams(params);
      setShowVoteModal(true);
      setVoteOrApprovalProcessState(TransactionState.WAITING);
    },
    []
  );

  const handlePrepareVote = useCallback(
    (params: SubmitVoteParams) => {
      setVotingPower(params.votingPower);
      setReplacingVote(!!params.replacement);
      setVoteTokenAddress(params.voteTokenAddress);

      setVoteParams({proposalId, vote: params.vote});
      setShowVoteModal(true);
      setVoteOrApprovalProcessState(TransactionState.WAITING);
    },
    [proposalId]
  );

  const handlePrepareExecution = useCallback(() => {
    setShowExecutionModal(true);
    setExecutionProcessState(TransactionState.WAITING);
  }, []);

  /*************************************************
   *                  Estimations                  *
   *************************************************/
  const estimateVoteOrApprovalFees = useCallback(async () => {
    if (isTokenVotingPluginClient && voteParams && voteTokenAddress) {
      return pluginClient.estimation.voteProposal(voteParams);
    }

    if (isMultisigPluginClient && approvalParams) {
      return pluginClient.estimation.approveProposal(approvalParams);
    }
  }, [
    approvalParams,
    isMultisigPluginClient,
    isTokenVotingPluginClient,
    pluginClient,
    voteTokenAddress,
    voteParams,
  ]);

  const estimateExecutionFees = useCallback(async () => {
    return pluginClient?.estimation.executeProposal(proposalId);
  }, [pluginClient?.estimation, proposalId]);

  // estimation fees for voting on proposal/executing proposal
  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(
    showExecutionModal ? estimateExecutionFees : estimateVoteOrApprovalFees,
    shouldPollFees
  );

  /*************************************************
   *               Cleanup & Cache                 *
   *************************************************/
  const invalidateProposalQueries = useCallback(() => {
    const allProposalsQuery = [AragonSdkQueryItem.PROPOSALS];
    const currentProposal = aragonSdkQueryKeys.proposal({
      id: proposalId,
      pluginType,
    });

    queryClient.invalidateQueries(allProposalsQuery);
    queryClient.invalidateQueries(currentProposal);
  }, [pluginType, proposalId, queryClient]);

  const onExecutionSuccess = useCallback(
    async (proposalId: string, txHash: string) => {
      if (!address || !daoDetails?.address) return;

      // get current block number
      const executionBlockNumber = await provider.getBlockNumber();

      // details to be cached
      const executionDetails = {
        executionBlockNumber,
        executionDate: new Date(),
        executionTxHash: txHash,
      };

      // add execution detail to local storage
      executionStorage.addExecutionDetail(
        CHAIN_METADATA[network].id,
        proposalId.toString(),
        executionDetails
      );
    },
    [address, daoDetails?.address, network, provider]
  );

  // cleans up and caches successful approval tx
  const onApprovalSuccess = useCallback(
    async (
      proposalId: string,
      executedWithApproval: boolean,
      txHash: string
    ) => {
      // clean up state
      setApprovalParams(undefined);
      setVoteOrApprovalSubmitted(true);
      setVoteOrApprovalProcessState(TransactionState.SUCCESS);

      // cache multisig vote
      if (address) {
        voteStorage.addVote(
          CHAIN_METADATA[network].id,
          proposalId,
          address.toLowerCase()
        );
      }

      // executed while approving, cache execution as well
      if (executedWithApproval) {
        setExecutionTxHash(txHash);
        onExecutionSuccess(proposalId, txHash);
      }
    },
    [address, network, onExecutionSuccess]
  );

  // cleans up and caches successful vote
  const onVoteSuccess = useCallback(
    async (proposalId: string, vote: VoteValues, voteReplaced?: boolean) => {
      // cleanup state
      setVoteParams(undefined);
      setReplacingVote(false);
      setVoteOrApprovalSubmitted(true);
      setVoteOrApprovalProcessState(TransactionState.SUCCESS);

      // cache token-voting vote
      if (address != null && voteTokenAddress != null) {
        // fetch token user balance, ie vote weight
        try {
          const voteToPersist = {
            address: address.toLowerCase(),
            vote,
            weight: votingPower.toBigInt(),
            voteReplaced: !!voteReplaced,
          };

          // store in local storage
          voteStorage.addVote(
            CHAIN_METADATA[network].id,
            proposalId.toString(),
            voteToPersist
          );
        } catch (error) {
          console.error(error);
        }
      }

      setVotingPower(BigNumber.from(0));
    },
    [address, network, voteTokenAddress, votingPower]
  );

  // handles closing vote/approval modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteOrApprovalProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowVoteModal(false);
        invalidateProposalQueries();

        break;
      default: {
        setShowVoteModal(false);
        stopPolling();
      }
    }
  }, [invalidateProposalQueries, stopPolling, voteOrApprovalProcessState]);

  // handles closing execute modal
  const handleCloseExecuteModal = useCallback(() => {
    switch (executionProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowExecutionModal(false);
          setExecuteSubmitted(true);
          invalidateProposalQueries();
        }
        break;
      default: {
        setShowExecutionModal(false);
        stopPolling();
      }
    }
  }, [executionProcessState, invalidateProposalQueries, stopPolling]);

  /*************************************************
   *              Submit Transactions              *
   *************************************************/
  const handleVoteOrApprovalTx = () => {
    // tx already successful close modal
    if (voteOrApprovalProcessState === TransactionState.SUCCESS) {
      handleCloseVoteModal();
      return;
    }

    if (
      (voteParams == null && approvalParams == null) ||
      voteOrApprovalProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    setVoteOrApprovalProcessState(TransactionState.LOADING);

    if (pluginType === 'multisig.plugin.dao.eth' && approvalParams) {
      handleMultisigApproval(approvalParams);
    } else if (pluginType === 'token-voting.plugin.dao.eth' && voteParams) {
      handleTokenVotingVote(voteParams);
    }
  };

  const handleMultisigApproval = useCallback(
    async (params: ApproveMultisigProposalParams) => {
      if (!isMultisigPluginClient) return;

      const approveSteps = pluginClient.methods.approveProposal(params);
      if (!approveSteps) {
        throw new Error('Approval function is not initialized correctly');
      }

      setVoteOrApprovalSubmitted(false);

      // tx hash is necessary for caching when approving and executing
      // at the same time
      let txHash = '';
      try {
        for await (const step of approveSteps) {
          switch (step.key) {
            case ApproveProposalStep.APPROVING:
              txHash = step.txHash;
              break;
            case ApproveProposalStep.DONE:
              onApprovalSuccess(params.proposalId, params.tryExecution, txHash);
              break;
          }
        }
      } catch (error) {
        console.error(error);
        setVoteOrApprovalProcessState(TransactionState.ERROR);
      }
    },
    [isMultisigPluginClient, onApprovalSuccess, pluginClient?.methods]
  );

  const handleTokenVotingVote = useCallback(
    async (params: VoteProposalParams) => {
      if (!isTokenVotingPluginClient) return;

      const voteSteps = pluginClient.methods.voteProposal(params);
      if (!voteSteps) {
        throw new Error('Voting function is not initialized correctly');
      }

      // clear up previous submission state
      setVoteOrApprovalSubmitted(false);

      try {
        for await (const step of voteSteps) {
          switch (step.key) {
            case VoteProposalStep.VOTING:
              console.log(step.txHash);
              break;
            case VoteProposalStep.DONE:
              onVoteSuccess(params.proposalId, params.vote, replacingVote);
              break;
          }
        }
      } catch (err) {
        console.error(err);
        setVoteOrApprovalProcessState(TransactionState.ERROR);
      }
    },
    [
      isTokenVotingPluginClient,
      onVoteSuccess,
      pluginClient?.methods,
      replacingVote,
    ]
  );

  // handles proposal execution
  const handleProposalExecution = useCallback(async () => {
    if (executionProcessState === TransactionState.SUCCESS) {
      handleCloseExecuteModal();
      return;
    }
    if (!proposalId || executionProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    if (!isConnected) {
      open('wallet');
      return;
    }

    // start proposal execution
    setExecutionProcessState(TransactionState.LOADING);

    const executeSteps = pluginClient?.methods.executeProposal(proposalId);
    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    try {
      let txHash = '';

      for await (const step of executeSteps) {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            setExecutionTxHash(step.txHash);
            txHash = step.txHash;
            break;
          case ExecuteProposalStep.DONE:
            onExecutionSuccess(proposalId, txHash);
            setExecutionFailed(false);
            setExecutionProcessState(TransactionState.SUCCESS);
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setExecutionFailed(true);
      setExecutionProcessState(TransactionState.ERROR);
    }
  }, [
    executionProcessState,
    proposalId,
    pluginAddress,
    isConnected,
    pluginClient?.methods,
    handleCloseExecuteModal,
    onExecutionSuccess,
  ]);

  const value = useMemo(
    () => ({
      handlePrepareVote,
      handlePrepareApproval,
      handlePrepareExecution,
      isLoading,
      voteOrApprovalSubmitted,
      executionSubmitted,
      executionFailed,
      executionTxHash,
    }),
    [
      handlePrepareVote,
      handlePrepareApproval,
      handlePrepareExecution,
      isLoading,
      voteOrApprovalSubmitted,
      executionSubmitted,
      executionFailed,
      executionTxHash,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  // modal values
  const isExecutionContext = showExecutionModal;
  const isVotingContext = showVoteModal;

  const state =
    (isExecutionContext ? executionProcessState : voteOrApprovalProcessState) ??
    TransactionState.WAITING;

  let title = isVotingContext
    ? t('labels.signVote')
    : t('labels.signExecuteProposal');

  const labels: TransactionStateLabels = {
    [TransactionState.WAITING]: isVotingContext
      ? t('governance.proposals.buttons.vote')
      : t('governance.proposals.buttons.execute'),
  };

  if (isVotingContext && pluginType === 'multisig.plugin.dao.eth') {
    title = t('transactionModal.multisig.title.approveProposal');
    labels.WAITING = t('transactionModal.multisig.ctaApprove');
    labels.LOADING = t('transactionModal.multisig.ctaWaitingConfirmation');
    labels.SUCCESS = t('transactionModal.multisig.ctaContinueProposal');

    if (approvalParams?.tryExecution) {
      title = t('transactionModal.multisig.title.approveExecute');
      labels.WAITING = t('transactionModal.multisig.ctaApproveExecute');
    }
  }

  const isOpen = showVoteModal || showExecutionModal;

  const onClose = isExecutionContext
    ? handleCloseExecuteModal
    : handleCloseVoteModal;

  const closeOnDrag = isExecutionContext
    ? executionProcessState !== TransactionState.LOADING
    : voteOrApprovalProcessState !== TransactionState.LOADING;

  const callback = isExecutionContext
    ? handleProposalExecution
    : handleVoteOrApprovalTx;

  return (
    <ProposalTransactionContext.Provider value={value}>
      {children}
      <PublishModal
        title={title}
        buttonStateLabels={labels}
        state={state}
        isOpen={isOpen}
        onClose={onClose}
        callback={callback}
        closeOnDrag={closeOnDrag}
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
        gasEstimationError={gasEstimationError}
        disabledCallback={shouldDisableModalCta}
      />
    </ProposalTransactionContext.Provider>
  );
};

function useProposalTransactionContext(): ProposalTransactionContextType {
  const context = useContext(ProposalTransactionContext);

  if (context === null) {
    throw new Error(
      'useProposalTransactionContext() can only be used on the descendants of <UseProposalTransactionProvider />'
    );
  }
  return context;
}

export {ProposalTransactionProvider, useProposalTransactionContext};
