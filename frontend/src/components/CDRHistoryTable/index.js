import React, { useEffect, useState } from 'react';
import { connect, useSelector, useDispatch } from 'react-redux'
import { setData, setPagination, setLoading, setSearchedText, setError } from '../../actions/cdrActions';
import { Table, Input, Button, Tooltip, Result } from 'antd';
import {
    LoginOutlined,
    LogoutOutlined
} from '@ant-design/icons';
import moment from 'moment';
import 'moment/locale/tr';
import SipContext from '../../lib/sip_context';
import {
    SIP_STATUS_DISCONNECTED,
} from "../SipProvider/enums";

const getCrmUrl = (oid) => `${window.location.origin}/crm/#edit_customer_${oid}`

const getQueryParams = params => {
    return {
        length: params.pagination.pageSize,
        start: params.pagination.current - 1,
        is_agent_cdr: true,
        'search[value]': '',
        'search[string]': '',
        ...params,
    };
};

const CDRHistoryTable = () => {
    const dispatch = useDispatch()
    const data = useSelector(state => state.cdrTable.data)
    const pagination = useSelector(state => state.cdrTable.pagination)
    const loading = useSelector(state => state.cdrTable.loading)
    const searchText = useSelector(state => state.cdrTable.searchText)
    const error = useSelector(state => state.cdrTable.error)
    // const [data, setData] = useState([]);
    // const [pagination, setPagination] = useState({ current: 1, pageSize: 10, bottom: 'bottomRight' });
    // const [loading, setLoading] = useState(false);
    // const [searchText, setSearchedText] = useState("");
    const { startCall, status } = React.useContext(SipContext);


    const columns = [
        {
            title: 'Kişi',
            dataIndex: 'destination_number',
            render: (text, record) => {
                let dnumber;
                if (record.call_direction === "local") {
                    //local call
                    const direction = record.local_direction
                    if (direction == "incoming") {
                        dnumber = record.caller_info.switch_caller_id_number;
                    } else {
                        dnumber = text;
                    }
                } else {
                    dnumber = text;
                }
                return (
                    <Tooltip placement="topLeft" title="Tekrar Ara">
                        <div style={{ cursor: 'pointer' }} 
                        onClick={() => (status !== SIP_STATUS_DISCONNECTED) ? startCall(dnumber) : alert('Softphone kayıtlı değil!')}>

                            {dnumber}
                        </div>
                    </Tooltip>
                )
            }
        },
        {
            title: 'CRM Kaydı',
            dataIndex: 'crm',
            render: (text, record) => {
                let uname;
                let oid;
                if ((text != null) && (text != '') && (text.length > 0)) {
                    oid = text.split('_')[0];
                    uname = text.split('_')[1];
                }
                return (
                    (oid) ?
                        <a href={getCrmUrl(oid)} target='_blank'>
                            {uname}
                        </a> :
                        <a href={`${window.location.origin}/crm/#new_customer`} target='_blank'> Yeni Kayıt oluştur +</a>
                )
            }

        },
        {
            title: 'Çağrı Tipi',
            dataIndex: 'call_direction',
            render: (text, record) => {
                let direction;
                console.log("calldir", text)
                if (!text) return (<></>);
                if (text === "local")
                    direction = record.local_direction === "incoming" ? "Gelen Çağrı" : "Giden Çağrı";
                else
                    direction = text === "incoming" ? "Gelen Çağrı" : "Giden Çağrı"
                return (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        {
                            (direction === "Giden Çağrı") ? <LogoutOutlined /> : <LoginOutlined />
                        }
                        <div style={{ paddingLeft: '4px' }}>
                            {
                                direction
                            }

                        </div>
                    </div>
                )
            }
        },
        {
            title: 'Süre',
            dataIndex: 'billsec',
            render: (text, record) => {
                const date = new Date(null);
                date.setSeconds(text);
                const sec = date.toISOString().split('T')[1].split('.')[0]
                console.log("sec", sec)
                return (
                    sec
                )
            }
        },
        {
            title: 'Tarih',
            dataIndex: 'start_stamp',
            render: (text, record) => moment(text.$date).format('LLLL')
        }

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
            `${window.location.origin}/cdr_list_api/`,
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
                    total: result.recordsFiltered,
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
                <h1 style={{ marginRight: "auto" }}>Geçmiş</h1>
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
                        recordKey={record => record.uuid}
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

export default CDRHistoryTable