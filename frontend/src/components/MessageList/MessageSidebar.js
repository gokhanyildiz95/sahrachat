import React from 'react';
import Icon, { SvgWrapper } from '../icon';
import Tip from '../tooltip';
import DeleteModal from '../modals/DeleteDoubleCheckModal';
import { store } from 'react-notifications-component';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { threadMessages } from '../MessageList';
import EditGroup from '../EditGroup';

// TODO maybe move to styled
/*
const Header = styled.div`
    align-items: center;
    display: flex;
    justify-content: space-between;
    padding: 14px;
    color: rgba(6, 1, 1, 0.69);
    font-size: 15px;
    font-weight: bold;
    text-transform: uppercase;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
`;
*/

// TODO move gqls to same folder
const DELETE_USER_FROM_THREAD = gql`
    mutation DeleteUserFromThread($threadId: String!, $memberId: ID!) {
        deleteUserFromThread(input: {threadId: $threadId, memberId: $memberId}) {
            _id
        }
    }
`;

const GroupUserList = ({ isOwner, members, handleOnDelete }) => {

    return (
        members.map((member) => {
            return (
                <li className={"li-w-icon"} key={member.i_user}>{member.name} {member.surname}
                    {
                        //gruptan kişi çıkarma
                        (isOwner) &&
                        <Tip content={"Grupdan Çıkar"}>
                            <SvgWrapper style={{ cursor: 'pointer' }} onClick={() => { handleOnDelete(member.i_user) }}>
                                <Icon glyph="view-close" />
                            </SvgWrapper>
                        </Tip> 
                    }
                </li>
            )
        })
    )
}

const MessageSidebar = ({ userId, thread, handleUserThreadModal }) => {
    // TODO move gql stuff here
    // const client = useApolloClient();
    const [memberId, setMemberId] = React.useState(0);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
    const isOwner = thread.isGroup ? thread.groupInfo.owners.find(ele => ele.i_user === userId.toString()) : false;
    // console.log("user", userId, "is", thread.groupInfo, "owners", thread.groupInfo.owners, "isss", thread.groupInfo.owners.find(ele => ele.i_user === userId.toString()));

    /* eslint-disable-next-line */
    const [deleteUserFromThreadGQ, { error, loading, data }] = useMutation(DELETE_USER_FROM_THREAD, {
        errorPolicy: 'all',
        onCompleted(data) {
            showResult(data);
        },
    });


    /* eslint-disable-next-line */
    const updateCache = (cache, { data: { deleteUserFromThread } }) => {
        // read cached data
        /*
        const data = cache.readQuery({ query: queryThread });
        console.log("cache data", data);
        // delete the user and keep
        thread.members = thread.members.filter(member => member !== memberId);;
        // fetch messages
        // const messages = data.thread.messages;
        // // add latest message
        // data.thread.messages = [...messages, addMessage]
        // // write to cache
        // console.log("updateing cache", data)
        cache.writeQuery({ query: queryThread, variables: { threadId: thread._id }, data })
        */
    }

    const deleteUserFromThread = () => {
        console.log("deleting member", memberId, " from", thread._id);
        deleteUserFromThreadGQ({
            variables: { threadId: thread._id, memberId: memberId },
            //update: updateCache,
            // TODO shouldve update the cache
            refetchQueries: [{ query: threadMessages, variables: { threadId: thread._id } }],
        })
        setIsDeleteModalOpen(false);
        console.log(memberId)
    }

    const showResult = (data) => {
        store.addNotification({
            title: 'İşlem başarılı!',
            message: 'Kullanıcı grupdan çıkarıldı !',
            type: 'success',
            container: 'bottom-right',
            animationIn: ["animated", "fadeIn"],
            animationOut: ["animated", "fadeOut"],
            dismiss: {
                duration: 3000,
                showIcon: true,
            }
        });

    }

    const openDeleteModal = (memberId) => {
        setIsDeleteModalOpen(true)
        setMemberId(memberId);
    }

    return (
        <>
            <DeleteModal
                isModalOpen={isDeleteModalOpen}
                setIsModalOpen={setIsDeleteModalOpen}
                buttonLabel={'Çıkar'}
                triggerDelete={deleteUserFromThread}
            />
            <div>
                {
                    (thread.isGroup) ?
                        <>
                            <EditGroup data={thread} isOwner={isOwner}/>
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
                            >Kullanıcılar</h4>
                            {
                                (isOwner) &&
                                <div style={{
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '10px',
                                }}
                                    onClick={() => handleUserThreadModal(true)}
                                >
                                    <Icon glyph="plus" />
                                    <div style={{
                                        color: 'rgba(0, 0, 0, 1)',
                                        lineHeight: '32px',
                                        padding: '6px 0 5px'
                                    }}
                                    >
                                        Yeni birini ekle!
                                        </div>
                                </div>
                            }
                            <ul style={{
                                // listStyleType: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                paddingRight: '20px',
                                paddingLeft: '20px',
                            }}>
                                <GroupUserList isOwner={isOwner} members={thread.members} handleOnDelete={openDeleteModal} />
                            </ul>
                        </> :
                        <div>
                            private chat
                            Under construction!
                    </div>
                }
            </div>
        </>
    )
}

export default MessageSidebar;