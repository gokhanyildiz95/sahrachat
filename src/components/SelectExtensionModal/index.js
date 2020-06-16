import React from "react";
import { ModalContent } from '../CallModal/style';
import { Form, Spinner } from 'react-bootstrap';
import axios from 'axios';


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
const SelectExtensionModal = (props) => {
    const { user } = props;
    const [extensionsFetched] = React.useState(true);


    React.useEffect(() => {
        let timer;
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        axios.defaults.withCredentials = true;
        /*
        axios.post(`${PROTOCOL}//${user.tenant}.${TENANT_ROOT}:8000/wizard/`, {ajaxType: 'get_extension_list'}).then(response => {
            console.log(response);
        }).catch(error => {
            console.log("rerr", error);
        });
        */

        return () => timer ? clearTimeout(timer) : null;
    }, [user.tenant]);

    return (
        <>
        {
             extensionsFetched ?
                <ModalContent>
                    <Form>
                      <Form.Group controlId="exampleForm.ControlSelect1">
                        <Form.Label>Konuşma yapabilmek için kullanıcınıza dahili tanımlamalısınız.</Form.Label>
                      </Form.Group>
                    </Form>
                </ModalContent> :
                <LoadingIndicator />
        }
        </>
    )
}
                        /*
                        <Form.Control as="select">
                          <option>1</option>
                          <option>2</option>
                          <option>3</option>
                          <option>4</option>
                          <option>5</option>
                        </Form.Control>
                        */

export default SelectExtensionModal;
