import {ButtonText, ListItemBlockchain} from '@aragon/ods-old';
import React, {useMemo, useState} from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {useNetwork} from 'context/network';
import useScreen from 'hooks/useScreen';
import {CHAIN_METADATA, SupportedNetworks} from 'utils/constants';
import {featureFlags} from 'utils/featureFlags';

type NetworkType = 'main' | 'test';

const SelectChainForm: React.FC = () => {
  const {t} = useTranslation();
  const {isMobile} = useScreen();
  const {setNetwork, network} = useNetwork();
  const {control, resetField} = useFormContext();

  const [networkType, setNetworkType] = useState<NetworkType>(
    CHAIN_METADATA[network].isTestnet ? 'test' : 'main'
  );

  const availableNetworks = useMemo(
    () =>
      networks[networkType]['popularity'].filter(
        n =>
          // uppercase SupportedNetwork name is used for the flag
          // also replace hyphens with underscores
          featureFlags.getValue(
            `VITE_FEATURE_FLAG_${n.replace(/-/g, '_').toUpperCase()}`
          ) !== 'false'
      ),
    [networkType]
  );

  return (
    <>
      <Header>
        <NetworkTypeSwitcher>
          <ButtonText
            mode="ghost"
            bgWhite
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.mainNet')}
            isActive={networkType === 'main'}
            onClick={() => {
              setNetworkType('main');
            }}
          />
          <ButtonText
            mode="ghost"
            bgWhite
            size={isMobile ? 'small' : 'medium'}
            label={t('labels.testNet')}
            isActive={networkType === 'test'}
            onClick={() => setNetworkType('test')}
          />
        </NetworkTypeSwitcher>
      </Header>
      <FormItem>
        {availableNetworks.map(selectedNetwork => (
          <Controller
            key={selectedNetwork}
            name="blockchain"
            rules={{required: true}}
            control={control}
            render={({field}) => (
              <ListItemBlockchain
                onClick={() => {
                  setNetwork(selectedNetwork);
                  field.onChange({
                    id: CHAIN_METADATA[selectedNetwork].id,
                    label: CHAIN_METADATA[selectedNetwork].name,
                    network: networkType,
                  });
                  if (!CHAIN_METADATA[selectedNetwork].supportsEns) {
                    // reset daoEnsName if network changed to L2
                    resetField('daoEnsName');
                  }
                }}
                selected={CHAIN_METADATA[selectedNetwork].id === field.value.id}
                {...CHAIN_METADATA[selectedNetwork]}
              />
            )}
          />
        ))}
      </FormItem>
    </>
  );
};

export default SelectChainForm;

const Header = styled.div.attrs({className: 'flex justify-between'})``;

const NetworkTypeSwitcher = styled.div.attrs({
  className: 'flex p-0.5 space-x-0.25 bg-ui-0 rounded-xl',
})``;

const FormItem = styled.div.attrs({
  className: 'space-y-1.5',
})``;

// Note: Default Network name in polygon network is different than Below list
type SelectableNetworks = Record<
  NetworkType,
  {
    cost: SupportedNetworks[];
    popularity: SupportedNetworks[];
    security: SupportedNetworks[];
  }
>;

// TODO: enable base in the network selection
const networks: SelectableNetworks = {
  main: {
    cost: ['polygon', 'base', 'ethereum'],
    popularity: ['ethereum', 'polygon', 'base'],
    security: ['ethereum', 'base', 'polygon'],
  },
  test: {
    cost: ['mumbai', 'base-goerli', 'goerli'],
    popularity: ['goerli', 'mumbai', 'base-goerli'],
    security: ['goerli', 'base-goerli', 'mumbai'],
  },
};
