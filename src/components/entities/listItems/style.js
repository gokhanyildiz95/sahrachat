import theme from '../../../shared/theme';
import styled, { css } from 'styled-components';
import { hexa, Truncate } from '../../../components/globals';

export const Row = styled.div`
  padding: 12px 16px;
  align-items: center;
  display: grid;
  grid-template-rows: auto;
  grid-template-areas: 'actions content';
  grid-template-columns: auto 1fr;
  background: ${props =>
    props.isActive ? hexa(theme.text.default, 0.04) : theme.bg.default};
  border-bottom: 1px solid ${theme.bg.divider};
  grid-gap: 1px;
  &:hover {
    background: ${theme.bg.wash};
    cursor: pointer;
  }
  ${props =>
    props.isActive &&
    css`
      box-shadow: inset 3px 0 0 ${theme.text.default};
    `}
`;

export const Content = styled.div`
  grid-area: content;
  display: grid;
`;

export const Label = styled.div`
  color: ${theme.text.default};
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
  display: inline-block;
  align-items: center;
  min-width: 0;
  ${Truncate};
  .icon {
    color: ${theme.text.secondary};
    margin-right: 6px;
    position: relative;
    top: 1px;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 0 0 4px 4px;
  overflow:hidden;
`;