import React, { useEffect, useState } from "react";
import axios from "axios";

function TrackUser() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedChef, setExpandedChef] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/admin/track-user?search=${searchQuery}`
        );
        setUsers(response.data);
        setFilteredUsers(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
        setLoading(false);
      }
    };
    fetchUsers();
  }, [searchQuery]);

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = users.filter(
      (user) =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query) ||
        (user.address && user.address.toLowerCase().includes(query))
    );
    setFilteredUsers(filtered);
  };

  const handleToggleAvailability = async (chefId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/admin/track-user/toggle-availability/${chefId}`
      );
      const updatedAvailability = response.data.isAvailable;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === chefId
            ? { ...user, isAvailable: updatedAvailability }
            : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === chefId
            ? { ...user, isAvailable: updatedAvailability }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating availability:", error);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      const response = await axios.patch(
        `http://localhost:8080/admin/track-user/toggle-verification/${userId}`
      );
      const updatedVerification = response.data.isVerified;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isVerified: updatedVerification }
            : user
        )
      );
      setFilteredUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? { ...user, isVerified: updatedVerification }
            : user
        )
      );
    } catch (error) {
      console.error("Error toggling verification:", error);
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b-2 border-gray-200 pb-2">
        User Management
      </h2>
      {}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search by name, role, email, or location..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 pl-10"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user, index) => (
                <React.Fragment key={user._id}>
                  <tr className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            user.isVerified
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {user.isVerified ? "Verified" : "Unverified"}
                        </span>
                        {user.role === "Chef" && (
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${
                              user.isAvailable
                                ? "bg-blue-100 text-blue-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isAvailable ? "Available" : "Unavailable"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 space-x-2">
                      {/* Added verification button for all users */}
                      <button
                        onClick={() => handleToggleVerification(user._id)}
                        className={`px-3 py-1 text-white rounded-md ${
                          user.isVerified
                            ? "bg-purple-500 hover:bg-purple-600"
                            : "bg-yellow-500 hover:bg-yellow-600"
                        }`}
                      >
                        {user.isVerified ? "Unverify" : "Verify"}
                      </button>

                      {user.role === "Chef" && (
                        <>
                          <button
                            onClick={() => handleToggleAvailability(user._id)}
                            className={`px-3 py-1 text-white rounded-md ${
                              user.isAvailable
                                ? "bg-green-500 hover:bg-green-600"
                                : "bg-red-500 hover:bg-red-600"
                            }`}
                          >
                            {user.isAvailable ? "Set Unavailable" : "Set Available"}
                          </button>
                          
                          <button
                            onClick={() =>
                              setExpandedChef(
                                expandedChef === user._id ? null : user._id
                              )
                            }
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {expandedChef === user._id ? "Hide" : "Details"}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                  {expandedChef === user._id && user.role === "Chef" && (
                    <tr>
                      <td colSpan="5" className="px-6 py-4">
                        <div className="bg-white shadow-md rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Chef Details
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Specialties:</strong>{" "}
                                {user.specialties?.join(", ") || "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Experience:</strong>{" "}
                                {user.experience
                                  ? `${user.experience} years`
                                  : "N/A"}
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Address:</strong> {user.address || "N/A"}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-600">
                                <strong>Verification Status:</strong>{" "}
                                <span
                                  className={
                                    user.isVerified
                                      ? "text-green-500"
                                      : "text-yellow-500"
                                  }
                                >
                                  {user.isVerified
                                    ? "Verified"
                                    : "Pending Verification"}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Availability:</strong>{" "}
                                <span
                                  className={
                                    user.isAvailable
                                      ? "text-blue-500"
                                      : "text-red-500"
                                  }
                                >
                                  {user.isAvailable ? "Available" : "Unavailable"}
                                </span>
                              </p>
                              <p className="text-sm text-gray-600">
                                <strong>Bio:</strong> {user.bio || "N/A"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No users found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrackUser;