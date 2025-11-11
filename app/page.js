'use client';

import { useState, useEffect } from 'react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for expanded sections
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedPrompts, setExpandedPrompts] = useState({});
  
  // State for versions and editing
  const [promptVersions, setPromptVersions] = useState({});
  const [selectedVersions, setSelectedVersions] = useState({});
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editedContent, setEditedContent] = useState('');
  const [formattingPromptId, setFormattingPromptId] = useState(null);

  // Filter prompts based on search
  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch categories and prompts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch all prompts
        const promptsResponse = await fetch('https://promptdbservice.onrender.com/api/db/getPrompts');
        if (!promptsResponse.ok) {
          throw new Error('Failed to fetch prompts');
        }
        const promptsData = await promptsResponse.json();
        setPrompts(promptsData);

        // Extract unique categories from prompts
        const uniqueCategories = [...new Set(promptsData.map(prompt => prompt.category || 'uncategorized'))];
        setCategories(uniqueCategories.sort());

        // Initialize selected versions with active versions
        const initialSelectedVersions = {};
        promptsData.forEach(prompt => {
          initialSelectedVersions[prompt.prompt_id] = prompt.active_version_id;
        });
        setSelectedVersions(initialSelectedVersions);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch versions for all prompts in a category when category expands
  const fetchVersionsForCategory = async (categoryPrompts) => {
    try {
      // Fetch versions for all prompts in parallel
      const versionPromises = categoryPrompts.map(async (prompt) => {
        if (!promptVersions[prompt.prompt_id]) {
          return fetchPromptVersions(prompt.prompt_id);
        }
        return promptVersions[prompt.prompt_id];
      });

      await Promise.all(versionPromises);
      
    } catch (err) {
      console.error('Error fetching versions for category:', err);
    }
  };

  // Fetch versions for a specific prompt
  const fetchPromptVersions = async (promptId) => {
    try {
      const response = await fetch(`https://promptdbservice.onrender.com/api/db/getPromptVersions/${promptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const versions = await response.json();
      
      setPromptVersions(prev => ({
        ...prev,
        [promptId]: versions
      }));

      // Find the active version
      const activeVersion = versions.find(v => v.is_active) || versions[0];
      if (activeVersion && (!selectedVersions[promptId] || selectedVersions[promptId] === promptId)) {
        setSelectedVersions(prev => ({
          ...prev,
          [promptId]: activeVersion.version_id
        }));
      }

      return versions;
    } catch (err) {
      console.error('Error fetching versions:', err);
      return [];
    }
  };

  // Toggle category expansion
  const toggleCategory = async (category) => {
    const isExpanding = !expandedCategories[category];
    
    if (isExpanding) {
      const categoryPrompts = prompts.filter(prompt => prompt.category === category);
      await fetchVersionsForCategory(categoryPrompts);
    }
    
    setExpandedCategories(prev => ({
      ...prev,
      [category]: isExpanding
    }));
  };

  // Toggle prompt expansion
  const togglePrompt = (prompt) => {
    setExpandedPrompts(prev => ({
      ...prev,
      [prompt.prompt_id]: !prev[prompt.prompt_id]
    }));
  };

  // Handle version selection
  const handleVersionSelect = (promptId, versionId) => {
    setSelectedVersions(prev => ({
      ...prev,
      [promptId]: versionId
    }));
  };

  // Start editing a prompt
  const startEditing = (promptId, currentContent) => {
    setEditingPromptId(promptId);
    setEditedContent(currentContent);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPromptId(null);
    setEditedContent('');
  };

  // Save edited prompt (create new version)
  const saveEditedPrompt = async (prompt) => {
    try {
      const response = await fetch(`https://promptdbservice.onrender.com/api/db/updatePrompt/${prompt.prompt_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_text: editedContent,
          title: prompt.title,
          description: prompt.description,
          metadata: {
            topic: prompt.title,
            category: prompt.category || 'general',
            tags: [],
            based_on_version: selectedVersions[prompt.prompt_id]
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save new version');
      }

      const result = await response.json();

      // Refresh versions and select the new version
      const updatedVersions = await fetchPromptVersions(prompt.prompt_id);
      
      if (updatedVersions && updatedVersions.length > 0) {
        const latestVersion = updatedVersions[0];
        setSelectedVersions(prev => ({
          ...prev,
          [prompt.prompt_id]: latestVersion.version_id
        }));
      }

      setEditingPromptId(null);
      setEditedContent('');
      
      alert('New version created successfully!');
      
    } catch (error) {
      console.error('Error saving new version:', error);
      alert(`Failed to save changes: ${error.message}`);
    }
  };

  // Format prompt using AI
  const formatPromptWithAI = async (promptId, currentContent) => {
    try {
      setFormattingPromptId(promptId);
      
      // Call your formatting API
      const response = await fetch('/api/format-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: currentContent,
          instruction: "Format this prompt to follow industry best practices. Improve clarity, structure, and effectiveness while maintaining the original intent."
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to format prompt');
      }

      const result = await response.json();
      
      // Update the edited content with formatted version
      setEditedContent(result.formattedPrompt);
      
      alert('Prompt formatted successfully! You can review the changes and save as new version.');
      
    } catch (error) {
      console.error('Error formatting prompt:', error);
      alert('Failed to format prompt. Please try again.');
    } finally {
      setFormattingPromptId(null);
    }
  };

  const handleCopyPrompt = async (prompt, promptText) => {
    const selectedVersion = promptVersions[prompt.prompt_id]?.find(v => v.version_id === selectedVersions[prompt.prompt_id]);
    const contentToCopy = selectedVersion?.prompt_text || promptText;

    const fullPromptText = `Category: ${prompt.category || 'general'} \nTitle: ${prompt.title} \nDescription: ${prompt.description} \nQuery: ${contentToCopy}`.trim();

    try {
      await navigator.clipboard.writeText(fullPromptText);
      console.log('Prompt copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      const textArea = document.createElement('textarea');
      textArea.value = fullPromptText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        console.log('Prompt copied to clipboard!');
      } catch (fallbackErr) {
        alert('Failed to copy prompt details. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get active version for a prompt
  const getActiveVersion = (promptId) => {
    const versions = promptVersions[promptId] || [];
    return versions.find(v => v.is_active) || versions[0];
  };

  // Check if we're currently editing this prompt
  const isEditingPrompt = (promptId) => {
    return editingPromptId === promptId;
  };

  // Get the next version number (latest version + 1)
  const getNextVersionNumber = (promptId) => {
    const versions = promptVersions[promptId] || [];
    if (versions.length === 0) return 1;
    
    const latestVersion = Math.max(...versions.map(v => v.version_number));
    return latestVersion + 1;
  };

  // Get selected version number
  const getSelectedVersionNumber = (promptId) => {
    const selectedVersionId = selectedVersions[promptId];
    const selectedVersion = promptVersions[promptId]?.find(v => v.version_id === selectedVersionId);
    return selectedVersion?.version_number || 1;
  };

  // Group prompts by category
  const promptsByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredPrompts.filter(prompt => prompt.category === category);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your prompt library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header */}
        <div className="text-center mb-8 fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-3 bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Prompt Library
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage and organize your AI prompts with version control and easy access
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 fade-in">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search prompts by title, description, or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Stats Bar - Updated Order */}
        <div className="mb-8 fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-green-600">{categories.length}</div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">{prompts.length}</div>
              <div className="text-sm text-gray-600">Total Prompts</div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredPrompts.length === 0 && searchTerm && (
          <div className="text-center py-12 fade-in">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No prompts found</h3>
            <p className="text-gray-500 mb-6">Try adjusting your search terms or create a new prompt</p>
            <button className="btn-primary">Create New Prompt</button>
          </div>
        )}

        {filteredPrompts.length === 0 && !searchTerm && (
          <div className="text-center py-16 fade-in">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Your prompt library is empty</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Get started by creating your first prompt. Organize them by categories and track versions as you iterate.
            </p>
            <button className="btn-primary">Create Your First Prompt</button>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-6 max-w-6xl mx-auto">
          {categories.map((category) => {
            const categoryPrompts = promptsByCategory[category] || [];
            const isCategoryExpanded = expandedCategories[category];
            
            if (categoryPrompts.length === 0) return null;
            
            return (
              <div key={category} className="fade-in">
                {/* Category Card */}
                <div 
                  className="bg-white rounded-xl border border-gray-200 shadow-sm card-hover cursor-pointer"
                  onClick={() => toggleCategory(category)}
                >
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 capitalize">
                          {category}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          {categoryPrompts.length} prompt{categoryPrompts.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                      {isCategoryExpanded ? '▼' : '►'}
                    </button>
                  </div>
                </div>

                {/* Prompts List */}
                {isCategoryExpanded && (
                  <div className="mt-4 ml-8 space-y-4 animate-fade-in">
                    {categoryPrompts.map((prompt, index) => {
                      const isPromptExpanded = expandedPrompts[prompt.prompt_id];
                      const versions = promptVersions[prompt.prompt_id] || [];
                      const selectedVersionId = selectedVersions[prompt.prompt_id];
                      const selectedVersion = versions.find(v => v.version_id === selectedVersionId);
                      const isEditing = isEditingPrompt(prompt.prompt_id);
                      const isFormatting = formattingPromptId === prompt.prompt_id;
                      
                      const nextVersionNumber = getNextVersionNumber(prompt.prompt_id);
                      const selectedVersionNumber = getSelectedVersionNumber(prompt.prompt_id);
                      
                      return (
                        <div key={prompt.prompt_id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                          {/* Unified Prompt Card */}
                          <div className="bg-white rounded-xl border border-gray-200 shadow-sm card-hover overflow-hidden">
                            {/* Prompt Header - Always Visible */}
                            <div 
                              className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                              onClick={() => togglePrompt(prompt)}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                      <h3 className="font-semibold text-gray-900 text-lg mb-2">
                                        {prompt.title}
                                      </h3>
                                      <p className="text-gray-600 leading-relaxed">
                                        {prompt.description}
                                      </p>
                                    </div>
                                    {/* Simplified version badge - only show count */}
                                    {versions.length > 0 && (
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 ml-4 flex-shrink-0">
                                        {versions.length}v
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                                    <span>Created {formatDate(prompt.created_at)}</span>
                                    <span>•</span>
                                    <span className="capitalize bg-gray-100 px-2 py-1 rounded-md">{prompt.category}</span>
                                  </div>
                                </div>
                                <button className="p-2 hover:bg-gray-200 rounded-lg transition-colors text-gray-400 hover:text-gray-600 ml-4">
                                  {isPromptExpanded ? '▼' : '►'}
                                </button>
                              </div>
                            </div>

                            {/* Expanded Content */}
                            {isPromptExpanded && (
                              <div className="border-t border-gray-100 p-6 animate-fade-in">
                                {/* Edit Mode Message */}
                                {isEditing && (
                                  <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                    <p className="text-blue-800 text-sm">
                                      <strong>Creating version v{nextVersionNumber} from v{selectedVersionNumber}</strong>
                                      {' '} - Version selection disabled while editing
                                    </p>
                                  </div>
                                )}

                                {/* PROMPT CONTENT - AT THE TOP */}
                                <div className="mb-6">
                                  <h4 className="font-medium text-gray-900 mb-3 text-sm uppercase tracking-wide text-gray-500">
                                    Prompt Content
                                  </h4>
                                  {isEditing ? (
                                    <div className="space-y-4">
                                      <textarea
                                        value={editedContent}
                                        onChange={(e) => setEditedContent(e.target.value)}
                                        className="w-full h-48 p-4 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                        placeholder="Enter your prompt content here..."
                                      />
                                      {/* Format Button during Editing */}
                                      <div className="flex justify-end">
                                        <button
                                          onClick={() => formatPromptWithAI(prompt.prompt_id, editedContent)}
                                          disabled={isFormatting || !editedContent.trim()}
                                          className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                        >
                                          {isFormatting ? (
                                            <>
                                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                              <span>Formatting...</span>
                                            </>
                                          ) : (
                                            <>
                                              <span>✨</span>
                                              <span>Format with AI</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Clean prompt content display */
                                    <div className="p-4">
                                      <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
                                        {selectedVersion?.prompt_text || prompt.prompt_text}
                                      </pre>
                                    </div>
                                  )}
                                </div>

                                {/* Version and Actions - AT THE BOTTOM */}
                                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                  <div className="flex items-center space-x-4">
                                    <label className="text-sm font-medium text-gray-700">Select Version:</label>
                                    <select 
                                      value={selectedVersionId || ''}
                                      onChange={(e) => handleVersionSelect(prompt.prompt_id, e.target.value)}
                                      className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                                      disabled={versions.length === 0 || isEditing}
                                    >
                                      {versions.length === 0 ? (
                                        <option className="text-gray-900">Loading versions...</option>
                                      ) : (
                                        versions.map(version => (
                                          <option 
                                            key={version.version_id} 
                                            value={version.version_id}
                                            className="text-gray-900"
                                          >
                                            v{version.version_number} - {formatDate(version.created_at)}
                                            {version.is_active && ' (Active)'}
                                          </option>
                                        ))
                                      )}
                                    </select>
                                  </div>
                                  
                                  {/* Contextual Action Buttons */}
                                  <div className="flex space-x-3">
                                    {!isEditing && (
                                      <>
                                        <button 
                                          onClick={() => handleCopyPrompt(prompt, selectedVersion?.prompt_text)}
                                          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-all duration-200 hover:scale-105"
                                        >
                                          <span>📋</span>
                                          <span>Copy</span>
                                        </button>
                                        
                                        <button 
                                          onClick={() => startEditing(prompt.prompt_id, selectedVersion?.prompt_text || prompt.prompt_text)}
                                          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-all duration-200 hover:scale-105"
                                        >
                                          <span>✏️</span>
                                          <span>Edit</span>
                                        </button>
                                      </>
                                    )}
                                    
                                    {isEditing && (
                                      <>
                                        <button
                                          onClick={() => saveEditedPrompt(prompt)}
                                          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-all duration-200 hover:scale-105"
                                        >
                                          <span>💾</span>
                                          <span>Save</span>
                                        </button>
                                        
                                        <button
                                          onClick={cancelEditing}
                                          className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300 transition-all duration-200"
                                        >
                                          <span>↩️</span>
                                          <span>Cancel</span>
                                        </button>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
