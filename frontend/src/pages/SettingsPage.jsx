import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Settings,
  Users,
  Shield,
  CreditCard,
  Plus,
  Save,
  CheckCircle2,
  Trash2,
  Mail
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { mockWorkspaces } from '../data/mockData';
import { api } from '../services/api';

export const SettingsPage = () => {
  const { activeWorkspace, refreshData } = useOutletContext();
  const wsId = activeWorkspace?.id || mockWorkspaces[0].id;
  const [workspaceName, setWorkspaceName] = useState(activeWorkspace?.name || mockWorkspaces[0].name);
  const [isSaved, setIsSaved] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Editor');

  const [members, setMembers] = useState([
    { id: 'm1', name: 'Aditya (You)', email: 'aditya@example.com', role: 'Owner', status: 'Active' },
    { id: 'm2', name: 'Sarah Chen', email: 'sarah@growthlabs.io', role: 'Editor', status: 'Active' },
    { id: 'm3', name: 'Marcus Vance', email: 'marcus@growthlabs.io', role: 'Reviewer', status: 'Active' },
  ]);

  useEffect(() => {
    let mounted = true;
    setWorkspaceName(activeWorkspace?.name || mockWorkspaces[0].name);
    api.getWorkspaceMembers(wsId).then((res) => {
      if (mounted && res && res.length > 0) setMembers(res);
    });
    return () => { mounted = false; };
  }, [wsId, activeWorkspace?.name]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    const created = await api.inviteWorkspaceMember(wsId, inviteEmail, inviteRole);
    setMembers(prev => [
      ...prev,
      created || {
        id: `m_${Date.now()}`,
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'Invited'
      }
    ]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const handleRemoveMember = async (memberId) => {
    await api.removeWorkspaceMember(wsId, memberId);
    setMembers(prev => prev.filter(m => m.id !== memberId));
  };

  const handleSave = async () => {
    setIsSaved(true);
    await api.updateWorkspace(wsId, workspaceName);
    if (refreshData) await refreshData();
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Workspace Settings
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage organization members, workspace details, and team role permissions.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Save}
          onClick={handleSave}
        >
          {isSaved ? 'Preferences Saved' : 'Save Changes'}
        </Button>
      </div>

      {/* General Workspace Info */}
      <Card className="p-6 space-y-4 bg-white border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900">
          Organization Profile
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Organization Slug / Subdomain
            </label>
            <input
              type="text"
              readOnly
              value="acme-growth-labs"
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-500 font-mono"
            />
          </div>
        </div>
      </Card>

      {/* Team Members & Roles */}
      <Card className="p-0 overflow-hidden bg-white border-slate-200">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Team Members & Access Control ({members.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Role-based access control (RBAC) enforced on brand and creative operations.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            icon={Plus}
            onClick={() => setIsInviteModalOpen(true)}
          >
            Invite Member
          </Button>
        </div>

        <div className="divide-y divide-slate-100">
          {members.map((member) => (
            <div key={member.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-semibold flex items-center justify-center">
                  {member.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="font-semibold text-slate-900">{member.name}</div>
                  <div className="text-[11px] text-slate-400">{member.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge variant={member.role === 'Owner' ? 'primary' : 'secondary'}>
                  {member.role}
                </Badge>
                <span className="text-[11px] font-mono text-slate-400">{member.status}</span>
                {member.role !== 'Owner' && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Billing & Tier Card */}
      <Card className="p-5 bg-white border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-slate-900">Current Subscription: Pro Enterprise</span>
          <p className="text-xs text-slate-500 mt-0.5">
            Unlimited brand workspaces, high-throughput blueprint rendering, and official API webhook pipelines.
          </p>
        </div>
        <Button variant="secondary" size="sm">
          Manage Billing Portal
        </Button>
      </Card>

      {/* Invite Modal */}
      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        title="Invite New Team Member"
        description="Send an invitation to join this workspace with designated RBAC privileges."
      >
        <form onSubmit={handleInvite} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Colleague Email Address
            </label>
            <input
              type="email"
              placeholder="colleague@domain.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Select Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white"
            >
              <option value="Admin">Admin (Full brand and configuration control)</option>
              <option value="Editor">Editor (Create, edit, and schedule creatives)</option>
              <option value="Reviewer">Reviewer (Approve and comment only)</option>
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsInviteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={Mail}
            >
              Send Invite
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

