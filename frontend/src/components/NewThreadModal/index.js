import React from 'react';
import gql from 'graphql-tag';
import { notification } from 'antd';
import { store } from 'react-notifications-component';
import { Mutation } from "react-apollo";
import { Button, Modal, Form } from 'react-bootstrap';
import SearchInput from '../SearchInput'
import { UserList } from '../SearchInput/userList';
import { ListCandidates} from '../SearchInput/listCandidates';
import remove from 'lodash/remove';
import includes from 'lodash/includes';
import { Checkbox } from '../FormElements';

const createThread = gql`
    mutation($members: [ID!], $isGroup: Boolean!, $isPrivate: Boolean, $groupName: String, $ownersParam: [ID] ) {
         createThread(input: {members: $members, isGroup: $isGroup, isPrivate: $isPrivate, groupName: $groupName, ownersParam: $ownersParam}) {
            _id
        }
    }
`;


const GroupControl = ({ isGroup, toggleGroup, groupName, handleNameInput, isPrivate, togglePrivate }) => {
    return (
        <div>
            <div>
                <Checkbox checked={isGroup} onChange={toggleGroup}>
                    Grup Oluştur
                </Checkbox>
            </div>
            <>
            {
                (isGroup) &&
                <>
                    <Form.Label>Grup İsmi</Form.Label>
                    <Form.Control type="text" onChange={(e) => { handleNameInput(e) }} placeholder="Grubunuza isim verin!" />
                    <div style={{paddingTop: '14px'}}>
                        <Checkbox checked={isPrivate} onChange={togglePrivate}>
                            Gizli Grup Oluştur
                        </Checkbox>
                           <Form.Text className="text-muted">
                               Kullanıcılar gizli gruplara davet edilmeden katılamaz.
                           </Form.Text>
                    </div>
                </>
            }
            </>

        </div>
    )
}




class NewThreadModal extends  React.Component {
    state = {
        searchQuery: '',
        candidates: [],
        selected: [],
        value: '',
        loading: false,
        isGroup: false,
        groupName: "",
        isPrivate: false,

    }

    setUsers = values => {
        this.setState({
            candidates: values.filter(value => value.i_user !== this.props.user.i_user.toString()),
        })
    }

    toggleGroup = e => {
        this.setState(prevState => ({
            isGroup: !prevState.isGroup
        }))
    }

    togglePrivate = e => {
        this.setState(prevState => ({
            isPrivate: !prevState.isPrivate
        }))
    }

    addCandidateToList = (e, candidate) => {
        console.log("added candidate clear")
        this.setState((prev, props) => {
            if (includes(this.state.selected, candidate)) {
                this.removeFromSelected(candidate);
                return {
                    candidates: [],
                    value: '',
                }
            } else {
                return {
                    selected: [...this.state.selected, candidate],
                    candidates: [],
                    value: '',
                }

            }
        }
        )
    }
    removeFromSelected = (user) => {
        let selected = remove(this.state.selected, (e) => {
            return e.i_user !== user.i_user;
        })
        this.setState({
            selected
        })
    }

    handleNameInput = (e) => {
        this.setState({
            groupName: e.target.value
        })
    }

    handleOnChange = (e) => {
        this.setState({
            value: e.target.value
        })
    }
    setLoading = (to) => {
        this.setState({
            loading: to
        })
    }

