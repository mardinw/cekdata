
export const processDOBAndGender = (dob: string, gender: string): string => {
    const date = new Date(dob);
    let day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear() % 100;

    if (gender === 'P') {
        day += 40;
    }

    // format tanggal menjadi ddmmyy
    const ttl = `${day.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${year.toString().padStart(2, '0')}`;
    return ttl;
}