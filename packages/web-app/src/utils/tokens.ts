import {BaseTokenInfo} from './types';

/**
 * This method sorts a list of array information. It is applicable to any field
 * of the information object that can be compared using '<', '>'.
 *
 * @param tokens List of token (basic) token information
 * @param criteria Field of the information object that determines the sort
 * order. Must be a key of BaseTokenInfo
 *
 * @example sortTokens(baseTokenInfos[], 'name');
 * @example sortTokens(baseTokenInfos[], 'count');
 */
export function sortTokens<K extends keyof BaseTokenInfo>(
  tokens: BaseTokenInfo[],
  criteria: K
) {
  function sorter(a: BaseTokenInfo, b: BaseTokenInfo) {
    if (a[criteria] < b[criteria]) {
      return -1;
    }
    if (a[criteria] > b[criteria]) {
      return 1;
    }
    return 0;
  }

  tokens.sort(sorter);
}

/**
 * This method filters a list of array information. It searches the searchTerm
 * in the tokens name, symbol and address.
 *
 * @param tokens List of (basic) token information
 * @param searchTerm Term to search for in information
 * @returns Filtered list of (basic) token information that contains search
 * term.
 */
export function filterTokens(tokens: BaseTokenInfo[], searchTerm: string) {
  function tokenInfoMatches(token: BaseTokenInfo, term: string) {
    const lowercaseTerm = term.toLocaleLowerCase();
    const lowercaseSymbol = token.symbol.toLocaleLowerCase();
    const lowercaseAddress = token.address.toLocaleLowerCase();
    const lowercaseName = token.name.toLocaleLowerCase();
    return (
      lowercaseSymbol.indexOf(lowercaseTerm) >= 0 ||
      lowercaseName.indexOf(lowercaseTerm) >= 0 ||
      lowercaseAddress.indexOf(lowercaseTerm) >= 0
    );
  }

  if (!searchTerm) return tokens;

  return tokens.filter(t => tokenInfoMatches(t, searchTerm));
}
