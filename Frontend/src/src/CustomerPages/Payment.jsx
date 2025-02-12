import React from 'react';
import { useParams } from 'react-router-dom';

function Payment() {
    const { chefId } = useParams(); // Retrieve chefId from URL

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>Payment</h2>
            <p>Processing payment for Chef ID: {chefId}</p>
        </div>
    );
}

export default Payment;
