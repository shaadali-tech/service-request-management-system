import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import { ServiceRequest } from "../types";
import { AlertCircle, RefreshCw, ShieldAlert } from "lucide-react";

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    cancelled: 0,
  });

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get("/requests");

      const data = res.data;

      setRequests(data);

      setStats({
        total: data.length,
        open: data.filter((r: any) => r.status === "OPEN").length,
        inProgress: data.filter((r: any) => r.status === "IN_PROGRESS").length,
        resolved: data.filter((r: any) => r.status === "RESOLVED").length,
        cancelled: data.filter((r: any) => r.status === "CANCELLED").length,
      });
    } catch (err: any) {
      setError(
        err.response?.data?.error || "Failed to retrieve service requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/requests/${id}/status`, {
        status: newStatus,
      });

      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update status.");
    }
  };

  const handleAssign = async (id: string, assignedUserId: string) => {
    try {
      await api.put(`/requests/${id}/assign`, {
        assignedTo: assignedUserId,
      });

      fetchRequests();
    } catch (err: any) {
      alert(err.response?.data?.error || "Assignment failed.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-3 mb-8">
        <div className="bg-red-100 text-red-600 p-2.5 rounded-xl">
          <ShieldAlert className="h-6 w-6" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Admin Control Panel
          </h1>

          <p className="text-slate-500 mt-1">
            Review, assign and manage all organization service requests.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Total Tickets
          </span>

          <p className="text-2xl font-bold text-slate-900 mt-1">
            {stats.total}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-blue-500 uppercase">
            Open
          </span>

          <p className="text-2xl font-bold text-blue-600 mt-1">{stats.open}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-purple-500 uppercase">
            In Progress
          </span>

          <p className="text-2xl font-bold text-purple-600 mt-1">
            {stats.inProgress}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-green-500 uppercase">
            Resolved
          </span>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {stats.resolved}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-400 uppercase">
            Cancelled
          </span>

          <p className="text-2xl font-bold text-slate-500 mt-1">
            {stats.cancelled}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500" />

            <span className="text-sm text-red-700">{error}</span>
          </div>

          <button onClick={fetchRequests}>
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="animate-spin h-8 w-8 text-brand-600" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Number
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Title
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Created By
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Priority
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase">
                    Assignee
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-slate-200">
                {requests.map((req) => (
                  <tr key={req._id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-brand-600">
                      {req.requestNumber}
                    </td>

                    <td className="px-6 py-4 text-sm font-medium text-slate-900 max-w-xs truncate">
                      {req.title}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {req.createdBy?.name || "User"}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          req.priority === "HIGH"
                            ? "bg-red-100 text-red-700"
                            : req.priority === "MEDIUM"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={req.status}
                        onChange={(e) =>
                          handleStatusChange(req._id, e.target.value)
                        }
                        className="border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="IN_REVIEW">IN REVIEW</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="RESOLVED">RESOLVED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={req.assignedTo?._id || ""}
                        onChange={(e) => handleAssign(req._id, e.target.value)}
                        className="border rounded-lg px-2 py-1 text-sm"
                      >
                        <option value="">Unassigned</option>

                        <option value="6a6b43f797307592698f5612">
                          Admin User
                        </option>

                        <option value="60d5ec49867c2e36f0b48c1b">
                          Backup Admin
                        </option>
                      </select>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => navigate(`/request/${req._id}`)}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1 rounded-lg transition"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}

                {requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-10 text-slate-500"
                    >
                      No service requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
