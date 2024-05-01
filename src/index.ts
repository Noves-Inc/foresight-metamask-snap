import {
  row,
  panel,
  heading,
  text,
  divider,
  address,
} from '@metamask/snaps-sdk';
import type { OnTransactionHandler } from '@metamask/snaps-types';

import type { ChainsResponse } from './types';
import {
  getFlowDirection,
  getLeftActor,
  getRightActor,
  camelCaseToSentence,
} from './utils';

/**
 * Handler for the transaction event.
 * @param options - The options object.
 * @param options.transaction - The transaction object.
 * @param options.chainId - The chain ID.
 * @returns The transaction panel.
 */
export const onTransaction: OnTransactionHandler = async ({
  transaction,
  chainId,
}) => {
  const currentGasPrice = await window.ethereum.request({
    method: 'eth_gasPrice',
  });

  const currentGasPriceInWei = currentGasPrice ?? '';

  const postData = {
    transaction: {
      ...transaction,
      data: transaction.data ?? '',
      gasPrice: transaction.gasPrice ?? currentGasPriceInWei,
      type: transaction.type ?? '0x2',
      maxFeePerGas: transaction.maxFeePerGas ?? '',
      maxPriorityFeePerGas: transaction.maxPriorityFeePerGas ?? '',
    },
  };

  const header = 'If confirmed, this tx:';
  let description = '';
  let panelContent: any[] = [];

  try {
    const decimalChainId = parseInt(chainId.split(':')[1], 16);

    const chainsRes = await fetch(
      'https://foresight-snap-gateway.noves.fi/evm/chains',
      {
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
      },
    );

    const chains: ChainsResponse[] = await chainsRes.json();

    let chain = chains.find((_chain) => _chain.evmChainId === decimalChainId);

    if (!chain) {
      chain = chains.find(
        (_chain) => _chain.evmChainId === parseInt(chainId.split(':')[1], 10),
      );
    }

    const res = await fetch(
      `https://foresight-snap-gateway.noves.fi/evm/${chain?.name}/preview`,
      {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const data = await res.json();

    if (res.ok) {
      description = data.classificationData.description;

      const perspectiveAddress = transaction.from.toLowerCase();

      const sentItems = data.classificationData.sent;
      const receivedItems = data.classificationData.received;

      const sentItemsPaidGas = sentItems.filter(
        (item: { action: string }) => item.action === 'paidGas',
      );
      const sentItemsOther = sentItems.filter(
        (item: { action: string }) => item.action !== 'paidGas',
      );

      const txItems = [
        ...sentItemsOther,
        ...receivedItems,
        ...sentItemsPaidGas,
      ];

      const items = txItems.map((item: any) => {
        const action = {
          label: item.action,
          amount: item.amount || undefined,
          flowDirection: getFlowDirection(item, perspectiveAddress),
          nft: item.nft || undefined,
          token: item.token || undefined,
        };
        const rightActor = getRightActor(item, perspectiveAddress);
        const leftActor = getLeftActor(item, perspectiveAddress);
        return { action, rightActor, leftActor };
      });

      panelContent = [
        text(header),
        heading(description),
        divider(),
        heading('Balance changes'),
      ];

      // Balance changes view
      items.forEach((item) => {
        panelContent.push(
          text(
            `${item.action.flowDirection === 'toRight' ? '⛔' : '✅'}
            ${item.action.flowDirection === 'toRight' ? '**-**' : '**+**'}
            ${String(item.action.amount)}
            ${item.action.token?.symbol?.toString() ||
            (item.action.nft && item.action.nft?.symbol?.toString())
            }`,
          ),
        );
      });

      panelContent.push(divider(), heading('Details'));
      // Flow view
      items.forEach((item, index) => {
        const fromActor =
          item.action.flowDirection === 'toLeft'
            ? item.rightActor
            : item.leftActor;
        const toActor =
          item.action.flowDirection === 'toLeft'
            ? item.leftActor
            : item.rightActor;
        panelContent.push(
          row(
            `${item.action.flowDirection === 'toRight' ? '⛔' : '✅'} ${camelCaseToSentence(item.action.label)}`,
            text(
              `${item.action.amount} ${item.action.token?.symbol || item.action.nft?.symbol
              }`,
            ),
          ),
          row(
            'From: ',
            address(
              fromActor.address ??
              '0x0000000000000000000000000000000000000000',
            ),
          ),
          row(
            'To: ',
            address(
              toActor.address ??
              '0x0000000000000000000000000000000000000000',
            ),
          ),
        );
        if (index < items.length - 1) {
          panelContent.push(divider());
        }
      });

      return {
        content: panel(panelContent),
      };
    }
  } catch (error) {
    console.error(error);
  }
};
