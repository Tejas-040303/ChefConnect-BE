import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ChefTrainingRequest() {
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeRequest, setActiveRequest] = useState(null);
    const [feedback, setFeedback] = useState('');
    const [scheduledDate, setScheduledDate] = useState('');
    const [trainingInstructions, setTrainingInstructions] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchTrainingRequests = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:8080/admin/cheftraining', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setTrainingRequests(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching training requests:', err);
                setError('Failed to load training requests. Please try again later.');
                setLoading(false);
            }
        };
        fetchTrainingRequests();
    }, []);

    const handleStatusUpdate = async (requestId, newStatus) => {
        try {
            const token = localStorage.getItem('token');
            const updateData = {
                status: newStatus,
                adminFeedback: feedback
            };

            if (newStatus === 'approved') {
                if (!scheduledDate) {
                    setError('Scheduled date is required for approval');
                    setTimeout(() => {
                        setError(null);
                    }, 3000);
                    return;
                }
                updateData.scheduledDate = scheduledDate;

                // Add training instructions to update data
                if (Object.keys(trainingInstructions).length > 0) {
                    updateData.trainingInstructions = trainingInstructions;
                }
            }

            const response = await axios.put(
                `http://localhost:8080/admin/cheftraining/${requestId}`,
                updateData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.data.success) {
                // Update the local state to reflect changes
                setTrainingRequests(prevRequests =>
                    prevRequests.map(req =>
                        req._id === requestId
                            ? {
                                ...req,
                                status: newStatus,
                                adminFeedback: feedback,
                                scheduledDate: newStatus === 'approved' ? scheduledDate : req.scheduledDate,
                                trainingInstructions: newStatus === 'approved' ? trainingInstructions : req.trainingInstructions
                            }
                            : req
                    )
                );
                setActiveRequest(null);
                setFeedback('');
                setScheduledDate('');
                setTrainingInstructions({});
                setSuccessMessage(`Training request ${newStatus} successfully`);
                setTimeout(() => {
                    setSuccessMessage('');
                }, 3000);
            }
        } catch (err) {
            console.error('Error updating training request:', err);
            setError('Failed to update training request. Please try again.');
            setTimeout(() => {
                setError(null);
            }, 3000);
        }
    };

    const handleSelectRequest = (request) => {
        setActiveRequest(request);
        setFeedback(request.adminFeedback || '');
        setScheduledDate(request.scheduledDate ? new Date(request.scheduledDate).toISOString().slice(0, 16) : '');

        // Initialize training instructions state from request data
        if (request.trainingInstructions) {
            setTrainingInstructions(request.trainingInstructions);
        } else {
            // Clear previous instructions
            setTrainingInstructions({});
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not scheduled';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'completed':
                return 'bg-blue-100 text-blue-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-center items-center h-64">
                    <div className="animate-pulse flex flex-col items-center">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-amber-500 rounded-full animate-spin"></div>
                        <p className="mt-4 text-gray-600">Loading training requests...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="bg-red-50 p-4 rounded-md border border-red-200">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-5 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Chef Training Requests</h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Manage all chef training requests. Review, approve, or reject requests.
                    </p>
                </div>

                {successMessage && (
                    <div className="mx-6 mt-4 bg-green-50 p-4 rounded-md border border-green-200">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                        fillRule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-green-800">{successMessage}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Chef
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Training Type
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Preferred Time
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Status
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Request Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Scheduled Date
                                </th>
                                <th
                                    scope="col"
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trainingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                        No training requests found.
                                    </td>
                                </tr>
                            ) : (
                                trainingRequests.map(request => (
                                    <tr key={request._id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <div className="text-sm font-medium text-gray-900">{request.chefName}</div>
                                                <div className="text-sm text-gray-500">{request.chefEmail}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col space-y-1">
                                                {request.trainingOptions.map((option, index) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {option}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.preferredTimeSlot}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                    request.status
                                                )}`}
                                            >
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(request.scheduledDate)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            {request.status === 'pending' && (
                                                <button
                                                    onClick={() => handleSelectRequest(request)}
                                                    className="text-amber-600 hover:text-amber-900 mr-4 focus:outline-none focus:underline"
                                                >
                                                    Review
                                                </button>
                                            )}
                                            {request.status !== 'pending' && (
                                                <button
                                                    onClick={() => handleSelectRequest(request)}
                                                    className="text-blue-600 hover:text-blue-900 focus:outline-none focus:underline"
                                                >
                                                    View Details
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {activeRequest && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center  z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full h-[60vh] mx-4 overflow-y-scroll">
                        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-medium text-gray-900">Training Request Details</h3>
                                <button
                                    type="button"
                                    className="text-gray-400 hover:text-gray-500"
                                    onClick={() => {
                                        setActiveRequest(null);
                                        setFeedback('');
                                        setScheduledDate('');
                                        setTrainingInstructions({});
                                    }}
                                >
                                    <span className="sr-only">Close</span>
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M6 18L18 6M6 6l12 12"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chef Name</label>
                                    <p className="mt-1 text-sm text-gray-900">{activeRequest.chefName}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <p className="mt-1 text-sm text-gray-900">{activeRequest.chefEmail}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Training Options</label>
                                <div className="mt-1 flex flex-wrap gap-2">
                                    {activeRequest.trainingOptions.map((option, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                        >
                                            {option}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Preferred Time Slot</label>
                                    <p className="mt-1 text-sm text-gray-900">{activeRequest.preferredTimeSlot}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Status</label>
                                    <p className="mt-1">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(
                                                activeRequest.status
                                            )}`}
                                        >
                                            {activeRequest.status.charAt(0).toUpperCase() + activeRequest.status.slice(1)}
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 min-h-12">
                                    {activeRequest.additionalNotes || "No additional notes provided."}
                                </p>
                            </div>

                            {activeRequest.adminFeedback && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Admin Feedback</label>
                                    <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200 min-h-12">
                                        {activeRequest.adminFeedback}
                                    </p>
                                </div>
                            )}

                            {/* Display training instructions if they exist */}
                            {activeRequest.trainingInstructions && Object.keys(activeRequest.trainingInstructions).length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700">Training Instructions</label>
                                    {activeRequest.trainingOptions.map((option, index) => (
                                        activeRequest.trainingInstructions[option] && (
                                            <div key={index} className="mt-2">
                                                <p className="text-sm font-medium text-gray-700">{option}:</p>
                                                <p className="mt-1 text-sm text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">
                                                    {activeRequest.trainingInstructions[option]}
                                                </p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            )}

                            {activeRequest.status === 'pending' && (
                                <>
                                    <div className="mb-4">
                                        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700">
                                            Feedback (optional)
                                        </label>
                                        <textarea
                                            id="feedback"
                                            rows="3"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                            placeholder="Add feedback for the chef"
                                            value={feedback}
                                            onChange={e => setFeedback(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div className="mb-4">
                                        <label htmlFor="scheduledDate" className="block text-sm font-medium text-gray-700">
                                            Schedule Date (required for approval)
                                        </label>
                                        <input
                                            type="datetime-local"
                                            id="scheduledDate"
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                            value={scheduledDate}
                                            onChange={e => setScheduledDate(e.target.value)}
                                        />
                                    </div>

                                    {/* Add Training Instructions Section */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Training Instructions</label>
                                        <p className="text-xs text-gray-500 mb-2">Provide specific instructions for each selected training option</p>

                                        {activeRequest.trainingOptions.map((option, index) => (
                                            <div key={index} className="mb-3">
                                                <label className="block text-sm text-gray-700 mb-1">
                                                    {option}
                                                </label>
                                                <textarea
                                                    rows="2"
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                                                    placeholder={`Instructions for ${option}...`}
                                                    value={trainingInstructions[option] || ''}
                                                    onChange={(e) => {
                                                        setTrainingInstructions({
                                                            ...trainingInstructions,
                                                            [option]: e.target.value
                                                        });
                                                    }}
                                                ></textarea>
                                            </div>))}
                                    </div></>)}
                        </div>
                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                            <button
                                type="button"
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 mr-3"
                                onClick={() => {
                                    setActiveRequest(null);
                                    setFeedback('');
                                    setScheduledDate('');
                                    setTrainingInstructions({});
                                }}
                            >
                                Cancel
                            </button>
                            {activeRequest.status === 'pending' && (
                                <>
                                    <button
                                        type="button"
                                        className="mr-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        onClick={() => handleStatusUpdate(activeRequest._id, 'rejected')}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                                        onClick={() => handleStatusUpdate(activeRequest._id, 'approved')}
                                    >
                                        Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>)}
        </div>);
}

export default ChefTrainingRequest;