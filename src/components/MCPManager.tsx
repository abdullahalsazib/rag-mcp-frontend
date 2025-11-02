import React, { useEffect, useState } from 'react';
import { FiPlus, FiServer, FiTrash2, FiX } from 'react-icons/fi';
import { apiClient, type MCPServer } from '../services/api';

interface MCPManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onServerAdded: (serverName: string) => void;
}

export const MCPManager: React.FC<MCPManagerProps> = ({ isOpen, onClose, onServerAdded }) => {
    const [servers, setServers] = useState<MCPServer[]>([]);
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadServers();
        }
    }, [isOpen]);

    const loadServers = async () => {
        setLoading(true);
        try {
            const response = await apiClient.listMCPServers();
            setServers(response.servers);
        } catch (err) {
            console.error('Failed to load servers:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddServer = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!name.trim() || !url.trim()) {
            setError('Please fill in all fields');
            return;
        }

        try {
            await apiClient.addMCPServer({ name: name.trim(), url: url.trim() });
            setName('');
            setUrl('');
            await loadServers();
            onServerAdded(name.trim());
        } catch (err: any) {
            setError(err.message || 'Failed to add server');
        }
    };

    const handleDeleteServer = async (serverName: string) => {
        if (!confirm(`Delete server "${serverName}"?`)) return;

        try {
            await apiClient.deleteMCPServer(serverName);
            await loadServers();
        } catch (err: any) {
            alert(err.message || 'Failed to delete server');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-neutral-800 shadow-2xl">
                {/* Header */}
                <div className="bg-neutral-800 p-6 flex justify-between items-center border-b border-neutral-700">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-200">
                        <FiServer className="text-xl" />
                        MCP SERVER MANAGEMENT
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded hover:bg-neutral-700 transition-all flex items-center justify-center text-neutral-400 hover:text-neutral-200"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Add Server Form */}
                    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950">
                        <h3 className="text-lg font-semibold mb-4 text-neutral-200">Add New Server</h3>
                        <form onSubmit={handleAddServer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Server Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Weather, Database"
                                    className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Server URL
                                </label>
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    placeholder="https://your-server.com/mcp"
                                    className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                />
                            </div>

                            {error && (
                                <div className="text-red-400 text-sm bg-red-950 p-3 rounded-lg border border-red-900">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="w-full py-3 bg-neutral-800 text-neutral-200 rounded-lg font-semibold hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 border border-neutral-700"
                            >
                                <FiPlus className="text-base" />
                                Add Server
                            </button>
                        </form>
                    </div>

                    {/* Server List */}
                    <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950">
                        <h3 className="text-lg font-semibold mb-4 text-neutral-200">
                            Configured Servers ({servers.length})
                        </h3>

                        {loading ? (
                            <div className="text-center py-8 text-neutral-500">Loading servers...</div>
                        ) : servers.length === 0 ? (
                            <div className="text-center py-8 text-neutral-500">
                                No servers configured yet
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {servers.map((server) => (
                                    <div
                                        key={server.name}
                                        className="bg-neutral-900 rounded-lg p-4 border border-neutral-800 hover:border-neutral-700 transition-all flex justify-between items-center"
                                    >
                                        <div className="flex-1">
                                            <div className="font-semibold text-neutral-200 flex items-center gap-2">
                                                <FiServer className="text-base" />
                                                {server.name}
                                            </div>
                                            <div className="text-sm text-neutral-500 break-all mt-1 font-mono">
                                                {server.url}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteServer(server.name)}
                                            className="ml-4 px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg hover:bg-neutral-700 transition-all text-sm font-medium flex items-center gap-2 border border-neutral-700"
                                        >
                                            <FiTrash2 className="text-sm" />
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
