import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';

const ChefTraining = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [trainingRequests, setTrainingRequests] = useState([]);
    const [availableTrainings, setAvailableTrainings] = useState([]);
    
    // Add state for selected request and modal
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showInstructionsModal, setShowInstructionsModal] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({
        trainingOptions: [],
        preferredTimeSlot: '',
        additionalNotes: ''
    });

    // Fetch chef's training requests
    const fetchTrainingRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8080/chef/training/requests');
            setTrainingRequests(response.data.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching training requests:', error);
            toast.error('Failed to load training requests');
            setLoading(false);
        }
    };

    // Fetch available training options
    const fetchAvailableTrainings = async () => {
        try {
            const response = await axios.get('http://localhost:8080/chef/training/available');
            setAvailableTrainings(response.data.data);
        } catch (error) {
            console.error('Error fetching available trainings:', error);
            toast.error('Failed to load training options');
        }
    };

    useEffect(() => {
        fetchTrainingRequests();
        fetchAvailableTrainings();
    }, []);

    // Handle form input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle checkbox changes for training options
    const handleCheckboxChange = (option) => {
        const updatedOptions = [...formData.trainingOptions];
        
        if (updatedOptions.includes(option)) {
            // Remove the option if already selected
            const index = updatedOptions.indexOf(option);
            updatedOptions.splice(index, 1);
        } else {
            // Add the option if not already selected
            updatedOptions.push(option);
        }
        
        setFormData({
            ...formData,
            trainingOptions: updatedOptions
        });
    };

    // Submit training request
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.trainingOptions.length === 0) {
            toast.error('Please select at least one training option');
            return;
        }
        
        if (!formData.preferredTimeSlot) {
            toast.error('Please specify your preferred time slot');
            return;
        }
        
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/chef/training/request', formData);
            console.log('Response:', response.data);
            if (response.data.success) {
                toast.success('Training request submitted successfully');
                setShowModal(false);
                fetchTrainingRequests(); // Refresh list
                
                // Reset form
                setFormData({
                    trainingOptions: [],
                    preferredTimeSlot: '',
                    additionalNotes: ''
                });
            }
            setLoading(false);
        } catch (error) {
            console.error('Error submitting training request:', error);
            toast.error(error.response?.data?.message || 'Failed to submit training request');
            setLoading(false);
        }
    };

    // Cancel a training request
    const handleCancelRequest = async (requestId) => {
        if (window.confirm('Are you sure you want to cancel this training request?')) {
            try {
                setLoading(true);
                const response = await axios.delete(`http://localhost:8080/chef/training/cancel/${requestId}`);
                
                if (response.data.success) {
                    toast.success('Training request cancelled successfully');
                    fetchTrainingRequests(); // Refresh list
                }
                setLoading(false);
            } catch (error) {
                console.error('Error cancelling training request:', error);
                toast.error(error.response?.data?.message || 'Failed to cancel training request');
                setLoading(false);
            }
        }
    };

    // Function to handle viewing instructions
    const handleViewInstructions = (request) => {
        setSelectedRequest(request);
        setShowInstructionsModal(true);
    };

    // Format date for display
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    // Get appropriate badge color based on status
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Render training details with instructions button when available
    const renderTrainingDetails = (request) => {
        if (request.status === 'approved' && request.trainingInstructions) {
            return (
                <div className="mt-2">
                    <button 
                        onClick={() => handleViewInstructions(request)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                        View Training Instructions
                    </button>
                </div>
            );
        }
        return null;
    };

    // Instructions modal
    const renderInstructionsModal = () => {
        if (!showInstructionsModal || !selectedRequest) return null;
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-lg mx-4 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Training Instructions</h2>
                        <button 
                            onClick={() => setShowInstructionsModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-medium text-lg">Scheduled Date</h3>
                        <p className="text-gray-600">{formatDate(selectedRequest.scheduledDate)}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-medium text-lg">Admin Feedback</h3>
                        <p className="text-gray-600">{selectedRequest.adminFeedback || "No feedback provided."}</p>
                    </div>
                    <div className="mb-4">
                        <h3 className="font-medium text-lg mb-2">Instructions by Training Type</h3>
                        {selectedRequest.trainingOptions.map((option, index) => (
                            <div key={index} className="mb-3 p-3 bg-gray-50 rounded-md">
                                <h4 className="font-medium text-blue-600">{option}</h4>
                                <p className="mt-1">
                                    {selectedRequest.trainingInstructions && selectedRequest.trainingInstructions[option] 
                                        ? selectedRequest.trainingInstructions[option] 
                                        : "No specific instructions provided for this training."}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="flex justify-end">
                        <button 
                            onClick={() => setShowInstructionsModal(false)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="chef-training container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Chef Training</h1>
                <button 
                    onClick={() => setShowModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                >
                    Request Training
                </button>
            </div>

            {/* Training requests list */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Your Training Requests</h2>
                
                {loading ? (
                    <p className="text-center py-4">Loading...</p>
                ) : trainingRequests.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date Requested
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Training Options
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Preferred Time
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {trainingRequests.map((request) => (
                                    <tr key={request._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(request.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <ul className="list-disc ml-4">
                                                {request.trainingOptions.map((option, index) => (
                                                    <li key={index}>{option}</li>
                                                ))}
                                            </ul>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {request.preferredTimeSlot}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                                                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            {request.status === 'pending' && (
                                                <button
                                                    onClick={() => handleCancelRequest(request._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    Cancel
                                                </button>
                                            )}
                                            {request.status === 'approved' && request.scheduledDate && (
                                                <div className="text-green-600">
                                                    Scheduled for {formatDate(request.scheduledDate)}
                                                    {renderTrainingDetails(request)}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text-center py-4 text-gray-500">You haven't requested any training sessions yet.</p>
                )}
            </div>

            {/* Training information section */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold mb-4">Available Training Programs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableTrainings.map((training, index) => (
                        <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                            <h3 className="font-medium text-lg">{training}</h3>
                            <p className="text-gray-600 mt-2">
                                {training === "Advanced Continental Cuisine" && "Master advanced European cooking techniques and gourmet recipes."}
                                {training === "Food Hygiene and Safety" && "Learn essential food safety protocols and health regulations."}
                                {training === "Plating and Presentation" && "Develop artistic plating skills to enhance food presentation."}
                                {training === "Customer Service Training" && "Improve customer interaction and service excellence."}
                                {training === "Online Order Management" && "Learn efficient techniques for handling digital orders and delivery."}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for requesting training */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg w-full max-w-md mx-4 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Request Training</h2>
                            <button 
                                onClick={() => setShowModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                &times;
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* Hidden fields with auto-filled data */}
                            <input type="hidden" name="chefId" value={user?._id || ''} />
                            <input type="hidden" name="name" value={user?.name || ''} />
                            <input type="hidden" name="email" value={user?.email || ''} />
                            
                            {/* Training Options */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Training Options (Select at least one)
                                </label>
                                <div className="space-y-2">
                                    {availableTrainings.map((option, index) => (
                                        <div key={index} className="flex items-center">
                                            <input
                                                type="checkbox"
                                                id={`training-${index}`}
                                                checked={formData.trainingOptions.includes(option)}
                                                onChange={() => handleCheckboxChange(option)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <label htmlFor={`training-${index}`} className="ml-2 block text-gray-700">
                                                {option}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Preferred Time/Slot */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="preferredTimeSlot">
                                    Preferred Training Time/Slot
                                </label>
                                <input
                                    type="text"
                                    id="preferredTimeSlot"
                                    name="preferredTimeSlot"
                                    value={formData.preferredTimeSlot}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Weekday mornings, Monday 2-5 PM"
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                    required
                                />
                            </div>
                            
                            {/* Additional Notes */}
                            <div className="mb-6">
                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="additionalNotes">
                                    Additional Notes
                                </label>
                                <textarea
                                    id="additionalNotes"
                                    name="additionalNotes"
                                    value={formData.additionalNotes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Any specific requirements or questions..."
                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                ></textarea>
                            </div>
                            
                            {/* Submit button */}
                            <div className="flex justify-end">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md mr-2"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
                                >
                                    {loading ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instructions modal */}
            {renderInstructionsModal()}
        </div>
    );
};

export default ChefTraining;