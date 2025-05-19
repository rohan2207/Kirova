import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const DebugContainer = styled.div`
  border: 2px solid red;
  padding: 15px;
  margin: 15px 0;
  background: #fff;
`;

const DebugTitle = styled.h3`
  color: red;
  margin-top: 0;
`;

const DebugText = styled.pre`
  white-space: pre-wrap;
  word-break: break-all;
  font-family: monospace;
  font-size: 12px;
  background: #f5f5f5;
  padding: 10px;
  border-radius: 4px;
  max-height: 300px;
  overflow: auto;
`;

const DebugButton = styled.button`
  background: #f44336;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
  cursor: pointer;
`;

const DebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Collect debug information
    const collectInfo = () => {
      try {
        const info = {
          // Basic info
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          
          // Component structure
          reactComponents: 'Check React DevTools for component tree',
          
          // Environmental variables
          nodeEnv: process.env.NODE_ENV,
          
          // Get component imports from window if available
          storeCardPath: window?.storeCardPath || 'Not available',
          storeListPath: window?.storeListPath || 'Not available'
        };
        
        setDebugInfo(info);
      } catch (error) {
        setDebugInfo({ error: error.message });
      }
    };
    
    collectInfo();
  }, []);

  // Logs the component hierarchy to the console
  const logComponentHierarchy = () => {
    console.log('==== COMPONENT DEBUGGER ====');
    console.log('React Version:', React.version);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Current route:', window.location.pathname);
    console.log('React DevTools available:', typeof window.__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined');
    console.log('==========================');
  };

  return (
    <DebugContainer>
      <DebugTitle>Debug Panel</DebugTitle>
      
      {expanded ? (
        <>
          <DebugText>{JSON.stringify(debugInfo, null, 2)}</DebugText>
          <DebugButton onClick={() => logComponentHierarchy()}>
            Log Component Info
          </DebugButton>
          <DebugButton onClick={() => setExpanded(false)}>
            Collapse
          </DebugButton>
        </>
      ) : (
        <DebugButton onClick={() => setExpanded(true)}>
          Show Debug Info
        </DebugButton>
      )}
    </DebugContainer>
  );
};

export default DebugPanel;
