import type { SentReceived } from './types';

/**
 * Get the flow direction of the transaction item.
 * @param item - The transaction item.
 * @param perspectiveAddress - Is 'toLeft' or 'toRight' based on the perspective address.
 * @returns The flow direction of the transaction item.
 */
export function getFlowDirection(
  item: SentReceived,
  perspectiveAddress: string,
): 'toLeft' | 'toRight' {
  if (item.to.address && item.to.address.toLowerCase() === perspectiveAddress) {
    return 'toLeft';
  }

  if (
    item.from.address &&
    item.from.address.toLowerCase() === perspectiveAddress
  ) {
    return 'toRight';
  }

  return 'toRight'; // default case
}

/**
 * Get the left actor of the transaction item.
 * @param item - The transaction item.
 * @param perspectiveAddress - The perspective address.
 * @returns The left actor of the transaction item.
 */
export function getLeftActor(item: SentReceived, perspectiveAddress: string) {
  if (
    item.from.address &&
    item.from.address.toLowerCase() === perspectiveAddress
  ) {
    return { address: item.from.address, name: item.from.name };
  }

  if (item.to.address && item.to.address.toLowerCase() === perspectiveAddress) {
    return { address: item.to.address, name: item.to.name };
  }

  return { address: item.from.address, name: item.from.name };
}

/**
 * Get the right actor of the transaction item.
 * @param item - The transaction item.
 * @param perspectiveAddress - The perspective address.
 * @returns The right actor of the transaction item.
 */
export function getRightActor(item: SentReceived, perspectiveAddress: string) {
  if (
    item.from.address &&
    item.from.address.toLowerCase() === perspectiveAddress
  ) {
    return { address: item.to.address, name: item.to.name };
  }

  if (item.to.address && item.to.address.toLowerCase() === perspectiveAddress) {
    return { address: item.from.address, name: item.from.name };
  }

  return { address: item.to.address, name: item.to.name };
}

/**
 * Capitalize acronyms in a string.
 * @param sentence - The sentence to capitalize acronyms.
 * @returns The sentence with acronyms capitalized.
 */
function capitalizeAcronyms(sentence: string) {
  const acronymSet = new Set(['NFT']); // add more acronyms here if needed

  const words = sentence.split(' ');

  const capitalizedWords = words.map((word) => {
    const acronym = word.toUpperCase();
    if (acronymSet.has(acronym)) {
      return acronym.toUpperCase();
    }
    return word;
  });

  return capitalizedWords.join(' ');
}

/**
 * Convert a CamelCase string to a sentence.
 * @param camelCaseString - The CamelCase string to convert.
 * @returns The sentence with words separated by spaces and the first letter of each word capitalized.
 */
export function camelCaseToSentence(camelCaseString: string | undefined) {
  if (!camelCaseString) {
    return '';
  }

  let sentence = camelCaseString.replace(/([a-z])([A-Z])/gu, '$1 $2');
  sentence = sentence.replace(/([A-Z])([A-Z][a-z])/gu, '$1 $2');
  sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1);
  sentence = capitalizeAcronyms(sentence);
  return sentence;
}
