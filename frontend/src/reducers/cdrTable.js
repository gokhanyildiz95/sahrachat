
const initialState = {
    data: [],
    loading: false,
    error: false,
    searchText: "",
    pagination: {
        current: 1, pageSize: 10, bottom: 'bottomRight'
    },
};


export default function cdrTable(
    state: typeof initialState = initialState,
    action: Object
) {
    const { type, payload } = action;
    console.log("type", type, " action", action)
    switch (type) {
        case "CDR_TABLE_NEW_DATA":
            return {
                ...state,
                data: payload
            }
        case "CDR_TABLE_NEW_PAGINATION":
            return {
                ...state,
                pagination: payload
            }
        case "CDR_TABLE_NEW_LOADING":
            return {
                ...state,
                loading: payload
            }
        case "CDR_TABLE_NEW_SEARCH":
            return {
                ...state,
                searchText: payload,
            }
        case "CDR_TABLE_NEW_ERROR":
            return {
                ...state,
                error: payload,
            }

        default:
            return state;
    }
}