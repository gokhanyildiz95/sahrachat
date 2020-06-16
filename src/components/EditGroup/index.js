import React, { useState } from 'react';
import { EditOutlined } from '@ant-design/icons';
import { threadMessages } from '../MessageList';
import { Button, Modal, Form, Input, Radio } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { notification } from 'antd';

const UPDATE_THREAD_PROPS = gql`
    mutation UpdateThread($threadId: String!, $name: String!, $isPrivate: Boolean!) {
        updateThread(input: {threadId: $threadId, name: $name, isPrivate: $isPrivate}) {
            _id
        }
    }
`;

const CollectionCreateForm = ({ visible, isPrivate, groupName, onCreate, onCancel }) => {
    const [form] = Form.useForm();
    return (
        <Modal
            visible={visible}
            title="Grup Detaylarını Düzenle"
            okText="Düzenle"
            cancelText="Vazgeç"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
                initialValues={{
                    isPrivateSwitch: `${isPrivate ? "private" : "public"}`,
                    groupName: groupName,
                }}
            >
                <Form.Item
                    name="groupName"
                    label="Grup İsmi"
                    rules={[
                        {
                            required: true,
                            message: 'Grup ismi giriniz',
                        },
                    ]}
                >
                    <Input />
                </Form.Item>
                <Form.Item name="isPrivateSwitch" className="collection-create-form_last-form-item">
                    <Radio.Group>
                        <Radio value="public">Açık</Radio>
                        <Radio value="private">Kapalı</Radio>
                    </Radio.Group>
                </Form.Item>
            </Form>
        </Modal>
    );
};

const EditGroup = ({ isOwner, data }) => {
    const [visible, setVisible] = useState(false);
    const { groupInfo } = data;
    const [updateThreadGQ, { error, loading, dataX }] = useMutation(UPDATE_THREAD_PROPS, {
        errorPolicy: 'all',
        onCompleted(data) {
            // showResult(data);
            console.log("result", data)
        },
    });
    const onCreate = values => {
        console.log('Received values of form: ', values);
        setVisible(false);
        updateThreadGQ({
            variables: { threadId: data._id, name: values.groupName, isPrivate: values.isPrivateSwitch === "public" ? true : false },
            //update: updateCache,
            // TODO shouldve update the cache
            refetchQueries: [{ query: threadMessages, variables: { threadId: data._id } }],
        })
            .then(() => {
                notification.info({
                    message: `Grup Düzenlendi!`,
                    description: '',
                    placement: 'bottomRight',
                });
            }).catch((err) => {
                console.log("err", err)
                notification.error({
                    message: `Grup Düzenlenemedi! ${err.message}`,
                    description: '',
                    placement: 'bottomRight',
                });

            });
    };
    return (
        <div>
            <CollectionCreateForm
                visible={visible}
                isPrivate={groupInfo.isPrivate}
                groupName={groupInfo.name}
                onCreate={onCreate}
                onCancel={() => {
                    setVisible(false);
                }}
            />
            {
                (isOwner) &&
                <h4
                    style={{
                        alignItems: 'center',
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '14px',
                        color: 'rgba(6, 1, 1, 0.69)',
                        fontSize: '15px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        borderBottom: '1px solid rgba(0, 0, 0, .10)'
                    }}
                >Grup Düzenle
                <EditOutlined onClick={() => { setVisible(true) }}
                    />
                </h4>
            }
        </div>
    )
}

export default EditGroup;