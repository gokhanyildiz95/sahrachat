import React from 'react';
import './ToolbarButton.css';

export default class ToolbarButton extends React.Component {
    render() {
        const { thread, clickHandler } = this.props;
        return (
            <div
            onClick={event => clickHandler ? clickHandler(event, thread) : () => {}}
            className={`toolbar-button`} > { this.props.children } </div>
        )
    }
}