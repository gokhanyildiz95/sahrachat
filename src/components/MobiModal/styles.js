
import theme from '../../shared/theme';
import styled from 'styled-components';
import Icon from '../icon';

const zIndex = {modal:9800};
/*
  This is the global stylesheet for all modal components. Its styles will wrap
  all modal content, so we should be selective about what is included here
*/

const mobile = false;
/*
  modalStyles are defined as a JS object because it gets passed in as inline
  styles to the react-modal component. Takes an optional maxWidth argument for
  desktop sizing.
*/
export const modalStyles = (maxWidth=360) => {
  return {
    // dark background behind all modals
    overlay: {
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: mobile ? 'flex-start' : 'center',
      justifyContent: 'center',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'visible',
      overflowX: 'hidden',
      zIndex: 6998,
      padding: '1.2rem',
    },
    // modal root
    content: {
      position: 'relative',
      background: '#ffffff',
      backgroundClip: 'padding-box',
      borderRadius: '12px',
      border: '0',
      padding: '0',
      zIndex: 6999,
      width: '100%',
      maxWidth: `${maxWidth}px`,
      top: 'auto',
      bottom: 'auto',
      left: 'auto',
      right: 'auto',
      backgroundColor: 'rgba(0,0,0,0)',
      boxShadow: '0 4px 24px rgba(0,0,0,0.40)',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    },
  };
};

export const ModalBody = styled.div`
  /* modal content should always flow top-to-bottom. inner components can
  have a flex-row property defined */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  background-color: ${theme.bg.default};
  overflow: visible;
`;

export const Title = styled.div`
  font-weight: 800;
  font-size: 20px;
  line-height: 28px;
`;

export const Header = styled.div`
  padding: 20px 24px 0;
  display: ${props => (props.noHeader ? 'none' : 'flex')};
  justify-content: space-between;
`;

export const ModalContent = styled.div`
display: flex;
flex-direction: column;
height: 500px;
max-height: 90vh;
width: 100%;
max-width: 500px;
z-index: 9997;
box-shadow: rgba(0, 0, 0, 0.12) 4px 0px 16px;
position: relative;
border-radius: 4px;
background: rgb(250, 250, 250);
overflow: hidden;
`;

export const Footer = styled.div``;

export const CloseButton = styled(Icon)`
  position: absolute;
  right: 8px;
  top: 8px;
  z-index: ${zIndex.modal + 1};
  color: ${theme.text.placeholder};
  &:hover {
    color: ${theme.warn.alt};
  }
`;

export const Description = styled.p`
  font-size: 14px;
  color: ${theme.text.default};
  padding: 8px 0 16px;
  line-height: 1.4;
  a {
    color: ${theme.brand.default};
  }
`;

export const UpsellDescription = styled(Description)`
  padding: 8px 12px;
  margin: 8px 0;
  border-radius: 4px;
  border: 1px solid ${theme.success.border};
  background: ${theme.success.wash};
  color: ${theme.success.dark};
  a {
    color: ${theme.success.default};
    font-weight: 700;
    display: block;
    margin-top: 4px;
  }
`;

export const Notice = styled(Description)`
  padding: 8px 16px;
  margin: 8px 0;
  border-radius: 4px;
  background: ${theme.special.wash};
  border: 2px solid ${theme.special.border};
  color: ${theme.special.dark};
`;
