import { Outlet } from 'react-router-dom';
import { VerticalNavbar } from './components/VerticalNavbar';

function App() {
  return (
    <div className="d-flex" style={{ height: '100vh'}}>
      <VerticalNavbar />
      <Outlet />
    </div>
  );
}

export default App;
