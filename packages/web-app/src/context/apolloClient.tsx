import {
  ApolloClient,
  HttpLink,
  InMemoryCache,
  makeVar,
  NormalizedCacheObject,
} from '@apollo/client';
import {AddressListProposal, Deposit, Erc20Proposal} from '@aragon/sdk-client';
import {RestLink} from 'apollo-link-rest';
import {CachePersistor, LocalStorageWrapper} from 'apollo3-cache-persist';

import {
  BASE_URL,
  PENDING_DEPOSITS_KEY,
  PENDING_PROPOSALS_KEY,
  PENDING_VOTES_KEY,
  SUBGRAPH_API_URL,
  SupportedNetworks,
} from 'utils/constants';
import {customJSONReviver} from 'utils/library';
import {AddressListVote, Erc20ProposalVote} from 'utils/types';
import {PRIVACY_KEY} from './privacyContext';

const restLink = new RestLink({
  uri: BASE_URL,
});

const cache = new InMemoryCache();

// add the REST API's typename you want to persist here
const entitiesToPersist = ['tokenData'];

// check if cache should be persisted or restored based on user preferences
const value = localStorage.getItem(PRIVACY_KEY);
if (value && JSON.parse(value).functional) {
  const persistor = new CachePersistor({
    cache,
    // TODO: Check and update the size needed for the cache
    maxSize: 5242880, // 5 MiB
    storage: new LocalStorageWrapper(window.localStorage),
    debug: process.env.NODE_ENV === 'development',
    persistenceMapper: async (data: string) => {
      const parsed = JSON.parse(data);

      const mapped: Record<string, unknown> = {};
      const persistEntities: string[] = [];
      const rootQuery = parsed['ROOT_QUERY'];

      mapped['ROOT_QUERY'] = Object.keys(rootQuery).reduce(
        (obj: Record<string, unknown>, key: string) => {
          if (key === '__typename') return obj;

          const keyWithoutArgs = key.substring(0, key.indexOf('('));
          if (entitiesToPersist.includes(keyWithoutArgs)) {
            obj[key] = rootQuery[key];

            if (Array.isArray(rootQuery[key])) {
              const entities = rootQuery[key].map(
                (item: Record<string, unknown>) => item.__ref
              );
              persistEntities.push(...entities);
            } else {
              const entity = rootQuery[key].__ref;
              persistEntities.push(entity);
            }
          }

          return obj;
        },
        {__typename: 'Query'}
      );

      persistEntities.reduce((obj, key) => {
        obj[key] = parsed[key];
        return obj;
      }, mapped);

      return JSON.stringify(mapped);
    },
  });

  const restoreApolloCache = async () => {
    await persistor.restore();
  };

  restoreApolloCache();
}

export const rinkebyClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['rinkeby']})),
});

export const goerliClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['goerli']})),
});

const mumbaiClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['mumbai']})),
});

const arbitrumTestClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['arbitrum-test']})),
});

// TODO: remove undefined when all clients are defined
const client: Record<
  SupportedNetworks,
  ApolloClient<NormalizedCacheObject> | undefined
> = {
  ethereum: undefined,
  rinkeby: rinkebyClient,
  goerli: goerliClient,
  polygon: undefined,
  mumbai: mumbaiClient,
  arbitrum: undefined,
  'arbitrum-test': arbitrumTestClient,
};

type favoriteDAO = {
  daoAddress: string;
  daoName: string;
};
const selectedDAO = makeVar<favoriteDAO>({daoName: '', daoAddress: ''});
const favoriteDAOs = makeVar<Array<favoriteDAO>>([
  {
    daoAddress: '0x0ee165029b09d91a54687041adbc705f6376c67f',
    daoName: 'Lorax DAO',
  },
  {daoAddress: 'dao-name.dao.eth', daoName: 'DAO name'},
]);
selectedDAO(favoriteDAOs()[0]);

const depositTxs = JSON.parse(
  localStorage.getItem(PENDING_DEPOSITS_KEY) || '[]'
);
const pendingDeposits = makeVar<Deposit[]>(depositTxs);

// PENDING VOTES
type PendingVotes = {
  /** key is proposal id */
  [key: string]: AddressListVote | Erc20ProposalVote;
};
const pendingVotes = JSON.parse(
  localStorage.getItem(PENDING_VOTES_KEY) || '{}'
);
const pendingVotesVar = makeVar<PendingVotes>(pendingVotes);

// PENDING PROPOSAL
type PendingProposals = {
  /** key is proposal id */
  [key: string]: Erc20Proposal | AddressListProposal;
};
const pendingProposals = JSON.parse(
  localStorage.getItem(PENDING_PROPOSALS_KEY) || '{}',
  customJSONReviver
);
const pendingProposalsVar = makeVar<PendingProposals>(pendingProposals);

export {
  client,
  favoriteDAOs,
  selectedDAO,
  pendingDeposits,
  pendingProposalsVar,
  pendingVotesVar,
};
