import React from 'react';
import {
    ViewGrid,
} from '../layout';
import { Content, Label } from '../entities/listItems/style';
const MultipleTabs = (props) => {
    return (
            <ViewGrid
                headerExists={props.headerExists}
                headerSize={props.headerSize}
            >
                    <Content style={{marginTop: '150px'}}>
                        <Label>
                          Birden fazla MobiKob sekmesi açık!

                          Lütfen açık olan sayfaları kapatıp sayfayı yenileyin!
                        </Label>
                    </Content>
              </ViewGrid>

    )
}

export default MultipleTabs;