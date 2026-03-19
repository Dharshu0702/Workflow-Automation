import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import ErrorBoundary from '../components/ErrorBoundary';
import './WorkflowList.css';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await WorkflowService.getWorkflows();
      // API returns { workflows: [...] }, so access response.data.workflows
      const workflows = response.data.workflows || response.data || [];
      // Only show active workflows (not soft deleted)
      setWorkflows(workflows.filter(w => !w.deleted_at));
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
      setError('Failed to load workflows. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredWorkflows = useMemo(() => {
    return workflows.filter(workflow =>
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [workflows, searchTerm]);

  const paginatedWorkflows = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredWorkflows.slice(startIndex, endIndex);
  }, [filteredWorkflows, currentPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredWorkflows.length / itemsPerPage);
  }, [filteredWorkflows.length]);

  const handleEdit = useCallback((workflowId) => {
    navigate(`/workflows/${workflowId}`);
  }, [navigate]);

  const handleExecute = useCallback((workflowId) => {
    navigate(`/execute/${workflowId}`);
  }, [navigate]);

  const handleDelete = useCallback(async (workflowId) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await WorkflowService.deleteWorkflow(workflowId);
        setWorkflows(prev => prev.filter(w => w._id !== workflowId));
      } catch (err) {
        console.error('Failed to delete workflow:', err);
        setError('Failed to delete workflow. Please try again.');
      }
    }
  }, []);

  const handleSearch = useCallback((e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleCreate = useCallback(() => {
    navigate('/workflows/new');
  }, [navigate]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
  }, []);

  return (
    <ErrorBoundary>
      <Navbar title="Workflows" />
      <div className="workflow-list-container">
        <div className="workflow-header">
          <h2>Workflows</h2>
          <div className="header-actions">
            <input
              type="text"
              placeholder="Search workflows..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
            <button onClick={handleCreate} className="btn btn-primary">
              + Create Workflow
            </button>
          </div>
        </div>

        {loading ? (
          <div className="loading">Loading workflows...</div>
        ) : (
          <>
            <div className="workflow-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Version</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedWorkflows.map((workflow) => (
                    <tr key={workflow._id}>
                      <td>{workflow.name}</td>
                      <td>{workflow.version}</td>
                      <td>
                        <span className={`status-badge ${workflow.is_active ? 'active' : 'inactive'}`}>
                          {workflow.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>{new Date(workflow.created_at).toLocaleDateString()}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(workflow._id)}
                            className="btn btn-sm btn-info"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleExecute(workflow._id)}
                            className="btn btn-sm btn-success"
                          >
                            Execute
                          </button>
                          <button
                            onClick={() => handleDelete(workflow._id)}
                            className="btn btn-sm btn-danger"
                            style={{
                              background: '#dc3545',
                              color: 'white',
                              padding: '5px 10px',
                              fontSize: '0.85rem',
                              border: 'none',
                              cursor: 'pointer',
                              borderRadius: '4px',
                              display: 'inline-block',
                              visibility: 'visible',
                              opacity: '1'
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="btn btn-secondary"
                >
                  Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="btn btn-secondary"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default WorkflowList;