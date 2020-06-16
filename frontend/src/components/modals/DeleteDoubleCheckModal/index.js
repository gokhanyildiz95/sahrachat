import React from 'react';
import Modal from 'react-modal';
import { Actions, Message } from './style';
import ModalContainer from '../modalContainer';
import { TextButton, WarnButton } from '../../Button';
import { modalStyles } from '../styles';


const DeleteModal = (props) => {
    const { isModalOpen, setIsModalOpen, isLoading, triggerDelete, message, buttonLabel} = props;

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
        >
            <ModalContainer title={'Kullancıyı grupdan çıkar?'} closeModal={closeModal} >
                <Message>{message ? message : 'Emin misiniz?'}</Message>
                <Actions>
                    <TextButton onClick={closeModal}>Vazgeç</TextButton>
                    <WarnButton
                        loading={isLoading}
                        onClick={triggerDelete}
                        data-cy={'delete-button'}
                    >
                        {buttonLabel || 'Sil'}
                    </WarnButton>
                </Actions>
            </ModalContainer>
        </Modal>
    )
}

export default DeleteModal;