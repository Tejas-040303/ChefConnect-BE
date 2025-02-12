import React from 'react';
import chefBookingHistory from '../../data/chefBookingHistoryStatus.js';

function HasHistory() {
    return (
        <div>
            <h2 className='text-center' style={{ margin: '20px' }}>History</h2>
            <table border="1" style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th>Sr No.</th>
                        <th>Chef Name</th>
                        <th>Specialty</th>
                        <th>Price</th>
                        <th>Date</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {chefBookingHistory.map((booking) => (
                        <tr key={booking.SrNo}>
                            <td>{booking.SrNo}</td>
                            <td>{booking.chefName}</td>
                            <td>{booking.chefSpecialty}</td>
                            <td>{booking.price}</td>
                            <td>{booking.date}</td>
                            <td>{booking.status}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default HasHistory;
