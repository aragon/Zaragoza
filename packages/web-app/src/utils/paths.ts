import {SupportedNetworks} from './constants';

/* TOP LEVEL PAGES ========================================================== */
export const Landing = '/';
export const CreateDAO = '/create';
export const NotFound = '/not-found';

/* DAO-SPECIFIC PAGES ======================================================= */

export const Dashboard = '/:network/dashboard';
export const Governance = '/:network/governance';
export const Finance = '/:network/finance';
export const Community = '/:network/community';
export const Settings = '/:network/settings';

export const AllTokens = '/:network/finance/tokens';
export const AllTransfers = '/:network/finance/transfers';
export const NewDeposit = '/:network/finance/new-deposit';
export const NewWithDraw = '/:network/finance/new-withdraw';

export const Proposal = '/:network/governance/proposals/:id';
export const NewProposal = '/:network/governance/new-proposal';

/**
 * Replaces the network parameter in certain URLs. If the path passed to this
 * function has no parameter, the function will return that path unchanged.
 *
 * @param path parametrized path that needs its paramter replaced
 * @param network network paramater that will replace ":network" in the path
 * @returns concrete path with network.
 */
export function replaceNetworkParam(path: string, network: SupportedNetworks) {
  const crumbs = path.split('/');
  if (crumbs[1] === ':network') {
    crumbs[1] = network;
    return crumbs.join('/');
  }

  if (crumbs.some(s => s === ':network')) {
    throw Error(
      'URL is malformed. Network paramater is expected to either be the first parameter or not be in the URL at all.'
    );
  }

  return path;
}
