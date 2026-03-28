import './App.css';
import Slidbar from './Slidbar.jsx';
import ChatWindow from './ChatWindow.jsx';
import { MyContext } from './MyContext.jsx';


function App() {

    const providerValue = {};

  return (
    <div className="App">
      <header className="App-header">
        <MyContext.Provider value={providerValue}></MyContext.Provider>
        <Slidbar />
        <ChatWindow />
      </header>
    </div>
  );
}

export default App;