import {Client, VoteValues} from '@aragon/sdk-client';
import {DaoAction, PluginInstallItem} from '@aragon/sdk-client-common';
import {TokenCensus} from '@vocdoni/sdk';

export interface IBuildCreateDaoTransactionParams {
  client: Client;
  metadataUri: string;
  daoUri?: string;
  ensSubdomain?: string;
  trustedForwarder?: string;
  plugins: PluginInstallItem[];
}

export interface IBuildCreateMultisigProposalTransactionParams {
  client: Client;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  approve?: boolean;
  tryExecution?: boolean;
  metadataUri: string;
  pluginAddress: string;
}

export interface IBuildCreateTokenVotingProposalTransactionParams {
  client: Client;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  executeOnPass?: boolean;
  creatorVote?: VoteValues;
  metadataUri: string;
  pluginAddress: string;
}

export interface IBuildCreateGaslessProposalTransactionParams {
  client: Client;
  actions?: DaoAction[];
  startDate?: Date;
  endDate?: Date;
  pluginAddress: string;
  tokenCensus: TokenCensus;
  electionId: string;
}
