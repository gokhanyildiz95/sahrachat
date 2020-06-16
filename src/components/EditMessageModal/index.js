import React, { useEffect, useState } from 'react';
import { useMutation } from 'react-apollo';
import { message as AntMessage} from 'antd';
import { Modal, Input } from 'antd';
import { editMessageMutation } from '../../shared/graphql/mutations/message/editMessage';
import { threadMessages } from '../../shared/graphql/queries/thread/getThreadMessageConnection';
import processMessageContent, {
  messageTypeObj
} from '../../shared/draft-utils/process-message-content';

const parseEditable = (message) => {
  // TODO handle other message types (img, emoj,)
  if (!message.content) return "";
  const parsed = JSON.parse(message.content);
  // const msg = redraft(parsed)
  if (parsed && Array.isArray(parsed.blocks)) return parsed.blocks[0].text;
  return "";
};

const EditMesageModal = ({
  visible,
  message,
  threadId,
  setVisible,
}) => {
  const [localVal, setLocalVal] = useState("");
  const [editMessage, { data }] = useMutation(editMessageMutation);

  useEffect(() => {
    setLocalVal(parseEditable(message))
  }, [message])

  const onChange = (e) => {
    setLocalVal(e.target.value)
  }
  return (
    <Modal
      visible={visible}
      title="Mesajı editle"
      okText="Kaydet"
      cancelText="Vazgeç"
      onCancel={() => { setLocalVal(parseEditable(message)); setVisible(false) }}
      onOk={() => {
        console.log('Validate Failed:');
        const content = processMessageContent(messageTypeObj.text, localVal);
        const messageType = messageTypeObj.draftjs;
        editMessage({
          variables: { id: message.id, content, messageType },
          refetchQueries: [{ query: threadMessages, variables: { threadId } }]
        }).then(() => {
          AntMessage.success('Mesaj Düzenlendi!')
          setVisible(false)
        })
      }}
    >
      <Input.TextArea rows={4} type="textarea" value={localVal} onChange={onChange} />
    </Modal>
  );
};


export default EditMesageModal;