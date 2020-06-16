import React from "react";
import Modal from "react-modal";
import { modalStyles } from './styles';
import ModalContainer from './modalContainer';
import Dialpad from '../dialpad';
import SipContext from '../../lib/sip_context';
import SelectExtensionModal from '../SelectExtensionModal';
import {
  SIP_STATUS_DISCONNECTED,
} from "../SipProvider/enums";


const CallModal = (props) => {
    const {startCall, status} = React.useContext(SipContext);
    const styles = modalStyles(420);
    const { isOpen, closeModal } = props;

    return (
        <Modal
            ariaHideApp={false}
            isOpen={isOpen}
            style={styles}
        >
            <ModalContainer title={ status === SIP_STATUS_DISCONNECTED ? `Dahili Seçin` : `` } closeModal={closeModal}>
                {
                    ( status !== SIP_STATUS_DISCONNECTED ) ?
                        <Dialpad {...props} onCallPressed={startCall}/> :
                        <SelectExtensionModal user={props.user} />
                }
            </ModalContainer>

        </Modal>
    )
}

export default CallModal;
