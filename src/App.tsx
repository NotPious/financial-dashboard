/**
 * Root application component
 * Sets up Recoil state management and routes
 */

import React from 'react';
import { RecoilRoot } from 'recoil';
import Dashboard from './components/Dashboard/Dashboard';

const App: React.FC = () => {
  return (
    <RecoilRoot>
      <Dashboard />
    </RecoilRoot>
  );
};

export default App;