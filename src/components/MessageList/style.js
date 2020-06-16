// @flow
import theme from '../../shared/theme';
import styled from 'styled-components';
import { SecondaryColumn, MEDIA_BREAK } from '../layout';

export const View = styled.main`
  grid-area: main;
  display: grid;
  grid-template-columns: minmax(320px, 400px) 1fr;
`;

export const ViewContent = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  flex: 1;
`;

export const MessagesList = styled.div`
  background: ${theme.bg.default};
  border-right: 1px solid ${theme.bg.border};
  @media (max-width: ${MEDIA_BREAK}px) {
    min-width: 320px;
    border-right: none;
    max-width: 100%;
    display: ${props => (props.isViewingThread ? 'none' : 'flex')};
  }
`;

export const MessagesContainer = styled.div`
  display: flex;
  overflow-y: ${props => (props.headerExists ? 'auto': 'none')};
  flex-direction: column;
  background-image: url(https://mobikob.com/static/img/bg-gray.png);
  flex: 1;
`;

export const NoThreads = styled(MessagesContainer)`
  position: absolute;
  top: 50%;
  width: 100%;
  transform: translateY(-50%);
  background: #fff;
  h2 {
    max-width: 600px;
  }
`;

export const ComposeHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 10;
  justify-content: flex-end;
  padding: 8px;
  border-bottom: 1px solid ${theme.bg.border};
  color: ${theme.brand.default};
  @media (max-width: ${MEDIA_BREAK}px) {
    display: none;
  }
`;

export const StyledSecondaryColumn = styled(SecondaryColumn)`
  border-left: 1px solid ${theme.bg.border};
  border-right: 1px solid ${theme.bg.border};
  padding-right: 0;
  padding-bottom: 0;
  @media (max-width: ${MEDIA_BREAK}px) {
    border-left: 0;
    border-right: 0;
    display: grid;
    display: ${props => (props.shouldHideThreadList ? 'none' : 'block')};
  }
`;


export const MessagesScrollWrapper = styled.div`
  width: 100%;
  padding-top: 24px;
`;

export const MessagesWrapper = styled.div`
  flex: 1 0 auto;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 100%;
  justify-content: flex-end;
  @media (max-width: ${MEDIA_BREAK}px) {
    padding-bottom: 72px;
  }
`;