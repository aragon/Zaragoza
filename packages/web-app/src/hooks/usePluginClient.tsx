import {
  ClientAddressList,
  ClientErc20,
  ContextPlugin,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useEffect, useState} from 'react';

import {useClient} from './useClient';

export type PluginTypes = 'erc20voting.dao.eth' | 'addresslistvoting.dao.eth';

/**
 * This hook can be used to build ERC20 or whitelist clients
 * @param pluginType Type of plugin for which a client is to be built. Note that
 * this is information that must be fetched. I.e., it might be unavailable on
 * first render. Therefore, it is typed as potentially undefined.
 * @method createErc20 By passing instance plugin address will create an
 * ERC20Client
 * @method createWhitelist By passing instance plugin address will create an
 * WhitelistClient
 * @returns The corresponding Client
 */
export const usePluginClient = (
  pluginAddress: Address,
  pluginType?: PluginTypes
): ClientErc20 | ClientAddressList | undefined => {
  const [pluginClient, setPluginClient] = useState<
    ClientErc20 | ClientAddressList | undefined
  >(undefined);
  const {client, context, contextParams} = useClient();

  useEffect(() => {
    if (!client || !context) {
      throw new Error('SDK client is not initialized correctly');
    }

    if (!pluginAddress || !pluginType) setPluginClient(undefined);
    else {
      switch (pluginType) {
        case 'erc20voting.dao.eth':
          setPluginClient(
            new ClientErc20(
              //TODO: replace when method fixed on SDK ContextPlugin.fromContext(context, pluginAddress)
              new ContextPlugin({...contextParams, pluginAddress})
            )
          );
          break;
        // FIXME: Fix this once the SDK Dummy dao plugin name got fixed
        case 'addreslistvoting.dao.eth' as 'addresslistvoting.dao.eth':
          setPluginClient(
            new ClientAddressList(
              //TODO: replace when method fixed on SDK ContextPlugin.fromContext(context, pluginAddress)
              new ContextPlugin({...contextParams, pluginAddress})
            )
          );
          break;
        default:
          throw new Error('The requested sdk type is invalid');
      }
    }
  }, [client, context, contextParams, pluginAddress, pluginType]);

  return pluginClient;
};
