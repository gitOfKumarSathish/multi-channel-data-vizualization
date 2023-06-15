import { useState } from 'react';
import reactLogo from './assets/react.svg';
import viteLogo from '/vite.svg';
import './App.css';
import LineChart from './components/LineChart';
import PanChart from './components/Pan';
import LoadMore from './components/LoadMore';

function App() {

  return (
    <>
      {/* <LineChart /> */}
      <PanChart />
      {/* <LoadMore /> */}
    </>
  );
}

export default App;
