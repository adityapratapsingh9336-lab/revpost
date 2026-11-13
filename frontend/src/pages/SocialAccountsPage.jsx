import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Share2,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { mockSocialAccounts } from '../data/mockData';
import { api } from '../services/api';

export const SocialAccountsPage = () => {
  const { activeBrand } = useOutletContext();
  const [accounts, setAccounts] = useState(mockSocialAccounts);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [connectingPlatform, setConnectingPlatform] = useState(null);

  useEffect(() => {
    let mounted = true;
    api.getSocialAccounts().then((res) => {
      if (mounted && res) setAccounts(res);
    });
    return () => { mounted = false; };
  }, []);

  const handleSimulateConnect = async (platformName) => {
    setConnectingPlatform(platformName);
    const updated = await api.connectSocialAccount(platformName);
    setAccounts(prev =>
      prev.map(a =>
        a.platform.toLowerCase().includes(platformName.toLowerCase())
          ? (updated || { ...a, status: 'Connected', health: 'Optimal', tokenExpiresIn: '90 days' })
          : a
      )
    );
    setConnectingPlatform(null);
    setIsConnectModalOpen(false);
  };

  const handleRevoke = async (accountId) => {
    const updated = await api.revokeSocialAccount(accountId);
    setAccounts(prev =>
      prev.map(a =>
        a.id === accountId
          ? (updated || { ...a, status: 'Requires Reauth', health: 'Revoked', tokenExpiresIn: 'Revoked' })
          : a
      )
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Social Accounts
            </h1>
            <Badge variant="indigo">{activeBrand.name}</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Official OAuth connections with least-privilege content publishing scopes.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={() => setIsConnectModalOpen(true)}
        >
          Connect Official Account
        </Button>
      </div>

      {/* Security Architecture Callout */}
      <Card className="p-4 bg-slate-50 border-slate-200 flex items-start gap-3">
        <Lock className="w-5 h-5 text-slate-700 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-600 space-y-1">
          <p className="font-semibold text-slate-900">Official OAuth Architecture & Token Security</p>
          <p className="leading-relaxed">
            XYZ strictly integrates through official partner APIs (Meta Graph API, LinkedIn V2, X v2 API). Tokens are encrypted with AES-256 at rest, rotated automatically, and never exposed to the client browser. No account passwords or private credentials are ever requested.
          </p>
        </div>
      </Card>

      {/* Accounts List Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {accounts.map((acc) => (
          <Card key={acc.id} className="p-5 flex flex-col justify-between space-y-4 bg-white border-slate-200">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <span className="text-2xl p-2 rounded-xl bg-slate-50 border border-slate-100">
                    {acc.avatar}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{acc.accountName}</h3>
                    <p className="text-xs text-slate-400">{acc.platform}</p>
                  </div>
                </div>
                <Badge variant={acc.status === 'Connected' ? 'success' : 'danger'}>
                  {acc.status}
                </Badge>
              </div>

              {/* Account Meta */}
              <div className="py-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Audience / Followers</span>
                  <span className="font-mono font-semibold text-slate-800">{acc.followers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Token Health</span>
                  <span className="font-mono text-slate-800">{acc.health}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Token Expiry</span>
                  <span className="font-mono text-slate-800">{acc.tokenExpiresIn}</span>
                </div>
              </div>

              {/* Scopes */}
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[11px] font-semibold text-slate-700 block mb-1">
                  Authorized Scopes
                </span>
                <div className="flex flex-wrap gap-1">
                  {acc.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600"
                    >
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <Button
                size="sm"
                variant="secondary"
                icon={RefreshCw}
                onClick={() => handleSimulateConnect(acc.platform.split(' ')[0])}
              >
                {acc.status === 'Connected' ? 'Refresh Token' : 'Authenticate via OAuth'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRevoke(acc.id)}
                className="text-slate-400 hover:text-rose-600"
              >
                Revoke Access
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Connect Account Modal */}
      <Modal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        title="Connect New Social Account"
        description="Select a supported platform to initiate the official OAuth authorization flow."
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            You will be redirected to the provider's official consent screen. Please ensure your account has administrative rights for pages or professional profiles.
          </p>

          <div className="space-y-2">
            {[
              { name: 'Instagram', label: 'Instagram Professional / Creator Account via Meta Business' },
              { name: 'LinkedIn', label: 'LinkedIn Company Page or Member Profile' },
              { name: 'X', label: 'X (Twitter) Developer Portal App v2' },
              { name: 'Facebook', label: 'Facebook Business Page' },
            ].map((p) => (
              <button
                key={p.name}
                onClick={() => handleSimulateConnect(p.name)}
                disabled={connectingPlatform !== null}
                className="w-full p-3 rounded-lg border border-slate-200 hover:border-slate-400 bg-white text-left flex items-center justify-between transition-colors group"
              >
                <div>
                  <div className="font-semibold text-slate-900">{p.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{p.label}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
              </button>
            ))}
          </div>

          {connectingPlatform && (
            <div className="p-3 rounded-lg bg-slate-100 text-slate-700 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
              <span>Exchanging authorization code for encrypted long-lived token...</span>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

