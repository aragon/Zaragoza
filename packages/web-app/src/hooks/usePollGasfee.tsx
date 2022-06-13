import {constants} from 'ethers';
import {useCallback, useEffect, useState} from 'react';
import {IGasFeeEstimation} from '@aragon/sdk-client/dist/internal/interfaces/dao';

import {useNetwork} from 'context/network';
import {fetchTokenPrice} from 'services/prices';

/**
 * This hook returns the gas estimation for a particular transaction and
 * the price of the native token in USD
 *
 * NOTE: Due to what is assumed to be temporary design changes, this hook
 * does not yet poll for the gas fees on interval
 *
 * @param estimationFunction function that estimates gas fee
 * @returns the average and maximum gas fee estimations, native token price
 * in USD, an error object if an error occurred while estimating,
 * and a function to stop the interval polling
 */
export const usePollGasFee = (
  estimationFunction: () => Promise<IGasFeeEstimation | undefined>,
  shouldPoll = true
) => {
  const {network} = useNetwork();
  const [error, setError] = useState<Error | undefined>(undefined);
  const [maxFee, setMaxFee] = useState<BigInt | undefined>(undefined);
  const [averageFee, setAverageFee] = useState<BigInt | undefined>(undefined);
  const [tokenPrice, setTokenPrice] = useState<number>(0);

  // estimate gas for DAO creation
  useEffect(() => {
    async function getFeesAndPrice() {
      try {
        const results = await Promise.all([
          estimationFunction(),
          fetchTokenPrice(constants.AddressZero, network),
        ]);

        setTokenPrice(results[1] || 0);
        setMaxFee(results[0]?.max);
        setAverageFee(results[0]?.average);
      } catch (err) {
        setError(err as Error);
        console.log('Error fetching gas fees and price', err);
      }
    }

    if (shouldPoll) getFeesAndPrice();
  }, [averageFee, estimationFunction, maxFee, network, shouldPoll, tokenPrice]);

  // stop polling in anticipation for polling at interval
  const stopPolling = useCallback(() => {
    setMaxFee(undefined);
    setAverageFee(undefined);
    setTokenPrice(0);
  }, []);
  return {error, tokenPrice, maxFee, averageFee, stopPolling};
};
