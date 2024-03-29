import React from 'react';
import { ModalBody, Header, ModalContent, Title, CloseButton } from './styles';

/*
  ModalContainer is included around all modal components in order to have a
  consistent wrapper and consistent close-button behavior. Otherwise it will
  accept any arbitrary content via `props.children`
*/

const ModalContainer = ({
  closeModal,
  children,
  title,
  noHeader,
  dataCy,
}) => {
  return (
    <ModalBody data-cy={dataCy}>
      <Header noHeader={noHeader}>
        <Title>{title}</Title>
        <CloseButton onClick={() => closeModal()} glyph="view-close" />
      </Header>

      <ModalContent>{children}</ModalContent>
    </ModalBody>
  );
};

export default ModalContainer;