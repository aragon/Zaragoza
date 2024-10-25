import {useQuery} from '@tanstack/react-query';
import {IFeaturedDao} from 'services/aragon-backend/domain/dao';

const FEATURED_DAOS_URL =
  'https://raw.githubusercontent.com/aragon/app/develop/src/assets/data/featured.json';

const fetchFeaturedDaos = async (): Promise<IFeaturedDao[]> => {
  const response = await fetch(FEATURED_DAOS_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch featured DAOs');
  }

  const data: IFeaturedDao[] = await response.json();
  return data;
};

export const useFeaturedDaos = () => {
  return useQuery({queryKey: ['featuredDaos'], queryFn: fetchFeaturedDaos});
};
