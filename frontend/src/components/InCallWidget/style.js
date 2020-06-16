import styled from 'styled-components';


export const CallDiv = styled.div`
    background-color: #313030;
    overflow: visible;
    color: #fff;
    position: relative;
    font-weight: 300;
    cursor: pointer;
    user-select: none;
    display: grid;
    grid-template-rows: 56px 133px;
`;

export const CallHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.2rem 1.2rem 2.8rem;
    background: linear-gradient(to bottom,rgba(0,0,0,.7),transparent);
    display: flex;
    align-items: center;
    /* position: absolute; */
    top: 0;
    width: 100%;
    z-index: 100;
`;

export const CallBar = styled.div`
    display: flex;
    position: relative;
    align-self: center;
    overflow: hidden;
    border-radius: .3rem;
    /* opacity: 1; */
    z-index: 140;
    width: -webkit-min-content;
    width: -moz-min-content;
    width: min-content;
    animation: .55s ease-in-out 0s normal forwards;
    box-shadow: 0 0.4rem 1rem 0.3rem rgba(0,0,0,.3);
`;
export const CallBarContainer = styled.div`
    min-height: 4.2rem;
    display: flex;
    position: relative;
    flex-direction: column;
`;

export const CallBarSection  = styled.section`
    display: flex;
    width: 3.2rem;
    height: 3.2rem;
    padding: 0;
    margin: 0;
    background-size: 100%;
    background-clip: content-box;
    box-sizing: content-box!important;
    position: relative;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
    -webkit-box-pack: center;
    -webkit-justify-content: center;
    -ms-flex-pack: center;
    justify-content: center;
    opacity: 1;
    margin: 0;
    background-size: 100%;
    background-clip: content-box;
    box-sizing: content-box!important;
    background: rgba(59,58,58,.95);
    position: relative;
`;

export const CallBody = styled.div`
    min-height: 4.2rem;
    display: flex;
    position: relative;
    flex-direction: column;
    width: 100%;
    justify-content: flex-end;

`;
export const CallBodys = styled.div`
`;