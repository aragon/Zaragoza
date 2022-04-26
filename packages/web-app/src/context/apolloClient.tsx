import {ApolloClient, HttpLink, InMemoryCache, makeVar} from '@apollo/client';
import {RestLink} from 'apollo-link-rest';
import {CachePersistor, LocalStorageWrapper} from 'apollo3-cache-persist';
import {BASE_URL, SUBGRAPH_API_URL} from 'utils/constants';
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

const rinkebyClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['rinkeby']})),
});

const mumbaiClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['mumbai']})),
});

const arbitrumTestClient = new ApolloClient({
  cache,
  link: restLink.concat(new HttpLink({uri: SUBGRAPH_API_URL['arbitrum-test']})),
});

const client = {
  main: undefined,
  rinkeby: rinkebyClient,
  polygon: undefined,
  mumbai: mumbaiClient,
  arbitrum: undefined,
  arbitrumTest: arbitrumTestClient,
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

export {client, favoriteDAOs, selectedDAO};
