import React from 'react';
import '../../../public/css/CommanCss/ContactUs.css';
function ContactUS() {
    return ( 
        <div className="form">
                <div className="form-group mb-3">
                    <label htmlFor="name">Name:</label>
                    <input type="text" className="form-control form-name" id="name" name="name" required />
                </div>
                <div className=" mb-3">
                    <label htmlFor="email">Email:</label>
                    <input type="email" className="form-control form-email" id="email" name="email" required />
                </div>
                <div class="dropdown my-4">
                    <button class="btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                        Sending Query as:
                    </button>
                    <ul class="dropdown-menu">
                        <li><a class="dropdown-item" href="#">Chef</a></li>
                        <li><a class="dropdown-item" href="#">Customer</a></li>
                        <li><a class="dropdown-item" href="#">Anonymous</a></li>
                    </ul>
                </div>
                <div className="form-group mb-3">
                    <label htmlFor="query">Query:</label>
                    <textarea className="form-control" id="query" name="query" rows="4" columns="5" required></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </div>
     );
}

export default ContactUS;