    render () {
        const {notifications} = this.props;
        return (
            <Mutation mutation={createThread}>
                {(createThread, { data }) => (
                    <Modal
                        {...this.props}
                        size="lg"
                        aria-labelledby="contained-modal-title-vcenter"
                        centered
                        className="newChat"
                    >
                    <Modal.Header closeButton>
                            Yeni Mesaj
                    </Modal.Header>
                        <Modal.Body>
                        <Form className="container">
                            <div className="isgroup">
                                <GroupControl
                                    isGroup={this.state.isGroup}
                                    isPrivate={this.state.isPrivate}
                                    groupName={this.state.groupName}
                                    toggleGroup={this.toggleGroup}
                                    togglePrivate={this.togglePrivate}
                                    handleNameInput={this.handleNameInput}
                                    />
                            </div>
                            <div className="userList">
                                <UserList handleClick={this.removeFromSelected} selected={this.state.selected}/>
                            </div>
                            <div className="userSearchBox">
                                <SearchInput setLoading={this.setLoading} setUsers={this.setUsers} value={this.state.value} onChange={this.handleOnChange.bind(this)}/>
                            </div>
                            <div className="searchedList"  style={{textAlign: 'center'}}>
                                <ListCandidates loading={this.state.loading} handleClick={this.addCandidateToList} candidates={this.state.candidates} exclude={this.state.selected.map(sele => sele.i_user)} value={this.state.value}/>
                            </div>
                        </Form>
                        </Modal.Body>
                        <Modal.Footer>
                            <Button onClick={(e) => {
                                const ids = [];
                                let send = true;
                                this.state.selected.map(user => ids.push(user.i_user));
                                if (ids.length <= 0) {
                                    send = false;
                                    store.addNotification({
                                        title: 'Yeni mesaj oluşturulamadı!',
                                        message: 'En az bir kullanıcı seçin!',
                                        type: 'warning',            
                                        container: 'bottom-right', 
                                        animationIn: ["animated", "fadeIn"],
                                        animationOut: ["animated", "fadeOut"], 
                                        dismiss: {
                                            duration: 3000,
                                            showIcon: true,
                                        }
                                    });
                                }
                                if (this.state.selected.length > 1 && this.state.isGroup == false) {
                                    send = false;
                                    store.addNotification({
                                        title: 'Oluşturulamadı',
                                        message: 'Birden fazla kullanıcı için grup oluşturmalısınız.',
                                        type: 'warning',            
                                        container: 'bottom-right', 
                                        animationIn: ["animated", "fadeIn"],
                                        animationOut: ["animated", "fadeOut"], 
                                        dismiss: {
                                            duration: 3000,
                                            showIcon: true,
                                        }
                                    });
                                }
                                if (this.state.isGroup) {
                                    if (!this.state.groupName) {
                                        console.log("gname", this.state.groupName)
                                        send = false;
                                        store.addNotification({
                                            title: 'Grup oluşturulamadı !!',
                                            message: 'Grup ismi boş olamaz! ',
                                            type: 'warning',                         // 'default', 'success', 'info', 'warning'
                                            container: 'bottom-right',                // where to position the notifications
                                            animationIn: ["animated", "fadeIn"],     // animate.css classes that's applied
                                            animationOut: ["animated", "fadeOut"],   // animate.css classes that's applied
                                            dismiss: {
                                                duration: 3000,
                                                showIcon: true,
                                            }
                                        });
                                    }
                                }
                                const variables = {
                                    members: ids,
                                    isGroup: this.state.isGroup,
                                    isPrivate: this.state.isPrivate,
                                    groupName: this.state.groupName,
                                    ownersParam: [this.props.user.i_user.toString(), ]
                                }
                                if (send) {
                                    createThread({variables: variables}).then(() => {
                                        notification.info({
                                            message: `Grup Oluşturuldu!`,
                                            description: '',
                                            placement: 'bottomRight',
                                          });
                                    }).catch((err) => {
                                        console.log("err", err)
                                        notification.error({
                                            message: `Grup Oluşturulamadı!`,
                                            description: '',
                                            placement: 'bottomRight',
                                          });

                                    });
                                    this.props.onHide();
                                };
                                this.setState({
                                    selected: [],
                                })
                            }}>Oluştur</Button>
                        </Modal.Footer>
                    </Modal>

                )}

            </Mutation>
        );

    }
}
export default NewThreadModal;

/*
    <SearchInput handleClick={}/>
    <SearchedList handleClick={}/>

*/
