export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">API Configuration</h3>
            <p className="text-gray-600">Configure your API endpoints and authentication settings.</p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Appearance</h3>
            <p className="text-gray-600">Customize the look and feel of your prompt manager.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
