import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ImageProcessor from './pages/ImageProcessor';
import MetadataGenerator from './pages/MetadataGenerator';
import AppSubmission from './pages/AppSubmission';
import Wizard from './pages/Wizard';
import './App.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/wizard" element={<Wizard />} />
          <Route path="/images" element={<ImageProcessor />} />
          <Route path="/metadata" element={<MetadataGenerator />} />
          <Route path="/submission" element={<AppSubmission />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
