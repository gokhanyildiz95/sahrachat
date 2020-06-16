// add aria tags to page maybe usefull??
import React from 'react';
import { SkipLink } from './style';

export const Skip = () => <SkipLink href="#main">Skip to Content</SkipLink>;

export const getAccessibilityActiveState = (active) => {
    return {
        'data-active': active,
        'aria-current': active ? 'page' : undefined,
    }

}