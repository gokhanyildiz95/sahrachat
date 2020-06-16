import React, {useEffect, useState, useRef} from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';


const SearchThreads = props => {
    const node = useRef();
    const { closeSearch, setSearchActive, setSearchValue, searchActive } = props;
    const [localSearchValue, setLocalSearchValue] = useState("")

    const escFunction = (event) => {
        if (event.keyCode === 27) {
            console.log("bluring")
            document.activeElement.blur();
            setLocalSearchValue("")
            setSearchActive(false)
        }
    };

    const handleClickOutside = e => {
        console.log("clicking anywhere localvla", localSearchValue);
        if (node.current.contains(e.target) || localSearchValue.length >= 3) {
          // inside click
          return;
        }
        // outside click
        setLocalSearchValue("")
        setSearchActive(false);
      };

    useEffect(() => {
        if (searchActive) {
          document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("keydown", escFunction);
        } else {
          document.removeEventListener("mousedown", handleClickOutside);
        }
    
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", escFunction);
        };
      }, [searchActive, localSearchValue]);



    useEffect(() => {
        setSearchValue(localSearchValue)
    }, [localSearchValue])



    const onSearchClicked = (e) => {
        setSearchActive(true)
        console.log("search active now")
    } 
    
    const onSearchChanged = async (e) => {
        console.log("search changed fetching", e.target.value)
        setLocalSearchValue(e.target.value)
    } 

    return (
        <div ref={node}>
        <Input
            placeholder="Ara "
            allowClear
            value={localSearchValue}
            onChange={onSearchChanged}
            onClick={onSearchClicked}
            prefix={<SearchOutlined />} />

        </div>
    )
}

// SearchThreads.whyDidYouRender = true;

export const MemoSearchThreads = React.memo(SearchThreads);