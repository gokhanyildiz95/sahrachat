export const hasStringElements = (arr) => {
    if (Array.isArray(arr)) return arr.some(elem => hasStringElements(elem));
  
    return typeof arr === 'string';
  };