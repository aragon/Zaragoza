import {IconLinkExternal, Link} from '@aragon/ods';
import {
  LIVE_CONTRACTS,
  SupportedNetworksArray,
} from '@aragon/sdk-client-common';
import React from 'react';
import {useTranslation} from 'react-i18next';

import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {shortenAddress, translateToNetworkishName} from 'utils/library';
import {
  DescriptionPair,
  FlexibleDefinition,
  SettingsCard,
  Term,
} from '../settingsCard';

export const VersionInfoCard: React.FC<{pluginAddress: string}> = ({
  pluginAddress,
}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const explorerEndpoint = CHAIN_METADATA[network].explorer + 'address/';

  let OSxAddress = '';
  const translatedNetwork = translateToNetworkishName(network);
  if (
    translatedNetwork !== 'unsupported' &&
    SupportedNetworksArray.includes(translatedNetwork)
  ) {
    OSxAddress = LIVE_CONTRACTS[translatedNetwork].daoFactoryAddress;
  }

  // TODO: generate the links
  return (
    <div
      className={
        'col-span-full desktop:col-span-4 desktop:col-start-8 desktop:row-start-3 mt-1 desktop:-mt-1 desktop:-ml-1'
      }
    >
      <SettingsCard title={t('setting.versionInfo.title')}>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelApp')}</Term>
          <FlexibleDefinition>
            <Link
              label={'Aragon App v0.1.29'}
              type="primary"
              iconRight={<IconLinkExternal />}
            />
          </FlexibleDefinition>
        </DescriptionPair>
        <DescriptionPair>
          <Term>{t('setting.versionInfo.labelOs')}</Term>
          <FlexibleDefinition>
            <Link
              label={'Aragon OSx v1.1.23'}
              description={OSxAddress ? shortenAddress(OSxAddress) : undefined}
              type="primary"
              href={explorerEndpoint + OSxAddress}
              iconRight={<IconLinkExternal />}
            />
          </FlexibleDefinition>
        </DescriptionPair>

        <DescriptionPair className="border-none">
          <Term>{t('setting.versionInfo.labelGovernance')}</Term>
          <FlexibleDefinition>
            <Link
              label={'Token voting v1.12'}
              description={shortenAddress(pluginAddress)}
              type="primary"
              href={explorerEndpoint + pluginAddress}
              iconRight={<IconLinkExternal />}
            />
          </FlexibleDefinition>
        </DescriptionPair>
      </SettingsCard>
    </div>
  );
};
