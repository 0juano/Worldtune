import React from 'react';
import { ArrowUpRight, Globe2, Plus, Search } from 'lucide-react';
import { useCreditsStore } from '../store/useCreditsStore';
import { useNavigationStore } from '../store/useNavigationStore';

export const Home = () => {
  const { credits } = useCreditsStore();
  const { setView } = useNavigationStore();

  const handleAddCredits = () => {
    setView('dial');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="px-4 pt-6 pb-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Home</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back</p>
          </div>
          <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <Search className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Balance Card */}
      <div className="px-4 sm:px-6">
        <div className="overflow-hidden rounded-2xl bg-primary-500 p-6 dark:bg-primary-600">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-primary-100">Available Credits</p>
              <p className="mt-2 text-3xl font-bold text-white">{credits}</p>
            </div>
            <Globe2 className="h-6 w-6 text-primary-100" />
          </div>
          <div className="mt-6 flex gap-3">
            <button 
              onClick={handleAddCredits}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-3 text-sm font-medium text-white backdrop-blur-lg hover:bg-white/20"
            >
              <Plus className="h-4 w-4" />
              Add Credits
            </button>
            <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-medium text-primary-600 hover:bg-primary-50">
              <ArrowUpRight className="h-4 w-4" />
              Transfer
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-8 px-4 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        <div className="mt-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-4 dark:border-gray-800 dark:bg-gray-800"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900">
                  <Globe2 className="h-5 w-5 text-primary-600 dark:text-primary-300" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">International Call</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">2 minutes ago</p>
                </div>
              </div>
              <p className="font-medium text-gray-900 dark:text-white">-5 credits</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 px-4 pb-8 sm:px-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          {[
            { name: 'Make a Call', action: () => setView('dial') },
            { name: 'Send Message', action: () => setView('messages') },
            { name: 'Add Contact', action: () => setView('contacts') },
            { name: 'View History', action: () => {} }
          ].map((action) => (
            <button
              key={action.name}
              onClick={action.action}
              className="flex flex-col items-center justify-center rounded-xl border border-gray-100 bg-white p-4 text-center transition-colors hover:border-primary-100 hover:bg-primary-50 dark:border-gray-800 dark:bg-gray-800 dark:hover:border-primary-900 dark:hover:bg-primary-900/50"
            >
              <Globe2 className="h-6 w-6 text-primary-500 dark:text-primary-400" />
              <span className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{action.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};