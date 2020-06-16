// @flow
import React from 'react';
// import { withCurrentUser } from 'src/components/withCurrentUser';
import { StyledAppViewWrapper } from './style';

/*
type Props = {
    isModal: boolean,
    currentUser: ?UserInfoType,
    history: History,
    location: Object,
};
*/

class AppViewWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.ref = null;
        this.prevScrollOffset = 0;
    }


    componentDidUpdate(prevProps, prevState, snapshot) {
        /*
          If we have a snapshot value, the user has closed a modal and we need
          to return the user to where they were previously scrolled in the primary
          view
        */
        if (snapshot !== null && this.ref) {
            this.ref.scrollTop = snapshot;
        }
    }

    render() {
        const isTwoColumn = true;

        return (
            <StyledAppViewWrapper
                headerExists={this.props.headerExists}
                headerSize={this.props.headerSize}
                ref={el => (this.ref = el)}
                isTwoColumn={isTwoColumn}
                {...this.props}
            />
        );
    }
}

export default AppViewWrapper;