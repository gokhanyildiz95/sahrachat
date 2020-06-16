import styled from 'styled-components';

export const CallButton = styled.button`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1 0 0px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    border-color: transparent;
    text-align: left;
    border-width: 0px;
    min-height: 46px;
    margin: 5px; 
    padding: 0px;
    cursor: pointer;
    border-style: solid;
    outline:none;
`;

export const NumberElement = styled.div`
    position: relative;
    display: inline;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    text-align: center; 
    font-family: "SF Bold", "Segoe System UI Bold", "Segoe UI Bold", sans-serif;
    font-weight: 400;
    color: rgb(37, 36, 35);
    font-size: 26px;
    line-height: 30px;
    cursor: inherit;
`;


export const DescContainer = styled.div`
    position: relative;
    display: flex;
    flex-direction: column;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    align-items: center;
    align-self: center;
`;
export const NumberDescElement = styled.div`
    position: relative;
    display: inline;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    font-size: 12px;
    color: rgb(37, 36, 35);
    font-family: "SF Regular", "Segoe System UI Regular", "Segoe UI Regular", sans-serif;
    font-weight: 400;
    line-height: 16px;
    cursor: inherit;
`;


export const DialpadRow = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex-grow: 1;
    flex-shrink: 0;
    overflow: hidden;
    align-items: stretch;
`;


export const InputRow = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    padding-bottom: 10px;
    /*
    padding-left: 20px;
    padding-right: 10px;
    */
`;

export const DialpadInput = styled.input`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 0 0 auto;
    overflow: hidden auto;
    align-items: stretch;
    // background-color: rgba(0, 0, 0, 0);
    // color: rgb(255, 255, 255); font-family: "SF Bold", "Segoe System UI Bold", "Segoe UI Bold", sans-serif;
    font-weight: 400;
    font-size: 26px;
    outline: none;
    resize: none;
    border-width: 0px;
`;

export const ActionRow = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex-grow: 0;
    flex-shrink: 0;
    overflow: visible;
    align-items: stretch;
    justify-content: center;
    margin-bottom: 15px;
    min-height: 60px;
    padding-left: 5px;
    padding-right: 5px;
`;
export const ActionCol = styled.div`
    position: relative;
    display: flex;
    flex-direction: row;
    flex: 1 1 0px;
    overflow: hidden;
    align-items: center;
    justify-content: center;
    min-height: 60px;
`;