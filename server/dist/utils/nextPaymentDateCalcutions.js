"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function calculateNextPaymentDate(startDate, endDate) {
    const today = new Date();
    const leaseEndDate = new Date(endDate);
    // If lease has ended, calculate next payment for potential renewal
    if (today >= leaseEndDate) {
        const nextPaymentDate = new Date(leaseEndDate);
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        return nextPaymentDate;
    }
    // If lease is active, next payment is one month after endDate (for annual payment)
    const nextPaymentDate = new Date(startDate);
    nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    return nextPaymentDate;
}
exports.default = calculateNextPaymentDate;
