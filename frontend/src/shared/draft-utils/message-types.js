export const messageTypeObj = {
    text: 'text',
    media: 'media',
    draftjs: 'draftjs',
    file: 'file',
  };
export type MessageType = $Keys<typeof messageTypeObj>;