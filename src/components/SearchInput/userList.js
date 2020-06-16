import React from 'react';
import styled from 'styled-components';
import './SearchInput.css'

const CloseButton = (props) => {
    return (
        <div size="20" className="icon usertimes"><svg xmlns="http://www.w3.org/2000/svg" aria-labelledby="title" viewBox="0 0 32 32" preserveAspectRatio="xMidYMid meet" id="view-close" className="icon__InlineSvg-sc-1oek49q-0 wLBhT"><title id="title">view-close</title><g><path d="M11.121,9.707c-0.39,-0.391 -1.024,-0.391 -1.414,0c-0.391,0.39 -0.391,1.024 0,1.414l4.95,4.95l-4.95,4.95c-0.391,0.39 -0.391,1.023 0,1.414c0.39,0.39 1.024,0.39 1.414,0l4.95,-4.95l4.95,4.95c0.39,0.39 1.023,0.39 1.414,0c0.39,-0.391 0.39,-1.024 0,-1.414l-4.95,-4.95l4.95,-4.95c0.39,-0.39 0.39,-1.024 0,-1.414c-0.391,-0.391 -1.024,-0.391 -1.414,0l-4.95,4.95l-4.95,-4.95Z"></path></g></svg></div>
    )
}

const SelectedPills = styled.div`
    display: flex;
    flex-wrap: wrap;
    -webkit-box-align: center;
    align-items: center;
    border-bottom: 1px solid rgb(235, 236, 237);
    padding: 12px 16px 4px;
    flex: 0 0 auto;
`;

const Pill = styled.div`
    display: flex;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: justify;
    justify-content: space-between;
    color: rgb(68, 0, 204);
    margin-right: 8px;
    margin-bottom: 8px;
    font-size: 15px;
    font-weight: 500;
    cursor: pointer;
    border-radius: 24px;
    padding: 2px 6px 2px 2px;
    background: rgba(68, 0, 204, 0.04);
`;

const UserItem = (props) => {
    const { user } = props;
    return (
        <Pill onClick={props.onClick}>
            {user.name} {user.surname}
            <small>@{user.username}</small>
            <CloseButton />
        </Pill>
    )
}


export class UserList extends React.Component {
    render() {
        return (
                <SelectedPills>
                    {
                        this.props.selected.map(user => (
                            <UserItem key={user.i_user} onClick={(e) => this.props.handleClick(user, e)} user={user} />
                        ))

                    }
                </SelectedPills>
        )
    }
}
