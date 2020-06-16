import React from 'react';
import { ListGroup, Spinner } from 'react-bootstrap';
// import includes from 'lodash/includes';


const Loading = () => {
    return (
        <Spinner animation="border" role="status">
        <span className="sr-only">Yükleniyor...</span>
        </Spinner>
    )
}


const CandidateItem = (props) => {
    const { candidate } = props;
    return (
        <ListGroup.Item action onClick={props.onClick}>
            {candidate.name} {candidate.surname} <small>@{candidate.username}</small>
        </ListGroup.Item>
    )
}

export class ListCandidates extends React.Component {
    renderResults = (candidates, searchValue) => {
        const results = []
        if (candidates.length === 0 && searchValue !== '') {
            return <div className="error">Kullanıcı bulunamadı...</div>
        }
        // exclude given users
        if (this.props.exclude)
            candidates = candidates.filter(candidate => {
                return !this.props.exclude.includes(candidate.i_user);
            })
        candidates.map(candidate => (
            results.push(<CandidateItem key={candidate.i_user} onClick={(e) => this.props.handleClick(e,candidate)} candidate={candidate} />)
        ))
        return results
    }
    render() {
        return (
            <div>
                {
                    this.props.loading &&
                    <Loading />
                }
                <ListGroup variant="flush">{this.renderResults(this.props.candidates, this.props.value)}</ListGroup>
            </div>
        )
    }
}
