import React, { useEffect, useState } from 'react';
import { FiCpu, FiSave, FiX } from 'react-icons/fi';
import { apiClient, type LLMConfig } from '../services/api';

interface LLMManagerProps {
    isOpen: boolean;
    onClose: () => void;
    onConfigChanged: () => void;
}

export const LLMManager: React.FC<LLMManagerProps> = ({ isOpen, onClose, onConfigChanged }) => {
    const [loading, setLoading] = useState(false);
    const [config, setConfig] = useState<LLMConfig>({
        type: 'openai',
        model: 'gpt-4o',
        api_key: '',
        base_url: '',
        api_base: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [customModel, setCustomModel] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadConfig();
        }
    }, [isOpen]);

    const loadConfig = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            const response = await apiClient.getLLMConfig();
            const currentConfig = response.config;
            const loadedModel = currentConfig.model || '';
            const configType = (currentConfig.type as any) || 'openai';

            // Check if loaded model is in the dropdown lists, if not, set to custom
            const isOpenAIModel = ['gpt-4o', 'gpt-4-turbo', 'gpt-4', 'gpt-4o-mini', 'gpt-3.5-turbo', 'o1-preview', 'o1-mini'].includes(loadedModel);
            const isGeminiModel = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-pro', 'gemini-2.5-flash-lite'].includes(loadedModel);

            // Determine if we should use "custom" option
            let modelValue = loadedModel;
            if ((configType === 'openai' && !isOpenAIModel && loadedModel) ||
                (configType === 'gemini' && !isGeminiModel && loadedModel)) {
                modelValue = 'custom';
            } else if (!loadedModel) {
                // Set default if model is empty
                if (configType === 'openai') {
                    modelValue = 'gpt-4o';
                } else if (configType === 'gemini') {
                    modelValue = 'gemini-1.5-flash';
                } else {
                    modelValue = '';
                }
            }

            setConfig({
                type: configType,
                model: modelValue,
                api_key: '', // Never show API key
                base_url: currentConfig.base_url || (configType === 'ollama' ? 'http://localhost:11434' : ''),
                api_base: currentConfig.api_base || '',
            });

            // Set custom model if it's not in dropdown
            if (((configType === 'openai' && !isOpenAIModel) || (configType === 'gemini' && !isGeminiModel)) && loadedModel) {
                setCustomModel(loadedModel);
            } else {
                setCustomModel('');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load LLM configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        // Validate based on type
        let modelToSave = config.model;

        // Handle custom model selection
        if (config.model === 'custom') {
            if (!customModel || !customModel.trim()) {
                setError('Please enter a custom model name');
                return;
            }
            modelToSave = customModel.trim();
        }

        // Validate model name is not empty
        if (!modelToSave || !modelToSave.trim()) {
            setError('Model name is required');
            return;
        }

        // Trim model name
        modelToSave = modelToSave.trim();

        // Validate API key for non-Ollama providers
        if (config.type !== 'ollama') {
            if (!config.api_key || !config.api_key.trim()) {
                setError(`API key is required for ${config.type.charAt(0).toUpperCase() + config.type.slice(1)}`);
                return;
            }
        }

        setLoading(true);
        try {
            // Create config with the actual model name (not 'custom')
            const configToSave = {
                ...config,
                model: modelToSave
            };
            const response = await apiClient.setLLMConfig(configToSave);
            const message = response.message || 'LLM configuration saved successfully!';
            const status = response.status || 'success';

            if (status === 'warning') {
                // Show warning but still close
                setSuccess(`⚠️ ${message}`);
            } else {
                setSuccess(message);
            }

            setTimeout(() => {
                onConfigChanged();
                onClose();
            }, status === 'warning' ? 2500 : 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to save LLM configuration');
        } finally {
            setLoading(false);
        }
    };

    const handleTypeChange = (type: 'openai' | 'groq' | 'ollama' | 'gemini') => {
        // Set default models based on type
        let defaultModel = '';

        // Only preserve model if switching between same provider types with dropdowns
        if ((type === 'openai' && config.type === 'openai') || (type === 'gemini' && config.type === 'gemini')) {
            // Keep current model if it's not "custom"
            if (config.model !== 'custom') {
                defaultModel = config.model;
            } else {
                // If current is custom, use default for the type
                defaultModel = type === 'openai' ? 'gpt-4o' : 'gemini-1.5-flash';
            }
        } else {
            // Switching to different provider type, use defaults
            if (type === 'openai') {
                defaultModel = 'gpt-4o';
            } else if (type === 'gemini') {
                defaultModel = 'gemini-1.5-flash';
            } else if (type === 'groq') {
                defaultModel = '';
            } else if (type === 'ollama') {
                defaultModel = 'llama3.2';
            }
        }

        // Clear custom model when switching types
        setCustomModel('');

        // Preserve api_base only when switching to OpenAI (if it was previously set)
        let newApiBase = '';
        if (type === 'openai' && config.api_base) {
            newApiBase = config.api_base;
        } else if (type !== 'openai') {
            newApiBase = '';
        }

        setConfig({
            ...config,
            type,
            // Set defaults based on type
            base_url: type === 'ollama' ? 'http://localhost:11434' : '',
            api_base: newApiBase,
            model: defaultModel,
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 backdrop-blur-sm">
            <div className="bg-neutral-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-neutral-800 shadow-2xl">
                {/* Header */}
                <div className="bg-neutral-800 p-6 flex justify-between items-center border-b border-neutral-700">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-neutral-200">
                        <FiCpu className="text-xl" />
                        LLM MODEL CONFIGURATION
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded hover:bg-neutral-700 transition-all flex items-center justify-center text-neutral-400 hover:text-neutral-200"
                    >
                        <FiX className="text-xl" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    {loading && !config.model ? (
                        <div className="text-center py-8 text-neutral-500">Loading configuration...</div>
                    ) : (
                        <form onSubmit={handleSave} className="space-y-6">
                            {/* LLM Type Selection */}
                            <div className="border border-neutral-800 rounded-lg p-6 bg-neutral-950">
                                <label className="block text-sm font-medium text-neutral-400 mb-3">
                                    LLM Provider Type
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('openai')}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${config.type === 'openai'
                                            ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                                            }`}
                                    >
                                        OpenAI
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('groq')}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${config.type === 'groq'
                                            ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                                            }`}
                                    >
                                        Groq
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('gemini')}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${config.type === 'gemini'
                                            ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                                            }`}
                                    >
                                        Gemini
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleTypeChange('ollama')}
                                        className={`px-4 py-3 rounded-lg border-2 transition-all font-medium ${config.type === 'ollama'
                                            ? 'bg-neutral-800 text-neutral-200 border-neutral-600'
                                            : 'bg-neutral-900 text-neutral-400 border-neutral-700 hover:border-neutral-600'
                                            }`}
                                    >
                                        Ollama
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-500 mt-2">
                                    {config.type === 'openai' && 'OpenAI API (GPT-4, GPT-3.5, etc.)'}
                                    {config.type === 'groq' && 'Groq API (Fast inference with Groq models)'}
                                    {config.type === 'gemini' && 'Google Gemini API (gemini-1.5-pro, gemini-1.5-flash, etc.)'}
                                    {config.type === 'ollama' && 'Local Ollama instance (Llama, Mistral, etc.)'}
                                </p>
                            </div>

                            {/* Model Name */}
                            <div>
                                <label className="block text-sm font-medium text-neutral-400 mb-2">
                                    Model Name <span className="text-red-400">*</span>
                                </label>

                                {/* Dropdown for OpenAI */}
                                {config.type === 'openai' && (
                                    <div className="space-y-2">
                                        <select
                                            value={config.model}
                                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200"
                                        >
                                            <option value="gpt-4o" className="bg-neutral-800">gpt-4o</option>
                                            <option value="gpt-4-turbo" className="bg-neutral-800">gpt-4-turbo</option>
                                            <option value="gpt-4" className="bg-neutral-800">gpt-4</option>
                                            <option value="gpt-4o-mini" className="bg-neutral-800">gpt-4o-mini</option>
                                            <option value="gpt-3.5-turbo" className="bg-neutral-800">gpt-3.5-turbo</option>
                                            <option value="o1-preview" className="bg-neutral-800">o1-preview</option>
                                            <option value="o1-mini" className="bg-neutral-800">o1-mini</option>
                                            <option value="custom" className="bg-neutral-800">Custom (type below)</option>
                                        </select>
                                        {config.model === 'custom' && (
                                            <input
                                                type="text"
                                                value={customModel}
                                                onChange={(e) => setCustomModel(e.target.value)}
                                                placeholder="Enter custom OpenAI model name (e.g., gpt-4-custom)"
                                                className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                                autoFocus
                                                required={config.model === 'custom'}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Dropdown for Gemini */}
                                {config.type === 'gemini' && (
                                    <div className="space-y-2">
                                        <select
                                            value={config.model}
                                            onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                            className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200"
                                        >
                                            <option value="gemini-1.5-flash" className="bg-neutral-800">gemini-1.5-flash (Recommended)</option>
                                            <option value="gemini-1.5-pro" className="bg-neutral-800">gemini-1.5-pro</option>
                                            <option value="gemini-2.5-flash" className="bg-neutral-800">gemini-2.5-flash</option>
                                            <option value="gemini-2.5-pro" className="bg-neutral-800">gemini-2.5-pro</option>
                                            <option value="gemini-pro" className="bg-neutral-800">gemini-pro</option>
                                            <option value="gemini-2.5-flash-lite" className="bg-neutral-800">gemini-2.5-flash-lite</option>
                                            <option value="custom" className="bg-neutral-800">Custom (type below)</option>
                                        </select>
                                        {config.model === 'custom' && (
                                            <input
                                                type="text"
                                                value={customModel}
                                                onChange={(e) => setCustomModel(e.target.value)}
                                                placeholder="Enter custom Gemini model name (e.g., gemini-custom-model)"
                                                className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                                autoFocus
                                                required={config.model === 'custom'}
                                            />
                                        )}
                                    </div>
                                )}

                                {/* Text input for Groq and Ollama */}
                                {(config.type === 'groq' || config.type === 'ollama') && (
                                    <input
                                        type="text"
                                        value={config.model}
                                        onChange={(e) => setConfig({ ...config, model: e.target.value })}
                                        placeholder={
                                            config.type === 'groq' ? 'llama-3.1-70b-versatile, mixtral-8x7b-32768' :
                                                'llama3, mistral, codellama'
                                        }
                                        className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                        required
                                    />
                                )}
                            </div>

                            {/* API Key (not for Ollama) */}
                            {config.type !== 'ollama' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                                        API Key <span className="text-red-400">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={config.api_key || ''}
                                        onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                                        placeholder={
                                            config.type === 'openai' ? 'sk-...' :
                                                config.type === 'groq' ? 'gsk_...' :
                                                    'AIza... (Get from https://aistudio.google.com/app/apikey)'
                                        }
                                        className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                        required={true}
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Your API key is stored securely and never displayed after saving.
                                        {config.type === 'gemini' && ' Get your API key from Google AI Studio.'}
                                    </p>
                                </div>
                            )}

                            {/* Base URL (for Ollama) */}
                            {config.type === 'ollama' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                                        Ollama Base URL
                                    </label>
                                    <input
                                        type="url"
                                        value={config.base_url}
                                        onChange={(e) => setConfig({ ...config, base_url: e.target.value })}
                                        placeholder="http://localhost:11434"
                                        className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Default: http://localhost:11434
                                    </p>
                                </div>
                            )}

                            {/* Custom API Base (for OpenAI) */}
                            {config.type === 'openai' && (
                                <div>
                                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                                        Custom API Base URL (Optional)
                                    </label>
                                    <input
                                        type="url"
                                        value={config.api_base || ''}
                                        onChange={(e) => setConfig({ ...config, api_base: e.target.value })}
                                        placeholder="https://api.openai.com/v1 (leave empty for default)"
                                        className="w-full px-4 py-2.5 border border-neutral-700 rounded-lg focus:outline-none focus:border-neutral-600 focus:ring-2 focus:ring-neutral-600 bg-neutral-800 text-neutral-200 placeholder-neutral-500"
                                    />
                                    <p className="text-xs text-neutral-500 mt-1">
                                        Use custom OpenAI-compatible API endpoints.
                                    </p>
                                </div>
                            )}

                            {/* Error/Success Messages */}
                            {error && (
                                <div className="text-red-400 text-sm bg-red-950 p-3 rounded-lg border border-red-900">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="text-green-400 text-sm bg-green-950 p-3 rounded-lg border border-green-900">
                                    {success}
                                </div>
                            )}

                            {/* Save Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 bg-neutral-800 text-neutral-200 rounded-lg font-semibold hover:bg-neutral-700 transition-all flex items-center justify-center gap-2 border border-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <FiSave className="text-base" />
                                {loading ? 'Saving...' : 'Save Configuration'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

