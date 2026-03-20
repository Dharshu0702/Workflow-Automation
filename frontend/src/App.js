
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import WorkflowList from './pages/WorkflowList';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import WorkflowEditor from './pages/WorkflowEditor';
import StepRuleEditor from './pages/StepRuleEditor';
import WorkflowExecution from './pages/WorkflowExecution';
import ExecutionLogs from './pages/ExecutionLogs';
import ExecutionsPage from './pages/ExecutionsPage';
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
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/create" element={<WorkflowEditor />} />
            <Route path="/edit/:id" element={<WorkflowEditor />} />
            <Route path="/step/:stepId" element={<StepRuleEditor />} />
            <Route path="/execute/:workflowId" element={<WorkflowExecution />} />
            <Route path="/logs/:executionId" element={<ExecutionLogs />} />
            <Route path="/executions" element={<ExecutionsPage />} />
            <Route path="/audit" element={<AuditLog />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
