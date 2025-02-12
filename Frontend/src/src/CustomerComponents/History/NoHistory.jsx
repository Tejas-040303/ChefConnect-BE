import React from 'react';
import { Link } from 'react-router-dom';
function NoHistory() {
    return ( 
        <div className="container" style={{margin:'auto', top:'100px'}}>
            <h2>No History</h2>
            <p>You have not placed any booking till now.</p>
            <Link to={'/customer/dashboard'}>Book a CHEF Now</Link>
        </div>
     );
}

export default NoHistory;