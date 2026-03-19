
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WorkflowList from './pages/WorkflowList';
import WorkflowEditor from './pages/WorkflowEditor';
import StepRuleEditor from './pages/StepRuleEditor';
import WorkflowExecution from './pages/WorkflowExecution';
import ExecutionLogs from './pages/ExecutionLogs';
import AuditLog from './pages/AuditLog';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<WorkflowList />} />
            <Route path="/create" element={<WorkflowEditor />} />
            <Route path="/edit/:id" element={<WorkflowEditor />} />
            <Route path="/step/:stepId" element={<StepRuleEditor />} />
            <Route path="/execute/:workflowId" element={<WorkflowExecution />} />
            <Route path="/logs/:executionId" element={<ExecutionLogs />} />
            <Route path="/executions" element={<div><h2>Executions Page - Coming Soon</h2></div>} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
