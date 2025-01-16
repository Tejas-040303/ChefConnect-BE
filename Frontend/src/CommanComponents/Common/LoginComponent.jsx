import React, { useState } from "react";
import axios from 'axios';

function LoginComponent() {
    const [selectedRole, setSelectedRole] = useState('');
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleRoleSelection = (role) => {
        setSelectedRole(role);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const payload = { ...formData, role: selectedRole };
            const response = await axios.post('http://localhost:8080/auth/login', payload);

            if (response.status === 200) {
                const data = response.data;
                alert(data.message);
                setErrorMessage('');

                // Redirect based on role
                if (data.role === 'Chef') {
                    window.location.href = '/chef/dashboard';
                } else if (data.role === 'Customer') {
                    window.location.href = '/customer/';
                }
            }
        } catch (err) {
            setErrorMessage(err.response?.data?.error || 'Failed to login. Try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container my-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <form onSubmit={handleLogin} className="p-4 border rounded shadow-lg bg-light">
                        <h2 className="text-center mb-4">Welcome Back</h2>
                        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
                        
                        {/* Role Selection Dropdown */}
                        <div className="dropdown my-4">
                            <button
                                className="btn dropdown-toggle"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                            >
                                {selectedRole ? `Login as: ${selectedRole}` : 'Login as:'}
                            </button>
                            <ul className="dropdown-menu">
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => handleRoleSelection('Chef')}
                                    >
                                        Chef
                                    </button>
                                </li>
                                <li>
                                    <button
                                        className="dropdown-item"
                                        type="button"
                                        onClick={() => handleRoleSelection('Customer')}
                                    >
                                        Customer
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div className="form-group my-3">
                            <label htmlFor="email" className="form-label">Email Address</label>
                            <input
                                type="email"
                                className="form-control"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Enter email"
                                required
                            />
                        </div>
                        <div className="form-group my-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                placeholder="Enter password"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary w-100"
                            disabled={isLoading || !selectedRole}
                        >
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;

