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
      {/* Only show market section */}
      {/* <Dashboard debugSection="market" /> */}

      {/* Only show stock chart */}
      {/* <Dashboard debugSection="stock" /> */}

      {/* Only show portfolio */}
      {/* <Dashboard debugSection="portfolio" />  */}

      {/* Show all sections */}
      <Dashboard />
    </RecoilRoot>
  );
};

export default App;