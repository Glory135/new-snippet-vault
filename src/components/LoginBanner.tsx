"use client"

import React from 'react';
import { Alert, AlertDescription, Button } from './UIComponents';

interface LoginBannerProps {
  onLoginClick: () => void;
}

export const LoginBanner: React.FC<LoginBannerProps> = ({ onLoginClick }) => {
  return (
    <Alert variant="warning" className="mb-6 bg-yellow-500/10 border-yellow-500/20">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
        <AlertDescription className="text-yellow-200/90 font-medium">
          You’re not logged in — your snippets are only saved locally and may be lost. Log in to sync them to the cloud.
        </AlertDescription>
        <Button 
          size="sm" 
          variant="outline" 
          className="ml-auto border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-200 self-end sm:self-center flex-shrink-0"
          onClick={onLoginClick}
        >
          Log In to Sync
        </Button>
      </div>
    </Alert>
  );
};
