import React from 'react';
import { Save } from 'lucide-react';

function Settings() {
  return (
    <div>
      <h1 className="text-xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-md p-5">
        <form className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Notifications</h2>
            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="emailNotifications" className="ml-2 text-sm text-gray-700">
                  Email notifications for new documents
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="mrrAlerts"
                  className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="mrrAlerts" className="ml-2 text-sm text-gray-700">
                  MRR change alerts
                </label>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-blue-500 text-white px-3 py-1.5 text-sm rounded-lg flex items-center hover:bg-blue-600 transition-colors"
            >
              <Save className="w-4 h-4 mr-1.5" />
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Settings;