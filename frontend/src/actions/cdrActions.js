export const setData = (data) => {
  return { type: "CDR_TABLE_NEW_DATA", payload: data }
}

export const setPagination = (data) => {
  return { type: "CDR_TABLE_NEW_PAGINATION", payload: data }
}

export const setLoading = (data) => {
  return { type: "CDR_TABLE_NEW_LOADING", payload: data }
}

export const setSearchedText = (data) => {
  return { type: "CDR_TABLE_NEW_SEARCH", payload: data }
}

export const setError = (data) => {
  return { type: "CDR_TABLE_NEW_ERROR", payload: data }
}