export const formatDate = ( date:string ) :string => {
    // change string to object date
    const dateObj = new Date(date);
    const year = dateObj.getFullYear().toString().slice(-2);
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const datefound= dateObj.getDate().toString().padStart(2, '0');

    return datefound + month + year;
}