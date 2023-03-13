import {ApolloProvider} from '@apollo/client';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';

import {AlertProvider} from 'context/alert';
import {client, goerliClient} from 'context/apolloClient';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {infuraApiKey, walletConnectProjectID} from 'utils/constants';

import {
  EthereumClient,
  modalConnectors,
  walletConnectProvider,
} from '@web3modal/ethereum';
import {Web3Modal} from '@web3modal/react';
import {configureChains, createClient, mainnet, WagmiConfig} from 'wagmi';
import {goerli} from 'wagmi/chains';
import {LedgerConnector} from '@wagmi/connectors/ledger';
import {infuraProvider} from 'wagmi/providers/infura';

import App from './app';

const chains = [mainnet, goerli];

// Wagmi client
const {provider} = configureChains(chains, [
  walletConnectProvider({projectId: walletConnectProjectID}),
  infuraProvider({apiKey: infuraApiKey}),
]);
const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    ...modalConnectors({
      projectId: walletConnectProjectID,
      version: '2',
      appName: 'Aragon',
      chains,
    }),
    new LedgerConnector({
      chains: [mainnet],
    }),
  ],
  provider,
});

// Web3Modal Ethereum Client
const ethereumClient = new EthereumClient(wagmiClient, chains);

ReactDOM.render(
  <>
    <React.StrictMode>
      <PrivacyContextProvider>
        <APMProvider>
          <Router>
            <AlertProvider>
              <WagmiConfig client={wagmiClient}>
                <NetworkProvider>
                  <UseClientProvider>
                    <UseCacheProvider>
                      <ProvidersProvider>
                        <TransactionDetailProvider>
                          <WalletMenuProvider>
                            <GlobalModalsProvider>
                              {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                              <ApolloProvider
                                client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                              >
                                <App />
                              </ApolloProvider>
                            </GlobalModalsProvider>
                          </WalletMenuProvider>
                        </TransactionDetailProvider>
                      </ProvidersProvider>
                    </UseCacheProvider>
                  </UseClientProvider>
                </NetworkProvider>
              </WagmiConfig>
            </AlertProvider>
          </Router>
        </APMProvider>
      </PrivacyContextProvider>
    </React.StrictMode>
    <Web3Modal
      projectId={walletConnectProjectID}
      ethereumClient={ethereumClient}
      themeMode="light"
    />
  </>,
  document.getElementById('root')
);
