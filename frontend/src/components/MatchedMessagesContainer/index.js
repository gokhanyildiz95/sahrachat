import React from 'react'
import { Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import { Row, Col } from 'antd';

import './MatchedMessages.css'

const ButtonGroup = Button.Group;
const { Text } = Typography;


const isGreaterThanTotal = (currIndex, matchedMessages) => {
    if (currIndex >= matchedMessages.length - 1) return true;
    return false
}


export const MatchedMessagesWO = ({ 
        searchValue,
        matchedMessages,
        closeSearch,
        messIndex,
        setMessIndex,
        threadId,
        refetch,
    }) => {


    const onClickCancel = () => {
        console.log("onclickcancel")
        closeSearch()
        // setSearchValue("")
        // setSearchActive(false)
        // setMatchedMessageCurr("")
        // setMatchedMessages([])
    }

    const onNewMessage = (newIndex) => {
        if(matchedMessages[newIndex]) {
            refetch({
                threadId: threadId,
                searchedCursor: matchedMessages[newIndex].id,
                limit: 10,
                notifyOnNetworkStatusChange: true,
                options: { fetchPolicy: 'no-cache' },
            });

        }
    }

    return (
        <div className='matchMessagesRouter'>
            <Row justify="space-between" style={{ display:'flex' }}>
                <Col span={12} style={{ display: 'flex', alignItems: 'center' }}>
                    <ButtonGroup>
                        <Button 
                            disabled={isGreaterThanTotal(messIndex, matchedMessages)}
                            onClick={() => { console.log("up set");
                            const newIndex = messIndex + 1;
                            setMessIndex(newIndex); 
                            // setMatchedMessageCurr(matchedMessages[newIndex])
                            onNewMessage(newIndex);
                            console.log("indexx", matchedMessages[newIndex])
                        }}>
                            <UpOutlined />
                        </Button>
                        <Button disabled={messIndex <= 0} onClick={() => { 
                            const newIndex = messIndex - 1;
                            setMessIndex(newIndex);  //setMatchedMessageCurr(matchedMessages[messIndex])
                            onNewMessage(newIndex);
                            console.log("indexx", matchedMessages[newIndex])
                        }}>
                            <DownOutlined />
                        </Button>
                    </ButtonGroup>
                    <Text style={{ paddingLeft: '8px' }}>
                        <Text strong> {searchValue} </Text> için {messIndex + 1} / {matchedMessages.length} sonuç.
                    </Text>
                </Col>
                <Col span={4} offset={8} style={{
                    flexDirection: 'row-reverse',
                    flex: '1 1',
                    padding: '10px',
                    display: 'flex'
                }}>
                    <Button type="primary" onClick={() => {onClickCancel()}}>Kapat</Button>
                </Col>
            </Row>
        </div>
    )
}

// MatchedMessagesWO.whyDidYouRender = true;

export const MatchedMessages = React.memo(MatchedMessagesWO);