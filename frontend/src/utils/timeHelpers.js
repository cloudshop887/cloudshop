/**
 * Formats a time string (HH:mm) to AM/PM format (e.g. 9:00 AM)
 * @param {string} timeString - Time in HH:mm format
 * @returns {string} Formatted time
 */
export const formatTimeAMPM = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    const h = parseInt(hours);
    const m = parseInt(minutes);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m < 10 ? '0' + m : m} ${ampm}`;
};

/**
 * Checks if a shop is currently open based on its opening and closing times.
 * Only works if both times are provided in HH:mm format.
 * @param {string} openTime - Opening time in HH:mm
 * @param {string} closeTime - Closing time in HH:mm
 * @returns {boolean|null} true if open, false if closed, null if times invalid
 */
export const checkShopOpen = (openTime, closeTime) => {
    if (!openTime || !closeTime) return null;

    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [openH, openM] = openTime.split(':').map(Number);
    const [closeH, closeM] = closeTime.split(':').map(Number);

    const startMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    if (startMinutes <= endMinutes) {
        // Normal case (e.g. 09:00 to 21:00)
        return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
    } else {
        // Overnight case (e.g. 21:00 to 03:00)
        return currentMinutes >= startMinutes || currentMinutes <= endMinutes;
    }
};

/**
 * Generates a readable range string (e.g. "9:00 AM - 5:00 PM")
 * @param {string} openTime 
 * @param {string} closeTime 
 * @returns {string}
 */
export const getOpeningHoursString = (openTime, closeTime) => {
    if (!openTime || !closeTime) return '';
    return `${formatTimeAMPM(openTime)} - ${formatTimeAMPM(closeTime)}`;
};
