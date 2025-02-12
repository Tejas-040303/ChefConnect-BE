import React from 'react';
import { useLocation } from 'react-router-dom';
import chefBookings from '../../data/chefBookingStatus';

function HasBooking() {
    const location = useLocation();
    const { chef } = location.state || {}; // Fallback if no data is provided

    return (
        <div>
            {!chef ? (
                <div>
                    <h1 className='text-center' style={{ margin: '50px' }}>Book Chef Now</h1>
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
                            {chefBookings.map((booking) => (
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
            ) : (
                <div>
                    <table border="1">
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
                            <tr>
                                <td>1</td>
                                <td>{chef.chefName}</td>
                                <td>{chef.chefSpecialty}</td>
                                <td>{chef.price}</td>
                                <td>{chef.date}</td>
                                <td>{chef.status}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default HasBooking;
