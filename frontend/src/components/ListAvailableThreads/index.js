import React, { useCallback, useEffect, useState } from 'react';
import { Empty, Divider } from 'antd';
import { ThreadList } from '../ThreadList';
import { SearchedMessages } from '../ListSearchedMessages'

const getDisplayName = (item, userId) => {
    if (item.isGroup) return item.groupInfo.name;
    const members = notMe(item.members, userId)
    return `${members[0].name} ${members[0].surname}`
}

const notMe = (members, userId) => { return members.filter(member => member.i_user !== userId.toString()) }

const filterThreads = (searchValue, threads, userId) => {
    if (!threads) return threads;
    const match = new RegExp(searchValue, 'i');
    const filteredData = threads.filter(thread => {
        const title = getDisplayName(thread, userId)
        if (match.test(title)) {
            return true;
        }
        return false;
    })
    return filteredData;

}

export const ListAvailableThreads = props => {
    const { threads, searchValue, searchActive, userId, onThreadClick, setMatchedMessages, setMatchedMessage } = props;
    const [data, setData] = useState([]);

    useEffect(() => {
        if (searchValue) {
            return setData(filterThreads(searchValue, threads, userId))
        }
        setData(threads)
        return () => {
            setData([])
        }
    }, [threads])

    useEffect(() => {
        console.log("search value", searchValue)
        if (searchValue === "") {
            return setData(threads);
        }
        setData(filterThreads(searchValue, threads, userId))
    }, [searchValue])


    return (
        <div>
            {
                (data) ?
                    <div>
                        <Divider orientation="left">Konuşmalar</Divider>
                        {
                        (data.length > 0) ? 
                            <ThreadList
                                threads={data}
                                userId={userId}
                                onThreadClick={onThreadClick}
                            /> : <Empty description={<span>Konuşma yok</span>}/>

                        }
                        {
                            (searchActive && searchValue.length >= 3) &&
                            <>
                                <Divider orientation="left">Arama Sonuçları</Divider>
                                <SearchedMessages
                                    setMatchedMessages={setMatchedMessages}
                                    setMatchedMessage={setMatchedMessage}
                                    searchValue={searchValue}
                                    userId={userId}
                                    onThreadClick={onThreadClick}
                                />
                            </>

                        }
                    </div>
                    :
                    <div></div>
            }
        </div>
    )
}