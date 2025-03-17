import React from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, HelpCircle } from 'lucide-react';
import { UserProfile } from './UserProfile';
import { cn } from '../utils/cn';

const SettingsSection: React.FC<{
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, icon, children }) => (
  <div className="mb-6">
    <div className="mb-3 flex items-center gap-2">
      <span className="text-wise-green">{icon}</span>
      <h2 className="text-xl font-medium text-wise-forest dark:text-wise-green">{title}</h2>
    </div>
    <div className="rounded-3xl bg-white p-4 shadow-sm dark:bg-gray-800">
      {children}
    </div>
  </div>
);

export const Settings: React.FC = () => {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-wise-green" />
        <h1 className="text-2xl font-semibold text-wise-forest dark:text-wise-green">Settings</h1>
      </div>

      {/* Account Section */}
      <SettingsSection title="Account" icon={<User className="h-5 w-5" />}>
        <UserProfile />
      </SettingsSection>

      {/* Notifications Section */}
      <SettingsSection title="Notifications" icon={<Bell className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-wise-forest dark:text-wise-green">Call Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive notifications for incoming calls
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className={cn(
                "peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px]",
                "after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-['']",
                "peer-checked:bg-wise-green peer-checked:after:translate-x-full peer-focus:outline-none"
              )} />
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-wise-forest dark:text-wise-green">Message Notifications</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive notifications for new messages
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className={cn(
                "peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px]",
                "after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-['']",
                "peer-checked:bg-wise-green peer-checked:after:translate-x-full peer-focus:outline-none"
              )} />
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Privacy Section */}
      <SettingsSection title="Privacy" icon={<Shield className="h-5 w-5" />}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-wise-forest dark:text-wise-green">Call Encryption</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                End-to-end encryption for all calls
              </p>
            </div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className={cn(
                "peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px]",
                "after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-['']",
                "peer-checked:bg-wise-green peer-checked:after:translate-x-full peer-focus:outline-none"
              )} />
            </label>
          </div>
        </div>
      </SettingsSection>

      {/* Help Section */}
      <SettingsSection title="Help" icon={<HelpCircle className="h-5 w-5" />}>
        <button
          className="w-full rounded-xl bg-wise-green/10 px-4 py-3 text-left font-medium text-wise-forest transition-colors hover:bg-wise-green/20 dark:text-wise-green"
        >
          Contact Support
        </button>
      </SettingsSection>
    </div>
  );
}; 