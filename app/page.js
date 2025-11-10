'use client';

import { useState, useEffect } from 'react';

export default function PromptsPage() {
  const [prompts, setPrompts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [allVersions, setAllVersions] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [versionsLoading, setVersionsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Check if the currently selected version is the active one
  const isActiveVersion = selectedVersion && selectedPrompt && 
    selectedVersion.version_id === selectedPrompt.active_version_id;

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://promptdbservice.onrender.com/api/db/getCategories');
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        const data = await response.json();
        setCategories(['all', ...data]); // Add 'all' as first category
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch prompts based on selected category
  const fetchPromptsByCategory = async (category = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = category === 'all' 
        ? 'https://promptdbservice.onrender.com/api/db/getPrompts'
        : `https://promptdbservice.onrender.com/api/db/getPromptsByCategory/${encodeURIComponent(category)}`;
      
      const response = await fetch(url);
      if(!response.ok) {
        throw new Error(`Failed to fetch prompts: ${response.status}`);
      }
      const data = await response.json();
      setPrompts(data);
      
      if(data.length > 0){
        setSelectedPrompt(data[0]);
        // Load versions for the first prompt
        await fetchPromptVersions(data[0].prompt_id, data[0]);
      } else {
        setSelectedPrompt(null);
        setSelectedVersion(null);
      }
    } catch (err) {
      console.error('Error fetching prompts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when category changes
  useEffect(() => {
    fetchPromptsByCategory(selectedCategory);
  }, [selectedCategory]);

  const fetchPromptVersions = async (promptId, promptObj = null) => {
    try {
      setVersionsLoading(true);
      const response = await fetch(`https://promptdbservice.onrender.com/api/db/getPromptVersions/${promptId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch versions');
      }
      const versions = await response.json();
      setAllVersions(versions);
      
      // Use the passed promptObj, or fallback to selectedPrompt
      const currentPrompt = promptObj || selectedPrompt;
      
      if (!currentPrompt) {
        console.error('No current prompt found');
        return;
      }

      // Find the ACTIVE version
      const activeVersion = versions.find(v => v.version_id === currentPrompt.active_version_id);
      
      console.log('fetchPromptVersions - Active version:', {
        lookingFor: currentPrompt.active_version_id,
        found: activeVersion ? `v${activeVersion.version_number}` : 'NOT FOUND',
        totalVersions: versions.length
      });

      if (activeVersion) {
        setSelectedVersion(activeVersion);
        setEditedContent(activeVersion.prompt_text);
        console.log('Set selected version to active version:', activeVersion.version_number);
      } else if (versions.length > 0) {
        // Fallback to latest version
        const latestVersion = versions[0]; // Assuming versions are sorted by version_number desc
        setSelectedVersion(latestVersion);
        setEditedContent(latestVersion.prompt_text);
        console.log('No active version found, using latest:', latestVersion.version_number);
      }
    } catch (err) {
      console.error('Error fetching versions:', err);
    } finally {
      setVersionsLoading(false);
    }
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      return;
    }
    setSelectedCategory(category);
    setSelectedPrompt(null);
    setSelectedVersion(null);
    setIsEditing(false);
  };

  const handlePromptSelect = async (prompt) => {
    setSelectedPrompt(prompt);
    setIsEditing(false);
    // Load versions for the selected prompt
    await fetchPromptVersions(prompt.prompt_id, prompt);
  };

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    setEditedContent(version.prompt_text);
    setIsEditing(false);
  };

  const handleEditToggle = () => {
    if (!isActiveVersion) {
      alert('You can only edit the active version. Please set this version as active first.');
      return;
    }
    setIsEditing(!isEditing);
  };

  const handleCopyPrompt = async () => {
    if (!selectedPrompt || !selectedVersion) {
      alert('No prompt selected or version information missing.');
      return;
    }

    const promptText = `Category: ${selectedPrompt.category || 'general'} \nTitle: ${selectedPrompt.title} \nDescription: ${selectedPrompt.description} \nQuery: ${selectedVersion.prompt_text}`.trim();

    try {
      await navigator.clipboard.writeText(promptText);
      alert('Prompt details copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = promptText;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        alert('Prompt details copied to clipboard!');
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
        alert('Failed to copy prompt details. Please copy manually.');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);
      
      // Save new version to database
      const response = await fetch(`https://promptdbservice.onrender.com/api/db/updatePrompt/${selectedPrompt.prompt_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_text: editedContent,
          title: selectedPrompt.title,
          description: selectedPrompt.description,
          metadata: {
            topic: selectedPrompt.title,
            category: selectedPrompt.category || 'general',
            tags: [],
            based_on_version: selectedVersion.version_number
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save new version to database');
      }

      const result = await response.json();
      console.log('New version saved to database:', result);
      
      // Refresh the current category view
      await fetchPromptsByCategory(selectedCategory);
      
    } catch (error) {
      console.error('Error saving new version to database:', error);
      alert('Failed to save changes. Please try again.');
      setIsEditing(true);
    }
  };

  const handleSetActiveVersion = async (version) => {
    try {
      const response = await fetch(`https://promptdbservice.onrender.com/api/db/setActiveVersion`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt_id: selectedPrompt.prompt_id,
          version_id: version.version_id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to set active version');
      }

      const result = await response.json();
      
      // Update the selectedPrompt with the new active_version_id immediately
      const updatedSelectedPrompt = {
        ...selectedPrompt,
        active_version_id: version.version_id
      };
      setSelectedPrompt(updatedSelectedPrompt);
      
      // Update the selectedVersion to be the newly activated version
      setSelectedVersion(version);
      setEditedContent(version.prompt_text);
      
      // Update the prompts list to reflect the change in left panel
      const updatedPrompts = prompts.map(prompt => 
        prompt.prompt_id === selectedPrompt.prompt_id 
          ? { ...prompt, active_version_id: version.version_id }
          : prompt
      );
      setPrompts(updatedPrompts);
      
      alert(`Version ${version.version_number} is now active! You can now edit this version.`);
      
    } catch (error) {
      console.error('Error setting active version:', error);
      alert('Failed to set active version. Please try again.');
    }
  };
  
  const handleCancel = () => {
    setEditedContent(selectedVersion.prompt_text);
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading prompts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="flex flex-col md:flex-row h-[600px]">
          {/* Categories Column - First Column */}
          <div className="w-full md:w-1/4 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold text-gray-900">Categories</h2>
            </div>
            <div className="p-2 space-y-1">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedCategory === category
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <span className="font-medium capitalize">
                    {category === 'all' ? 'All Prompts' : category}
                  </span>
                  {selectedCategory === category && (
                    <span className="ml-2 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Prompts Column - Second Column */}
          <div className="w-full md:w-1/3 border-r bg-gray-50 overflow-y-auto">
            <div className="p-4 border-b bg-white">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedCategory === 'all' ? 'All Prompts' : `${selectedCategory} Prompts`}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            <div className="p-2 space-y-2">
              {prompts.map((prompt) => (
                <button
                  key={prompt.prompt_id}
                  onClick={() => handlePromptSelect(prompt)}
                  className={`w-full text-left p-4 rounded-lg transition-colors border ${
                    selectedPrompt?.prompt_id === prompt.prompt_id
                      ? 'bg-blue-50 border-blue-200 shadow-sm'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <h3 className="font-medium text-gray-900 mb-1">
                    {prompt.title}
                    {prompt.version_number && (
                      <span className={`ml-2 text-xs px-2 py-1 rounded ${
                        prompt.active_version_id === prompt.version_id 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        v{prompt.version_number} {prompt.active_version_id === prompt.version_id && '✓'}
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                    {prompt.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <span>{formatDate(prompt.created_at)}</span>
                    {prompt.category && prompt.category !== 'all' && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded capitalize">
                        {prompt.category}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Content Display - Third Column */}
          <div className="w-full md:w-3/4 flex flex-col">
            {selectedPrompt ? (
              <>
                {/* Content Header */}
                <div className="p-6 border-b bg-white">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {selectedPrompt.title}
                      </h2>
                      
                      {/* Version Selector */}
                      <div className="flex items-center gap-4 mb-2">
                        <label className="text-sm font-medium text-gray-700">Version:</label>
                        <select 
                          value={selectedVersion?.version_id || ''}
                          onChange={(e) => {
                            const version = allVersions.find(v => v.version_id === e.target.value);
                            if (version) handleVersionSelect(version);
                          }}
                          className="text-sm border border-gray-300 rounded px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" 
                          disabled={versionsLoading}
                        >
                          {versionsLoading ? (
                            <option>Loading versions...</option>
                          ) : (
                            allVersions.map(version => (
                              <option key={version.version_id} value={version.version_id}>
                                v{version.version_number} - {formatDate(version.created_at)}
                                {version.version_id === selectedPrompt.active_version_id && ' (Active)'}
                              </option>
                            ))
                          )}
                        </select>
                        
                        {selectedVersion && selectedVersion.version_id !== selectedPrompt.active_version_id && (
                          <button
                            onClick={() => handleSetActiveVersion(selectedVersion)}
                            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded transition-colors"
                          >
                            Set Active
                          </button>
                        )}
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        Created: {formatDate(selectedPrompt.created_at)}
                        {selectedPrompt.updated_at !== selectedPrompt.created_at && (
                          <span> • Updated: {formatDate(selectedPrompt.updated_at)}</span>
                        )}
                        {selectedPrompt.category && (
                          <span> • Category: <span className="font-medium capitalize">{selectedPrompt.category}</span></span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Edit Restriction Message */}
                  {!isActiveVersion && (
                    <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-yellow-800 text-sm">
                        <strong>Note:</strong> You can only edit the active version. 
                        {selectedVersion && ` Set version ${selectedVersion.version_number} as active to enable editing.`}
                      </p>
                    </div>
                  )}
                </div>

                {/* Content Area */}
                <div className="flex-1 p-6 overflow-y-auto bg-white">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-yellow-800 text-sm">
                          <strong>Note:</strong> Saving will create a new version (v{allVersions.length > 0 ? Math.max(...allVersions.map(v => v.version_number)) + 1 : 1}).
                        </p>
                      </div>
                      <textarea
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        placeholder="Enter prompt content..."
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={handleSave}
                          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                          Save as New Version
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {selectedVersion && (
                        <>
                          <div className={`p-4 rounded-lg border ${
                            selectedVersion.version_id === selectedPrompt.active_version_id 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-gray-50 border-gray-200'
                          }`}>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  selectedVersion.version_id === selectedPrompt.active_version_id
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  Version {selectedVersion.version_number}
                                  {selectedVersion.version_id === selectedPrompt.active_version_id && ' (Active)'}
                                </span>
                                <span className="ml-2 text-sm text-gray-500">
                                  Created: {formatDate(selectedVersion.created_at)}
                                </span>
                              </div>
                            </div>
                            <pre className="whitespace-pre-wrap font-sans text-gray-800 text-sm md:text-base">
                              {selectedVersion.prompt_text}
                            </pre>
                          </div>
                          
                          {/* Action Buttons - Moved below prompt text */}
                          <div className="flex gap-3 justify-end">
                            <button
                              onClick={handleCopyPrompt}
                              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium flex-shrink-0"
                              title="Copy prompt details to clipboard"
                            >
                              Copy Prompt
                            </button>
                            
                            <button
                              onClick={handleEditToggle}
                              disabled={!isActiveVersion}
                              className={`px-6 py-2 rounded-lg font-medium transition-colors flex-shrink-0 ${
                                isEditing
                                  ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                  : isActiveVersion
                                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                                  : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              }`}
                            >
                              {isEditing ? 'Cancel Edit' : 'Edit Content'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📝</div>
                  <h3 className="text-lg font-medium mb-2">No Prompt Selected</h3>
                  <p>Select a prompt from the middle panel to view its content</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}