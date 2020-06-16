import React, { useEffect } from 'react';
import SearchInput from '../SearchInput'
import Modal from "react-modal";
import { UserList } from '../SearchInput/userList';
import { ListCandidates} from '../SearchInput/listCandidates';
import {modalStyles} from '../MobiModal/styles';
import ModalContainer from '../MobiModal';
import includes from 'lodash/includes';
import { notification } from 'antd';
import { useMutation } from '@apollo/react-hooks';
import gql from 'graphql-tag';
import { Spinner } from 'react-bootstrap';
// import { store } from 'react-notifications-component';
const LoadingIndicator = (props) => {
    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '8vh',
            justifyContent: 'center',
        }}>
            <Spinner animation="border" role="status">
                <span className="sr-only">{props.text}</span>
            </Spinner>
        </div>
    )
}

const ADD_NEW_USER = gql`
    mutation AddUserToThread($threadId: String!, $newMembers: [ID!]) {
        addUserToThread(input: {threadId: $threadId, newMembers: $newMembers}) {
            _id
            
        }

    }
`;

const threadMessages = gql`
query($threadId: ID!, $cursor: ID, $searchedCursor: ID, $limit: Int) {
    thread(id: $threadId){
        _id
        isGroup
        groupInfo {
            name
        }
        members {
            i_user
            name
            surname
            lastSeen
            tenant
        }

        messages(cursor: $cursor, searchedCursor: $searchedCursor, limit: $limit) {
            edges {
                id
                content
                messageType
                parent {
                    id
                }
                modifiedAt
                createdAt
                isDeleted
                user {
                    i_user
                    username
                }
            }
            pageInfo {
                hasNextPage
                endCursor
            }
        }

    }
}
`;


const AddNewUserThreadModal = (props) => {
    const updateCache = (cache, {data}) => {
    }

    const [addUserToThread, { error, loading, data }] = useMutation(ADD_NEW_USER,  { 
       errorPolicy: 'all', update: updateCache //onCompleted: resetInput
    });
    const styles = modalStyles(420);
    const { threadId, show } = props;
    // const [isOpen, shouldModalShow] = React.useState(false);
    const [loadingUsers, setLoading] = React.useState(false);
    const [value, handleOnChange] = React.useState("");
    const [candidates, setUsers] = React.useState([])
    const [selected, setSelected] = React.useState([]);



    const closeModal = () => {
        props.handleUserThreadModal(false);
    }

    const afterOpenModal = () => {
        setSelected([])
    }


    const addCandidateToList = (e, candidate) => {
        if (includes(selected, candidate)) {
            handleOnChange('');
            return;
        } else {
            setSelected(oldSelected => [...oldSelected, candidate]);
            setUsers([]);
            handleOnChange('');
        }
    };

    /*
    useEffect(() => {
        console.log("mounted callview", linesButThis, linesButThis.map(line => { return uuidTime.v1(line.callUUID) }))
        let timer;
        if (!activeLine) {
            console.log("currentLine is not exists", history)
            timer = setTimeout(() => {
                history.push(`/webapp/calls`)
            }, 1000);
        }
        return () => timer ? clearTimeout(timer) : null;
    }, [selected]);
    */ 
    useEffect(function() {
    }, [props.exclude]);

    if (loading) return <LoadingIndicator />
    return (
        <Modal
            ariaHideApp={false}
            isOpen={show}
            style={styles}
            onRequestClose={closeModal}
            onAfterOpen={afterOpenModal}
        >
            <ModalContainer title={'Yeni Kullanıcı Ekle'} closeModal={closeModal} >
                <div className="userList">
                    <UserList handleClick={(user) => { 
                        setSelected(oldSelected => {
                            if (oldSelected.map(selected => selected.i_user).contains(user.i_user)) 
                                return oldSelected;
                            return [...oldSelected.filter(selected => selected.i_user !== user.i_user)]
                        })
                      }} selected={selected}/>
                </div>
                <div className="userSearchBox">
                    <SearchInput setLoading={setLoading} setUsers={setUsers} value={value} onChange={(e) => {handleOnChange(e.target.value)}}/>
                </div>
                <div
                    className="searchedList"  
                    style={{
                        textAlign: 'center',
                        height: '100%',
                        maxHeight: 'calc(100% - 62px)',
                        overflow: 'hidden scroll',
                        background: 'rgb(255, 255, 255)',
                    }}
                >
                    <ListCandidates loading={loadingUsers} handleClick={addCandidateToList} candidates={candidates} exclude={[...props.exclude, ...selected.map(sele => sele.i_user)]} value={value}/>
                </div>
                    {error && 
                        <div 
                            style={{
                                background: '#ff7575',
                                fontWeight: '800',
                                width: '100%',
                                display: 'flex',
                                textAlign: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <pre>Hata: {error.graphQLErrors.map(({ message }, i) => (
                                <span key={i}>{message}</span>
                            ))}
                            </pre>

                        </div>
                    }
                <button
                    style={{
                        boxShadow: '0 0.2rem 0.4rem -0.075rem rgba(0,0,0,.25)',
                        background: '#6264a7',
                        borderRadius: '.2rem',
                        color: '#fff',
                        fontWeight: '600',
                        border: '.2rem solid transparent',
                        fontSize: '1.4rem',
                        height: '3.2rem',
                    }}
                    onClick={() => {
                        addUserToThread({ 
                            variables: {threadId: threadId, newMembers: selected.map(sele => sele.i_user)},
                            refetchQueries: [{ query: threadMessages, variables: {threadId: threadId}}]
                        }).then( () => {
                            console.log("then data", data)
                            notification.info({
                                message: `Kullanıcı Eklendi!`,
                                description: '',
                                placement: 'bottomRight',
                              });
                            closeModal();
                        });
                    }}
                >
                    Ekle
                </button>

            </ModalContainer>

        </Modal>
    )
};
export default AddNewUserThreadModal;