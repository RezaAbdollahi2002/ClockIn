import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ChatBot from './components/AI/ChatBot';
import {
  TrashIcon,
  CalendarIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import Message from './components/Message/Message';
import ShowAvailability from './components/EmployerEmployeeMain/ShowAvailability';
import AvatarImage from '../src/assets/Avatar.webp';

const API_BASE_URL = '/api/';

/**
 * EmployerEmployeeMain Component
 * Displays detailed employee information and management options
 */
const EmployerEmployeeMain = ({
  message,
  handleMessageState,
  setMessage,
  activeBot,
  setActiveBot
}) => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const employeeId = state?.employee;

  // State management
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Fetches employee data from the API
   */
  const fetchEmployeeData = useCallback(async () => {
    if (!employeeId) {
      setError('No employee ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/employees/settings/${employeeId}/employee-info`
      );
      setEmployee(response.data);
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        'Failed to load employee information. Please try again.';
      setError(errorMessage);
      console.error('Error fetching employee data:', err);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    fetchEmployeeData();
  }, [fetchEmployeeData]);

  /**
   * Handles employee deletion with confirmation
   */
  const handleDeleteEmployee = useCallback(async () => {
    if (!employeeId) return;

    const confirmed = window.confirm(
      `Are you sure you want to remove ${employee?.first_name} ${employee?.last_name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      await axios.delete(`${API_BASE_URL}/employees/${employeeId}`);
      navigate('/onboarding/sign-up/employer-dashboard', {
        state: { message: 'Employee removed successfully' },
      });
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail ||
        'Failed to remove employee. Please try again.';
      setError(errorMessage);
      console.error('Error deleting employee:', err);
    } finally {
      setIsDeleting(false);
    }
  }, [employeeId, employee, navigate]);

  /**
   * Toggles availability panel
   */
  const toggleAvailabilityPanel = useCallback(() => {
    setShowAvailability((prev) => !prev);
  }, []);

  const handleCloseMessage = () => setMessage(false);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-200 border-t-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading employee information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !employee) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 px-4">
        <div className="max-w-md w-full">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-red-900">
                  Error Loading Employee
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => navigate(-1)}
                  className="mt-4 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  Go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!employee) return null;

  const profileImageUrl = employee.profile_pic
    ? `${API_BASE_URL}/${employee.profile_pic}`
    : AvatarImage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Bar */}
      <div className="sticky top-9.5 bg-white border-b border-gray-200 shadow-sm z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3 justify-end">
            <button
              onClick={toggleAvailabilityPanel}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <CalendarIcon className="h-5 w-5" />
              Availability
            </button>
            <button
              onClick={handleDeleteEmployee}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
            >
              <TrashIcon className="h-5 w-5" />
              {isDeleting ? 'Removing...' : 'Remove'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && employee && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex gap-3">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-800">{error}</p>
            </div>
          </div>
        )}

        {/* Employee Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Section */}
          <div className="px-6 sm:px-8 py-8 border-b border-gray-200">
            <div className="flex flex-col items-center text-center mb-8">
              <img
                src={profileImageUrl}
                alt={`${employee.first_name} ${employee.last_name}`}
                className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 mb-4"
              />
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {employee.first_name} {employee.last_name}
              </h1>
              <p className="text-gray-600 mt-1">{employee.email}</p>
            </div>

            {/* Employee Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  First Name
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {employee.first_name}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Last Name
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {employee.last_name}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Date of Birth
                </label>
                <p className="text-base text-gray-900 font-medium">
                  {employee.dob ? formatDate(employee.dob) : 'Not provided'}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <a
                  href={`mailto:${employee.email}`}
                  className="text-base text-purple-600 font-medium hover:text-purple-700 break-all"
                >
                  {employee.email}
                </a>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <a
                  href={`tel:${employee.phone_number}`}
                  className="text-base text-purple-600 font-medium hover:text-purple-700"
                >
                  {employee.phone_number || 'Not provided'}
                </a>
              </div>

              {employee.position && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
                    Position
                  </label>
                  <p className="text-base text-gray-900 font-medium">
                    {employee.position}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Availability Section */}
          {showAvailability && (
            <div className="px-6 sm:px-8 py-8 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-6">
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Availability
                </h2>
              </div>
              <ShowAvailability id={employeeId} />
            </div>
          )}
        </div>
      </div>

      {/* Message Panel */}
      {message && (
        <aside
          className={`fixed right-0 top-0 z-50 h-screen w-[350px] transform overflow-auto border-l border-gray-300 bg-white p-4 shadow-2xl transition-transform duration-300 ease-in-out ${message ? "translate-x-0" : "translate-x-full"
            }`}
          role="complementary"
          aria-label="Message Panel"
        >
          <Message
            onClose={handleCloseMessage}
            activeBot={activeBot}
            setActiveBot={setActiveBot}
          />
        </aside>
      )}
     {activeBot && (
        <aside
          className="fixed left-4 top-40 max-h-[600px] w-full max-w-[400px] rounded-lg border border-gray-300 bg-white shadow-xl"
          role="complementary"
          aria-label="Chat Assistant"
        >
          <ChatBot />
        </aside>
      )}
    </div>
  );
};

/**
 * Formats a date string to a readable format
 */
function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export default EmployerEmployeeMain;