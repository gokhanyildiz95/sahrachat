import React from 'react';
import Tippy from '@tippy.js/react';

const Tip = (props) => {
    const { style = {}, content, ...rest } = props;

    return (
        <Tippy 
            placement="top"
            touch={false}
            arrow={true}
            //arrowType={'round'}
            content={
                <span style={{ fontSize: '14px', fontWeight: '600', ...style }}>
                    {content}
                </span>
            }
            popperOptions={{
                modifiers: {
                    preventOverflow: {
                        boundariesElement: 'window',
                    }
                }
            }}
            {...rest}

        />
    );
};

export default Tip;