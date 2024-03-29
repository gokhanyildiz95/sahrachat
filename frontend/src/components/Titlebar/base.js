// @flow
import React from 'react';
import compose from 'recompose/compose';
import { connect } from 'react-redux';
import { withRouter, type History } from 'react-router-dom';
import { NavigationContext } from '../../lib/navigation-context';
import Icon from '../icon';
import { RedDot } from '../../views/navigation/style';
import {
  TitlebarContainer,
  Content,
  Actions,
  Title,
  LeftActionContainer,
} from './style';

/*
type Props = {
  title?: string,
  history: History,
  titleIcon?: any,
  rightAction?: any,
  hasUnseenNotifications?: boolean,
  leftAction: 'view-back' | 'menu',
};
*/

const MobileTitlebar = (props) => {
  const {
    title,
    titleIcon,
    rightAction,
    leftAction,
    history,
    hasUnseenNotifications,
    ...rest
  } = props;

  const handleMenuClick = setNavOpen => () => {
    if (leftAction === 'menu') {
      return setNavOpen(true);
    }

    if (history.length >= 3) {
      return history.goBack();
    }

    // if there is not history, redirect back to the home view of the app
    // and let the redirect handler push the user to their last-viewed community
    return history.push('/');
  };

  const leftActionComponent = setNavigationIsOpen => {
    if (typeof leftAction === 'string') {
      return (
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Icon
            onClick={handleMenuClick(setNavigationIsOpen)}
            glyph={leftAction}
            size={32}
          />
          {hasUnseenNotifications && leftAction === 'menu' && <RedDot />}
        </div>
      );
    }

    // if the menu action is a component, just render the component being passed
    // from the view directly
    return leftAction;
  };

  return (
    <NavigationContext.Consumer>
      {({ setNavigationIsOpen }) => (
        <TitlebarContainer {...rest} hasAction={rightAction}>
          <Content>
            {leftAction && (
              <LeftActionContainer>
                {leftActionComponent(setNavigationIsOpen)}
              </LeftActionContainer>
            )}

            <div style={{ width: '12px' }} />

            {titleIcon && (
              <React.Fragment>
                {titleIcon}
                <div style={{ width: '12px' }} />
              </React.Fragment>
            )}

            {title && <Title>{title}</Title>}
          </Content>

          {rightAction && (
            <Actions>{rightAction}</Actions>
          )}
        </TitlebarContainer>
      )}
    </NavigationContext.Consumer>
  );
};


export default compose(
  withRouter,
)(MobileTitlebar);
