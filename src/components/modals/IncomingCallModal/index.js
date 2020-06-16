import React from 'react';
import Modal from 'react-modal';
import { Actions, Message } from './style';
import ModalContainer from '../modalContainer';
import { TextButton, WarnButton } from '../../Button';
import { modalStyles } from '../styles';

const IncomingCallModal = (props) => {
    const { isModalOpen, setIsModalOpen, isLoading, triggerDelete, message, buttonLabel} = props;
    const { line, answerCall, rejectCall, history } = props;
    const [browserNotif, setBrowserNotif] = React.useState(null);
    console.log("icn", history)

    const closeModal = () => {
        setIsModalOpen(false);
    }
    const styles = modalStyles();

    return (
        <Modal
            ariaHideApp={false}
            isOpen={isModalOpen}
            style={styles}
            onRequestClose={closeModal}
            id={line.callUUID}
        >
            <ModalContainer title={'Gelen Çağrı'} closeModal={closeModal} >
                <Message>{message ? message : 'Birisi sizi arıyor'}</Message>
                <Actions>
                    <TextButton onClick={closeModal}>Vazgeç</TextButton>
                    <WarnButton
                        loading={isLoading}
                        onClick={triggerDelete}
                        data-cy={'delete-button'}
                    >
                        {buttonLabel || 'Cevapla'}
                    </WarnButton>
                </Actions>
            </ModalContainer>
        </Modal>
    )
}

export default DeleteModal;