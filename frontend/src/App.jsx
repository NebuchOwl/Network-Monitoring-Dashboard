import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Activity, Plus, Server, Wifi, WifiOff, RefreshCcw,
  ShieldCheck, AlertTriangle, Trash2, Settings,
  ChevronRight, X, Bell, Globe, Hash, Edit3, Check,
  Smartphone, Monitor, Tablet, Laptop, HardDrive, Cpu, Router
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { format } from 'date-fns';
import {
  getDevices, getStats, createDevice,
  deleteDevice, updateDevice, getSettings, updateSettings,
  triggerDiscovery, getDeviceLogs
} from './api';

const typeIcons = {
  Server: <Server className="w-6 h-6" />,
  Router: <Router className="w-6 h-6" />,
  PC: <Monitor className="w-6 h-6" />,
  Laptop: <Laptop className="w-6 h-6" />,
  Tablet: <Tablet className="w-6 h-6" />,
  Phone: <Smartphone className="w-6 h-6" />,
  Printer: <HardDrive className="w-6 h-6" />,
  Unknown: <Cpu className="w-6 h-6" />
};

const App = () => {
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [newDevice, setNewDevice] = useState({ ip_address: '', name: '', device_type: 'PC' });

  // Data Fetching
  const { data: devices = [], isLoading: devicesLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: getDevices,
    refetchInterval: 10000,
  });

  const { data: stats = { total: 0, up: 0, down: 0 } } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 10000,
  });

  const { data: appSettings } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // Mutations
  const addMutation = useMutation({
    mutationFn: createDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      setShowAddModal(false);
      setNewDevice({ ip_address: '', name: '', device_type: 'PC' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDevice,
    onSuccess: () => {
      queryClient.invalidateQueries(['devices']);
      setSelectedDevice(null);
    },
  });

  const discoverMutation = useMutation({
    mutationFn: triggerDiscovery,
    onSuccess: () => {
      setTimeout(() => queryClient.invalidateQueries(['devices']), 5000);
    },
  });

  const settingsMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries(['settings']);
      setShowSettings(false);
    },
  });

  // Device Update Success Handler
  const handleDeviceUpdate = () => {
    queryClient.invalidateQueries(['devices']);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/30">
      {/* Header */}
      <header className="border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Activity className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Net-Monitor <span className="text-primary italic">Beta</span></h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => discoverMutation.mutate()}
              disabled={discoverMutation.isPending}
              className="hidden md:flex items-center gap-2 text-foreground/80 hover:text-primary transition-all px-4 py-2 rounded-xl text-sm font-bold bg-white/5 border border-white/5"
            >
              <RefreshCcw className={`w-4 h-4 ${discoverMutation.isPending ? 'animate-spin' : ''}`} />
              Scan Network
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="p-2.5 rounded-xl hover:bg-white/5 transition-colors border border-white/5"
            >
              <Settings className="w-5 h-5 text-muted hover:text-white transition-colors" />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 active:scale-95 text-sm"
            >
              <Plus className="w-5 h-5" />
              <span>Add</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 space-y-12">

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard title="Tracked" value={stats.total} icon={<Server className="text-blue-400" />} />
          <StatCard title="Online" value={stats.up} icon={<Wifi className="text-emerald-400" />} color="emerald" />
          <StatCard title="Critical" value={stats.down} icon={<WifiOff className="text-rose-400" />} color="rose" />
        </section>

        {/* Device List */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              Device Status
            </h2>
          </div>

          {devicesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3].map(i => <div key={i} className="h-48 glass rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {devices.map((device) => (
                <DeviceCard
                  key={device.id}
                  device={device}
                  onSelect={() => setSelectedDevice(device)}
                  onDelete={() => { if (confirm('Are you sure you want to delete this device?')) deleteMutation.mutate(device.id) }}
                />
              ))}
              {devices.length === 0 && (
                <div className="col-span-full py-20 text-center glass rounded-3xl border-dashed">
                  <p className="text-muted mb-4 italic">No devices found. Start a scan or add one manually.</p>
                  <button onClick={() => discoverMutation.mutate()} className="text-primary hover:underline font-bold">Scan Network Now</button>
                </div>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="py-10 border-t border-border/50 text-center text-muted text-xs font-medium tracking-wide bg-black/20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p>© 2026 Sina Kop • Net-Monitor</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-2 overflow-hidden px-3 py-1 bg-emerald-500/5 border border-emerald-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> API ONLINE
            </span>
            <span className="flex items-center gap-2 px-3 py-1 bg-blue-500/5 border border-blue-500/10 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> SQLITE ACTIVE
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAddModal && <AddDeviceModal
        newDevice={newDevice}
        setNewDevice={setNewDevice}
        onClose={() => setShowAddModal(false)}
        onSubmit={() => addMutation.mutate(newDevice)}
      />}

      {showSettings && appSettings && <SettingsModal
        settings={appSettings}
        onClose={() => setShowSettings(false)}
        onSave={(s) => settingsMutation.mutate(s)}
      />}

      {selectedDevice && <DeviceDetailModal
        device={selectedDevice}
        onClose={() => setSelectedDevice(null)}
        onUpdate={handleDeviceUpdate}
      />}
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ title, value, icon, color = "blue" }) => (
  <div className="glass p-8 rounded-3xl relative overflow-hidden group hover:bg-white/8 transition-all border-none">
    <div className="relative z-10 flex flex-col gap-5">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-${color}-500/10 border border-${color}-500/20`}>
        {icon}
      </div>
      <div>
        <p className="text-muted text-sm font-semibold mb-1 uppercase tracking-widest">{title}</p>
        <p className="text-4xl font-black tabular-nums">{value}</p>
      </div>
    </div>
    <div className={`absolute -right-6 -bottom-6 w-32 h-32 bg-${color}-500/5 rounded-full blur-3xl group-hover:bg-${color}-500/10 transition-all duration-700`} />
  </div>
);

const DeviceCard = ({ device, onSelect, onDelete }) => {
  const isUp = device.last_status === "Up";
  return (
    <div className={`glass p-6 rounded-2xl group relative border-none cursor-pointer hover:bg-white/5 transition-all ${isUp ? 'glow-up' : 'glow-down'}`} onClick={onSelect}>
      <div className="flex items-start justify-between mb-8">
        <div className={`p-3 bg-white/5 rounded-xl border border-white/5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
          {typeIcons[device.device_type] || typeIcons.Unknown}
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${isUp ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
            {device.last_status}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-2 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-1 mb-8">
        <h4 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{device.name || 'Discovered'}</h4>
        <p className="text-muted text-xs font-mono flex items-center gap-1.5 opacity-70 tracking-tighter uppercase"><Globe className="w-3 h-3" />{device.ip_address}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-6">
        <div>
          <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1 opacity-50">LATENCY</p>
          <p className="font-bold text-sm tabular-nums">{device.last_latency != null ? `${Math.round(device.last_latency)}ms` : '--'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted uppercase font-black tracking-widest mb-1 opacity-50">LAST SEEN</p>
          <p className="text-sm font-semibold">{device.last_seen ? format(new Date(device.last_seen), 'HH:mm:ss') : '--'}</p>
        </div>
      </div>
    </div>
  );
};

const DeviceDetailModal = ({ device, onClose, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(device.name);
  const [editType, setEditType] = useState(device.device_type);

  useEffect(() => {
    setEditName(device.name);
    setEditType(device.device_type);
  }, [device]);

  const { data: logs = [] } = useQuery({
    queryKey: ['logs', device.id],
    queryFn: () => getDeviceLogs(device.id),
    refetchInterval: 30000,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateDevice(device.id, data),
    onSuccess: () => {
      setIsEditing(false);
      onUpdate();
    },
  });

  const chartData = [...logs].reverse().map(log => ({
    time: format(new Date(log.timestamp), 'HH:mm'),
    latency: log.latency || 0,
    status: log.status
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-secondary p-8 rounded-3xl w-full max-w-4xl border border-white/10 shadow-3xl animate-in fade-in zoom-in duration-300">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              {typeIcons[device.device_type] || typeIcons.Unknown}
            </div>
            <div>
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="bg-background border border-primary/30 text-2xl font-black px-3 py-1 rounded-xl focus:outline-none focus:ring-2 ring-primary/50"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                    />
                    <select
                      className="bg-background border border-primary/30 text-sm font-bold px-3 py-2 rounded-xl focus:outline-none"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      {Object.keys(typeIcons).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <button
                      onClick={() => updateMutation.mutate({ name: editName, device_type: editType })}
                      className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-all"
                    >
                      <Check className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 bg-white/5 text-muted rounded-lg hover:bg-white/10 transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-black">{device.name}</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-1.5 text-muted hover:text-primary transition-all rounded-lg hover:bg-white/5"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <p className="text-muted text-sm font-mono tracking-widest">{device.ip_address} • {device.device_type}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/5 rounded-xl transition-colors"><X /></button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-[300px] w-full bg-black/20 rounded-2xl p-6 border border-white/5">
              <h4 className="text-[10px] font-black tracking-widest text-muted uppercase mb-4">Latency Trend (ms)</h4>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #ffffff10', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#latencyGradient)"
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 glass rounded-2xl space-y-4">
              <h4 className="text-[10px] font-black tracking-widest text-muted uppercase">Status Analysis</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current</span>
                <span className={`px-3 py-0.5 rounded-full text-[10px] font-bold ${device.last_status === 'Up' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {device.last_status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failures</span>
                <span className="text-sm font-bold tabular-nums">{logs.filter(l => l.status === 'Down').length}</span>
              </div>
            </div>

            <div className="p-6 glass rounded-2xl">
              <h4 className="text-[10px] font-black tracking-widest text-muted uppercase mb-4">Recent Events</h4>
              <div className="space-y-3 max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
                {logs.slice(0, 5).map(log => (
                  <div key={log.id} className="flex items-center gap-3 text-[11px]">
                    <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Up' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="font-bold opacity-80">{log.status}</span>
                    <span className="text-muted ml-auto font-mono">{format(new Date(log.timestamp), 'HH:mm')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsModal = ({ settings, onClose, onSave }) => {
  const [form, setForm] = useState(settings);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="bg-secondary p-8 rounded-3xl w-full max-w-2xl border border-white/10 shadow-3xl">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-bold flex items-center gap-2"><Settings className="w-5 h-5" /> System Settings</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-muted hover:text-white" /></button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
          <div className="space-y-6">
            <h4 className="text-[10px] font-black tracking-widest text-primary uppercase">Scan Parameters</h4>
            <div>
              <label className="text-xs text-muted mb-2 block font-bold">Subnet Range</label>
              <div className="flex items-center gap-2 bg-background p-1.5 rounded-xl border border-white/5">
                <Globe className="w-4 h-4 text-muted ml-2" />
                <input
                  className="bg-transparent flex-1 p-2 text-sm focus:outline-none"
                  value={form.subnet_range}
                  onChange={e => setForm({ ...form, subnet_range: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-muted mb-2 block font-bold">Interval (sec)</label>
                <input
                  type="number" className="w-full bg-background p-3 rounded-xl border border-white/5 text-sm"
                  value={form.scan_interval}
                  onChange={e => setForm({ ...form, scan_interval: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-muted mb-2 block font-bold">Retry Count</label>
                <input
                  type="number" className="w-full bg-background p-3 rounded-xl border border-white/5 text-sm"
                  value={form.error_threshold}
                  onChange={e => setForm({ ...form, error_threshold: parseInt(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h4 className="text-[10px] font-black tracking-widest text-primary uppercase">Notification Channels</h4>
            <div>
              <label className="text-xs text-muted mb-2 block font-bold">Discord Webhook</label>
              <input
                className="w-full bg-background p-3 rounded-xl border border-white/5 text-xs font-mono"
                value={form.discord_webhook || ''}
                placeholder="https://discord.com/api/webhooks/..."
                onChange={e => setForm({ ...form, discord_webhook: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-muted mb-2 block font-bold">Slack URL</label>
              <input
                className="w-full bg-background p-3 rounded-xl border border-white/5 text-xs font-mono"
                value={form.slack_webhook || ''}
                placeholder="https://hooks.slack.com/services/..."
                onChange={e => setForm({ ...form, slack_webhook: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between p-4 glass rounded-xl">
              <span className="text-sm font-bold flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Email Notifications</span>
              <button
                onClick={() => setForm({ ...form, email_enabled: !form.email_enabled })}
                className={`w-10 h-6 rounded-full transition-colors relative ${form.email_enabled ? 'bg-primary' : 'bg-muted'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${form.email_enabled ? 'left-5' : 'left-1'}`} />
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => onSave(form)}
          className="w-full bg-primary py-4 rounded-2xl font-black text-white hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
        >
          Save & Apply Settings
        </button>
      </div>
    </div>
  );
};

const AddDeviceModal = ({ newDevice, setNewDevice, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
    <div className="bg-secondary p-8 rounded-3xl w-full max-w-md border border-white/10 shadow-3xl">
      <h3 className="text-2xl font-black mb-8 flex items-center gap-3"><Plus className="p-2 bg-primary/20 rounded-xl text-primary" /> Add Device</h3>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-6">
        <div>
          <label className="block text-[10px] font-black text-muted mb-2 uppercase tracking-widest">Device Name</label>
          <input
            type="text"
            value={newDevice.name}
            onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
            className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-semibold"
            placeholder="e.g. Storage Server"
            required
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black text-muted mb-2 uppercase tracking-widest">Static IP</label>
            <input
              type="text"
              value={newDevice.ip_address}
              onChange={(e) => setNewDevice({ ...newDevice, ip_address: e.target.value })}
              className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-mono"
              placeholder="10.0.0.1"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-muted mb-2 uppercase tracking-widest">Type</label>
            <select
              className="w-full bg-background border border-white/5 rounded-2xl px-5 py-4 focus:outline-none font-bold"
              value={newDevice.device_type}
              onChange={(e) => setNewDevice({ ...newDevice, device_type: e.target.value })}
            >
              {Object.keys(typeIcons).map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-4 pt-6">
          <button type="button" onClick={onClose} className="flex-1 py-4 font-bold rounded-2xl border border-white/5 hover:bg-white/5 transition-colors">Cancel</button>
          <button type="submit" className="flex-1 bg-primary py-4 rounded-2xl font-black text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Save</button>
        </div>
      </form>
    </div>
  </div>
);

export default App;
