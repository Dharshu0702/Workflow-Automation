import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WorkflowService from '../services/workflowService';
import Navbar from '../components/Navbar';
import './WorkflowList.css';

const WorkflowList = () => {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setLoading(true);
    try {
      const response = await WorkflowService.getWorkflows();
      setWorkflows(response.data);
    } catch (err) {
      console.error('Failed to fetch workflows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      try {
        await WorkflowService.deleteWorkflow(id);
        setWorkflows(workflows.filter(w => w._id !== id));
      } catch (err) {
        console.error('Failed to delete workflow:', err);
      }
    }
  };

  const filteredWorkflows = workflows.filter(w =>
    w.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedWorkflows = filteredWorkflows.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredWorkflows.length / itemsPerPage);

  return (
    <>
      <Navbar title="Workflows" />
      <div className="workflow-container">
        <div className="workflow-header">
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
          <button onClick={() => navigate('/create')} className="btn btn-primary">
            + Create Workflow
          </button>
        </div>

        {loading ? (
          <p>Loading workflows...</p>
        ) : (
          <>
            <table className="workflow-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Version</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedWorkflows.map(workflow => (
                  <tr key={workflow._id}>
                    <td>{workflow._id.slice(0, 8)}...</td>
                    <td>{workflow.name}</td>
                    <td>{workflow.version}</td>
                    <td>
                      <span className={`status ${workflow.is_active ? 'active' : 'inactive'}`}>
                        {workflow.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>{new Date(workflow.created_at).toLocaleDateString()}</td>
                    <td>
                      <button onClick={() => navigate(`/edit/${workflow._id}`)} className="btn btn-sm btn-info">Edit</button>
                      <button onClick={() => navigate(`/execute/${workflow._id}`)} className="btn btn-sm btn-success">Execute</button>
                      <button onClick={() => handleDelete(workflow._id)} className="btn btn-sm btn-danger">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="pagination">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`page-btn ${currentPage === page ? 'active' : ''}`}
                >
                  {page}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default WorkflowList;