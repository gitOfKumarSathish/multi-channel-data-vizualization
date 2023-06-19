import './App.css';
import Channel2 from './components/Channel2';
import LineChart from './components/LineChart';
import LoadMore from './components/LoadMore';
import PanChart from './components/Pan';
import Annotation from './components/Annotation';

function App() {

  return (
    <>
      {/* <LineChart /> */}
      <Channel2 />
      <PanChart />
      <LoadMore />
      <Annotation />
    </>
  );
}

export default App;
