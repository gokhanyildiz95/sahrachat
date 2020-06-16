import React, { useEffect, useState } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux'
import { setData, setPagination, setLoading, setSearchedText, setError } from '../../actions/crmActions';
import { Table, Input, Button, Tooltip, Result } from 'antd';
import Icon from '../icon';
import SipContext from '../../lib/sip_context';
import {
    SIP_STATUS_DISCONNECTED,
} from "../SipProvider/enums";

const getCrmUrl = (oid) => `${window.location.origin}/crm/#edit_customer_${oid}`

const getQueryParams = params => {
    return {
        length: params.pagination.pageSize,
        start: params.pagination.current - 1,
        ...params,
    };
};

const CrmUsersTable = () => {
    const dispatch = useDispatch()
    const data = useSelector(state => state.crmTable.data)
    const pagination = useSelector(state => state.crmTable.pagination)
    const loading = useSelector(state => state.crmTable.loading)
    const searchText = useSelector(state => state.crmTable.searchText)
    const error = useSelector(state => state.crmTable.error)
    // const [data, setData] = useState([]);
    // const [pagination, setPagination] = useState({ current: 1, pageSize: 10, bottom: 'bottomRight' });
    // const [loading, setLoading] = useState(false);
    // const [searchText, setSearchedText] = useState("");
    const { startCall, status } = React.useContext(SipContext);


    const columns = [
        {
            title: 'Adı Soyadı',
            dataIndex: 'name',
            render: (text, record) => <Tooltip title="Müşteri Detaylarını gör"><a href={getCrmUrl(record._id.$oid)} target="_blank" >{text}</a></Tooltip>,
        },
        {
            title: 'Telefon',
            dataIndex: 'phone',
            responsive: ['md'],
            render: (text, record) =>
                (text) &&
                <Tooltip title="Ara">
                    <div
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        onClick={() => (status !== SIP_STATUS_DISCONNECTED) ? startCall(text) : alert('Softphone kayıtlı değil!')}
                    >
                        <Icon glyph="call-2" />
                        {text}
                    </div>
                </Tooltip>
        },
        {
            title: 'Email',
            dataIndex: 'email',
            responsive: ['md'],
            render: (text) => <Tooltip title="Mail Gönder"><a href={`${window.location.origin}/mobimail/conversation/new/view`} target="_blank">{text}</a></Tooltip>
        },
    ];
    useEffect(() => {
        console.log("data", data)
        if (data.length <= 0)
            fetchData({ pagination });

    }, [])

    const handleTableChange = (pagination, filters, sorter) => {
        console.log("sorter", sorter, "pagination", pagination, "filters", filters);
        fetchData({
            pagination,
            ...filters,
        })
    }

    const fetchData = (params = {}) => {
        console.log("params", params)
        dispatch(setLoading(true));
        dispatch(setError(false));
        fetch(
            `${window.location.origin}/crm/customer_list/`,
            {
                method: 'post',
                body: JSON.stringify(getQueryParams(params)),
            }
        )
            .then(response => response.json())
            .then(result => {
                console.log(result);
                dispatch(setData(result.data));
                dispatch(setLoading(false));
                dispatch(setPagination({
                    ...params.pagination,
                    total: result.count,
                }))
            })
            .catch(error => {
                console.log("error", error);
                dispatch(setLoading(false));
                dispatch(setError(true));
            });
    };

    const handleSearch = () => {
        fetchData({ pagination: { current: 1, pageSize: 10, bottom: 'bottomRight' }, search: searchText })
    }


    return (
        <section style={{ padding: "20px 60px" }}>
            <header style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginBottom: "10px"
            }}>
                <h1 style={{ marginRight: "auto" }}>Kişiler</h1>
                <Input.Search
                    placeholder={`Ara `}
                    value={searchText}
                    onChange={e => dispatch(setSearchedText(e.target.value))}
                    onSearch={() => handleSearch()}
                    onPressEnter={() => handleSearch()}
                    style={{ width: 188, marginBottom: 8}}
                />
            </header>
            {
                (!error) ?
                    <Table
                        columns={columns}
                        rowKey={record => record._id.$oid}
                        dataSource={data}
                        pagination={pagination}
                        loading={loading}
                        onChange={handleTableChange}
                    /> :
                    <Result
                        status="500"
                        title="Sistemde Hata Var"
                        subTitle="Lütfen bize ulaşın"
                    />
            }
        </section>
    )
}

export default CrmUsersTable