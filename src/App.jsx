import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from '@emotion/styled';
import MapWithRoutes from './components/MapWithRoutes';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: #2c3e50;
  color: white;
  padding: 1rem;
  text-align: center;
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Header>
          <h1>Fun Route Finder 🎉</h1>
        </Header>
        <Routes>
          <Route path="/" element={<MapWithRoutes />} />
        </Routes>
      </AppContainer>
    </Router>
  );
}

export default App;
