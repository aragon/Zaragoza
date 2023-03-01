import {Client, Context as SdkContext, ContextParams} from '@aragon/sdk-client';
import {useNetwork} from 'context/network';
import React, {createContext, useContext, useEffect, useState} from 'react';
import {
  CHAIN_METADATA,
  IPFS_ENDPOINT_MAIN_0,
  IPFS_ENDPOINT_MAIN_1,
  IPFS_ENDPOINT_TEST,
  SUBGRAPH_API_URL,
} from 'utils/constants';

import {useWallet} from './useWallet';

interface ClientContext {
  client?: Client;
  context?: SdkContext;
}

const UseClientContext = createContext<ClientContext>({} as ClientContext);

export const useClient = () => {
  const client = useContext(UseClientContext);
  if (client === null) {
    throw new Error(
      'useClient() can only be used on the descendants of <UseClientProvider />'
    );
  }
  return client;
};

export const UseClientProvider: React.FC = ({children}) => {
  const {signer} = useWallet();
  const [client, setClient] = useState<Client>();
  const {network} = useNetwork();
  const [context, setContext] = useState<SdkContext>();

  useEffect(() => {
    let ipfsNodes = [
      {
        url: IPFS_ENDPOINT_MAIN_0,
        headers: {
          'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
        },
      },
      {
        url: IPFS_ENDPOINT_MAIN_1,
        headers: {
          'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
        },
      },
    ];
    if (network !== 'ethereum') {
      ipfsNodes = [
        {
          url: IPFS_ENDPOINT_TEST,
          headers: {
            'X-API-KEY': (import.meta.env.VITE_IPFS_API_KEY as string) || '',
          },
        },
      ];
    }
    const contextParams: ContextParams = {
      //TODO: replace ethereum with mainnet for network
      network: network === 'ethereum' ? 'mainnet' : network,
      signer: signer || undefined,
      web3Providers: CHAIN_METADATA[network].rpc[0],
      ipfsNodes,
      graphqlNodes: [
        {
          url: SUBGRAPH_API_URL[network]!,
        },
      ],
    };

    const sdkContext = new SdkContext(contextParams);

    setClient(new Client(sdkContext));
    setContext(sdkContext);
  }, [network, signer]);

  const value: ClientContext = {
    client,
    context,
  };

  return (
    <UseClientContext.Provider value={value}>
      {children}
    </UseClientContext.Provider>
  );
};
