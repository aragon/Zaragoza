import {useTranslation} from 'react-i18next';
import {ActionParameter, HookData} from 'utils/types';
import {useDaoWhitelist} from './useDaoMembers';

export function useDaoActions(dao: string): HookData<ActionParameter[]> {
  const {data: whitelist, isLoading, error} = useDaoWhitelist(dao);
  const {t} = useTranslation();

  const baseActions: ActionParameter[] = [
    {
      type: 'withdraw_assets',
      title: t('AddActionModal.withdrawAssets'),
      subtitle: t('AddActionModal.withdrawAssetsSubtitle'),
    },
    {
      type: 'modify_settings',
      // TODO: Replace these with proper copies and i18n.
      title: 'Modify Settings',
      subtitle: 'Propose new settings for your DAO',
    },
    {
      type: 'external_contract',
      title: t('AddActionModal.externalContract'),
      subtitle: t('AddActionModal.externalContractSubtitle'),
    },
  ];

  const whitelistActions = baseActions.concat([
    {
      type: 'add_address',
      title: t('AddActionModal.addAddresses'),
      subtitle: t('AddActionModal.addAddressesSubtitle'),
    },
    {
      type: 'remove_address',
      title: t('AddActionModal.removeAddresses'),
      subtitle: t('AddActionModal.removeAddressesSubtitle'),
    },
  ]);

  const erc20Actions = baseActions.concat([
    {
      type: 'mint_token',
      title: t('AddActionModal.mintTokens'),
      subtitle: t('AddActionModal.mintTokensSubtitle'),
    },
  ]);
  return {
    data: whitelist ? whitelistActions : erc20Actions,
    isLoading: isLoading,
    error: error,
  };
}
