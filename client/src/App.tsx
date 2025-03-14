import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

const App: React.FC = () => {
  return (
    <>
      {/* Toast Notifications */}
      <div>
        <Toaster
          position="top-right"
          toastOptions={{
            success: {
              style: {
                background: '#1F2937',
                color: '#F3F4F6',
                border: '1px solid #374151',
              },
              iconTheme: {
                primary: '#10B981',
                secondary: '#F3F4F6',
              },
            },
            error: {
              style: {
                background: '#1F2937',
                color: '#F3F4F6',
                border: '1px solid #374151',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#F3F4F6',
              },
            },
            duration: 3000,
          }}
        />
      </div>
      
      {/* Router */}
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor/:roomId" element={<EditorPage />} />
        </Routes>
      </Router>
    </>
  );
};

export default App;