import React from 'react';
import './Toolbar.css';

export default class Toolbar extends React.Component {
  render() {
    const { title, leftItems, rightItems, customClass, handleClick } = this.props;
    return (
      <div className={`toolbar ${customClass}`} 

        onClick={event => handleClick ? this.props.handleClick(event) : () => {}}
      >
        <div className="left-items">{ leftItems }</div>
        <h1 className="toolbar-title">{ title }</h1>
        <div className="right-items">{ rightItems }</div>
      </div>
    );
  }
}