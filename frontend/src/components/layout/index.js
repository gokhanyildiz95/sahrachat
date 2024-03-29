// @flow
import styled from 'styled-components';
import theme from '../../shared/theme';
//import { isDesktopApp } from 'src/helpers/desktop-app-utils';
const isDesktopApp = true;

export const NAVBAR_WIDTH = isDesktopApp ? 80 : 72;
export const NAVBAR_EXPANDED_WIDTH = 256;
export const MIN_PRIMARY_COLUMN_WIDTH = 600;
export const MIN_SECONDARY_COLUMN_WIDTH = 64;
export const MAX_PRIMARY_COLUMN_WIDTH = 968;
export const MAX_SECONDARY_COLUMN_WIDTH = 360;
export const COL_GAP = 24;
export const TITLEBAR_HEIGHT = isDesktopApp ? 82 : 62;
export const MIN_MAX_WIDTH =
  MIN_PRIMARY_COLUMN_WIDTH + MIN_SECONDARY_COLUMN_WIDTH + COL_GAP;
export const MAX_WIDTH =
  MAX_PRIMARY_COLUMN_WIDTH + MAX_SECONDARY_COLUMN_WIDTH + COL_GAP;
export const MIN_WIDTH_TO_EXPAND_NAVIGATION = MAX_WIDTH + 256;
export const SINGLE_COLUMN_WIDTH = MAX_WIDTH;
// add 144 (72 * 2) to account for the left side nav
export const MEDIA_BREAK =
  MIN_PRIMARY_COLUMN_WIDTH +
  MIN_SECONDARY_COLUMN_WIDTH +
  COL_GAP +
  NAVBAR_WIDTH * 2;

/*
  do not remove this className.
  see `src/routes.js` for an explanation of what's going on here
*/
export const ViewGrid = styled.main.attrs({
  id: 'main',
  className: 'view-grid',
})`
  display: grid;
  grid-area: main;
  height: 100%;
  max-height: 100vh;
  overflow: hidden;
  overflow-y: ${ props => props.headerExists ? 'hidden': 'auto'};
  max-height: ${props => props.headerExists ? `calc(100vh - ${props.headerSize}px)`: ``};
  height: ${props => props.headerExists ? `calc(100vh - ${props.headerSize}px)`: ``};

`;

/*
  @media (max-width: ${MEDIA_BREAK}px) {
    max-height: calc(100vh - ${TITLEBAR_HEIGHT}px);
  }
┌──┬────────┬──┐
│  │   xx   │  │
│  │        │  │
│  │   xx   │  │
│  │        │  │
│  │   xx   │  │
└──┴────────┴──┘
*/
export const SingleColumnGrid = styled.div`
  display: grid;
  justify-self: center;
  grid-template-columns: ${MIN_MAX_WIDTH}px;
  grid-template-areas: 'primary';
  background: ${theme.bg.default};
  overflow-y: auto;

  @media (max-width: ${MEDIA_BREAK}px) {
    width: 100%;
    max-width: 100%;
    grid-template-columns: 1fr;
    border-left: 0;
    border-right: 0;
  }
`;

/*
┌──┬────┬─┬─┬──┐
│  │ xx │ │x│  │
│  │    │ │ │  │
│  │ xx │ │x│  │
│  │    │ │ │  │
│  │ xx │ │x│  │
└──┴────┴─┴─┴──┘
*/
export const PrimarySecondaryColumnGrid = styled.div`
  display: grid;
  justify-self: center;
  grid-template-columns:
    minmax(${MIN_PRIMARY_COLUMN_WIDTH}px, ${MAX_PRIMARY_COLUMN_WIDTH}px)
    minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px);
  grid-template-rows: 100%;
  grid-template-areas: 'primary secondary';
  grid-gap: ${COL_GAP}px;
  max-width: ${MAX_WIDTH}px;

  @media (max-width: ${MEDIA_BREAK}px) {
    grid-template-columns: 1fr;
    grid-template-rows: min-content 1fr;
    grid-gap: 0;
    min-width: 100%;
  }
`;

/*
┌──┬─┬─┬──────┐
│  │x│ │ xxxx │
│  │ │ │      │
│  │x│ │ xxxx │
│  │ │ │      │
│  │x│ │ xxxx │
└──┴─┴─┴──────┘
*/
export const SecondaryFullPrimaryColumnGrid = styled.div`
  display: grid;
  grid-template-columns:
    minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px)
    1fr
  grid-template-rows: 100%;
  grid-template-areas: 'secondary primary';
  grid-gap: 10px;

  @media (max-width: ${MEDIA_BREAK}px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    justify-self: center;
    grid-gap: 0;
    min-width: 100%;
    max-width: 100%;
  }
`;


