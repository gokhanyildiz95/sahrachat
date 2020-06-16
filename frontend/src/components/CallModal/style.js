import styled from 'styled-components';
import { FlexRow } from '../../components/globals';

export const Actions = styled(FlexRow)`
  margin-top: 24px;
  justify-content: flex-end;
  button + button {
    margin-left: 8px;
  }
  `;

export const ModalContent = styled.div`
    z-index: 1;
    justify-content: center;
    padding: 0;
    color: #545454;
    font-size: 1.125em;
    font-weight: 400;
    line-height: normal;
    padding: 20px;
    text-align: center;
    word-wrap: break-word;
`;
