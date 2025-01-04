import React, { useState } from 'react';

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
            const response = await fetch('/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData }),
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                setErrorMessage('');
            } else {
                setErrorMessage(data.error || data.message);
            }
        } catch (err) {
            setErrorMessage('Failed to login. Try again.');
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
                        <button type="submit" className="btn btn-primary w-100" disabled={isLoading}>
                            {isLoading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginComponent;
