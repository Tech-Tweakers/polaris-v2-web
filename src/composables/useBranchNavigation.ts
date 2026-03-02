import type { IMessage } from '../interfaces/chatTypes';

export interface SiblingInfo {
  siblingLeafNodeIds: number[];
  currentIndex: number;
}

export function getSiblingInfo(
  msg: IMessage,
  allMessages: Readonly<IMessage[]>
): SiblingInfo {
  const nodeMap = new Map<number, IMessage>();
  for (const m of allMessages) {
    nodeMap.set(m.id, m);
  }

  const parent = nodeMap.get(msg.parent);
  if (!parent || parent.children.length <= 1) {
    return { siblingLeafNodeIds: [msg.id], currentIndex: 0 };
  }

  const siblingIds = parent.children;

  const siblingLeafNodeIds = siblingIds.map((sibId) => {
    return findLeafFromNode(sibId, nodeMap);
  });

  siblingLeafNodeIds.sort((a, b) => {
    const msgA = nodeMap.get(a);
    const msgB = nodeMap.get(b);
    return (msgA?.timestamp ?? 0) - (msgB?.timestamp ?? 0);
  });

  const currentLeafId = findLeafFromNode(msg.id, nodeMap);
  const currentIndex = siblingLeafNodeIds.indexOf(currentLeafId);

  return { siblingLeafNodeIds, currentIndex: Math.max(0, currentIndex) };
}

function findLeafFromNode(nodeId: number, nodeMap: Map<number, IMessage>): number {
  let current = nodeMap.get(nodeId);
  while (current && current.children.length > 0) {
    current = nodeMap.get(current.children[current.children.length - 1]);
  }
  return current?.id ?? nodeId;
}
