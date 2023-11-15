import {QueryKey} from '@tanstack/react-query';
import {ProposalStatus} from '@aragon/sdk-client-common';

import type {
  IFetchDelegateeParams,
  IFetchMemberParams,
  IFetchMembersParams,
  IFetchPastVotingPowerParams,
  IFetchProposalParams,
  IFetchProposalsParams,
  IFetchVotingPowerParams,
  IFetchVotingSettingsParams,
} from './aragon-sdk-service.api';
import {SupportedNetworks} from 'utils/constants';

export enum AragonSdkQueryItem {
  DELEGATEE = 'DELEGATEE',
  MEMBERS = 'MEMBERS',
  PAST_VOTING_POWER = 'PAST_VOTING_POWER',
  PROPOSAL = 'PROPOSAL',
  PROPOSALS = 'PROPOSALS',
  LOCAL_PROPOSALS = 'LOCAL_PROPOSALS',
  PROTOCOL_VERSION = 'PROTOCOL_VERSION',
  VOTING_POWER = 'VOTING_POWER',
  VOTING_SETTINGS = 'VOTING_SETTINGS',
  GET_MEMBER = 'GET_MEMBER',
  RELEASE_NOTES = 'RELEASE_NOTES',
}

// Add address and network parameters to all query keys to use the most updated DAO plugin client
export interface IAragonSdkBaseParams {
  address: string;
  network: SupportedNetworks;
}

export const aragonSdkQueryKeys = {
  delegatee: (
    baseParams: IAragonSdkBaseParams,
    params: IFetchDelegateeParams
  ): QueryKey => [AragonSdkQueryItem.DELEGATEE, baseParams, params],
  members: (params: IFetchMembersParams): QueryKey => [
    AragonSdkQueryItem.MEMBERS,
    params,
  ],
  pastVotingPower: (params: IFetchPastVotingPowerParams): QueryKey => [
    AragonSdkQueryItem.PAST_VOTING_POWER,
    params,
  ],
  proposal: (params: IFetchProposalParams): QueryKey => [
    AragonSdkQueryItem.PROPOSAL,
    params,
  ],
  localProposals: (params?: ProposalStatus): QueryKey => [
    AragonSdkQueryItem.LOCAL_PROPOSALS,
    params,
  ],
  proposals: (params: IFetchProposalsParams): QueryKey => [
    AragonSdkQueryItem.PROPOSALS,
    params,
  ],
  protocolVersion: (daoAddressOrEns: string): QueryKey => [
    AragonSdkQueryItem.PROTOCOL_VERSION,
    daoAddressOrEns,
  ],
  votingPower: (params: IFetchVotingPowerParams): QueryKey => [
    AragonSdkQueryItem.VOTING_POWER,
    params,
  ],
  votingSettings: (params: IFetchVotingSettingsParams): QueryKey => [
    AragonSdkQueryItem.VOTING_SETTINGS,
    params,
  ],
  getMember: (
    baseParams: IAragonSdkBaseParams,
    params: IFetchMemberParams
  ): QueryKey => [AragonSdkQueryItem.GET_MEMBER, baseParams, params],
  releaseNotes: (): QueryKey => [AragonSdkQueryItem.RELEASE_NOTES],
};
