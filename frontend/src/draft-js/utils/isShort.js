import { toPlainText } from './plaintext';

export const isShort = (message): boolean => {
  if (message.messageType === 'media') return false;
  const jsonBody = JSON.parse(message.content.body);
  return jsonBody.blocks.length <= 1 && toPlainText(jsonBody).length <= 170;
};