/*
┌──┬─┬─┬────┬──┐
│  │x│ │ xx │  │
│  │ │ │    │  │
│  │x│ │ xx │  │
│  │ │ │    │  │
│  │x│ │ xx │  │
└──┴─┴─┴────┴──┘
*/
export const SecondaryPrimaryColumnGrid = styled.div`
  display: grid;
  justify-self : ${props =>
    !props.fullWidth ? `center` : 'none'};
  grid-template-columns: ${props =>
    !props.fullWidth ?
      `
        minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px)
        minmax(${MIN_PRIMARY_COLUMN_WIDTH}px, ${MAX_PRIMARY_COLUMN_WIDTH}px);
      ` :
      `
        minmax(${MIN_SECONDARY_COLUMN_WIDTH}px, ${MAX_SECONDARY_COLUMN_WIDTH}px)
        1fr
      `};
  grid-template-rows: 100%;
  grid-template-areas: 'secondary primary';
  grid-gap: ${props =>
    props.colGap ? `${props.colGap}px` : `${COL_GAP}px`};
  max-width: ${props =>
    !props.fullWidth ? `${MAX_WIDTH}px` : 'none'};
  // margin: 0 24px;

  @media (max-width: ${MEDIA_BREAK}px) {
    grid-template-columns: 1fr;
    grid-template-rows: 1fr;
    grid-gap: 0;
    justify-self : 'center';
    min-width: 100%;
    max-width: 100%;
  }
`;

/*
┌─────────────┐
│             │
│    ┌───┐    │
│    │ x │    │
│    └───┘    │
│             │
└─────────────┘
*/
export const CenteredGrid = styled.div`
  display: grid;
  justify-self: center;
  grid-template-columns: ${MAX_WIDTH}px;
  align-self: center;
  max-width: ${MAX_PRIMARY_COLUMN_WIDTH}px;
  grid-template-columns: minmax(
    ${MIN_PRIMARY_COLUMN_WIDTH}px,
    ${MAX_PRIMARY_COLUMN_WIDTH}px
  );

  @media (max-width: ${MEDIA_BREAK}px) {
    align-self: flex-start;
    width: 100%;
    max-width: 100%;
    grid-template-columns: 1fr;
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);
  }
`;

export const PrimaryColumn = styled.section`
  border-left: 1px solid ${theme.bg.border};
  border-right: 1px solid ${theme.bg.border};
  border-bottom: 1px solid ${theme.bg.border};
  border-radius: 0 0 4px 4px;
  height: 100%;
  max-width: ${props =>
    !props.fullWidth ? `${MAX_PRIMARY_COLUMN_WIDTH}px` : 'none'};
  grid-area: primary;
  display: grid;
  grid-template-rows: 1fr;

  @media (max-width: ${MEDIA_BREAK}px) {
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
    grid-column-start: 1;
    max-width: 100%;
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);
  }
`;

// SOLO CHANGE  bottom 0 to 48
export const SecondaryColumn = styled.section`
  height: 100vh;
  overflow: hidden;
  overflow-y: auto;
  position: sticky;
  top: 0;
  padding-bottom: 0px;
  grid-area: secondary;
  max-height: ${props => props.headerExists ? `calc(100vh - ${props.headerSize}px)`: ``};
  height: ${props => props.headerExists ? `calc(100vh - ${props.headerSize}px)`: ``};

  &::-webkit-scrollbar {
    width: 0px;
    height: 0px;
    background: transparent; /* make scrollbar transparent */
  }

  @media (max-width: ${MEDIA_BREAK}px) {
    display: ${props => props.justConvos ? `` : 'none'};
  }
`;
/* 
    height: calc(100vh - ${TITLEBAR_HEIGHT}px);

    */

export const ShowOnMobile = styled.div`
  display: none;
  @media (max-width: ${MEDIA_BREAK}px) {
    display: block !important;
  }
`
export const ChatInputWrapper = styled.div`
  position: sticky;
  bottom: 0px;
  left: 0px;
  width: 100%;
  z-index: 300;

  @media (max-width: ${MEDIA_BREAK}px) {
    width: 100vw;
    position: fixed;
    bottom: 0;
    left: 0;
  }
`;
