import './globals.css';
import Link from 'next/link'; // Add this import

export const metadata = {
  title: 'Prompt Management',
  description: 'Manage and edit your AI prompts',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gray-50">
          {/* Navigation Header */}
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                {/* Logo/Brand */}
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold text-gray-900">
                    Prompt Management
                  </h1>
                  <p className="text-sm text-gray-600">
                    Manage and edit your AI prompts
                  </p>
                </div>

                {/* Navigation Menu */}
                <div className="hidden md:block">
                  <div className="ml-10 flex items-baseline space-x-4">
                    <Link
                      href="/"
                      className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      My Prompts
                    </Link>
                    <Link
                      href="/about"
                      className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      About Prompts
                    </Link>
                    <Link
                      href="/new-prompt"
                      className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      New Prompt
                    </Link>
                    <Link
                      href="/settings"
                      className="text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Settings
                    </Link>
                  </div>
                </div>

                {/* Mobile menu button */}
                <div className="md:hidden">
                  <button
                    type="button"
                    className="bg-white inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                  >
                    <span className="sr-only">Open main menu</span>
                    {/* Hamburger icon */}
                    <svg
                      className="block h-6 w-6"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16M4 18h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile menu (hidden by default) */}
            <div className="md:hidden hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <Link
                  href="/"
                  className="text-gray-900 block px-3 py-2 rounded-md text-base font-medium"
                >
                  My Prompts
                </Link>
                <Link
                  href="/about"
                  className="text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  About Prompts
                </Link>
                <Link
                  href="/new-prompt"
                  className="text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  New Prompt
                </Link>
                <Link
                  href="/settings"
                  className="text-gray-600 block px-3 py-2 rounded-md text-base font-medium"
                >
                  Settings
                </Link>
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
