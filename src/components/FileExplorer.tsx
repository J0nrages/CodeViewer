import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search, List, Grid, Filter, GitBranch, AlertTriangle, CheckCircle, Clock, BarChart3, Play, Trash2, Download, Copy, Settings, CheckSquare, Square } from 'lucide-react';
import { mockFileTree, mockFileAnalysis, mockGitInfo } from '../lib/mockData';
import { FileNode, FileAnalysis, GitInfo, BulkAction, SearchFilter } from '../types';

export function FileExplorer() {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [viewMode, setViewMode] = useState<'tree' | 'table'>('tree');
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'modified' | 'issues'>('all');
  const [searchField, setSearchField] = useState<'name' | 'path' | 'extension' | 'language' | 'content' | 'author' | 'tags'>('name');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [groupByDirectory, setGroupByDirectory] = useState(true);

  const searchFilters: SearchFilter[] = [
    { field: 'name', label: 'File Name', placeholder: 'Search by file name...' },
    { field: 'path', label: 'File Path', placeholder: 'Search by file path...' },
    { field: 'extension', label: 'Extension', placeholder: 'Search by extension...' },
    { field: 'language', label: 'Language', placeholder: 'Search by language...' },
    { field: 'content', label: 'Content', placeholder: 'Search file contents...' },
    { field: 'author', label: 'Author', placeholder: 'Search by author...' },
    { field: 'tags', label: 'Tags', placeholder: 'Search by tags...' }
  ];

  const bulkActions: BulkAction[] = [
    {
      id: 'analyze',
      label: 'Run Analysis',
      icon: 'BarChart3',
      action: (files) => console.log('Analyzing files:', files.map(f => f.name)),
      requiresAnalysis: false
    },
    {
      id: 'download',
      label: 'Download',
      icon: 'Download',
      action: (files) => console.log('Downloading files:', files.map(f => f.name))
    },
    {
      id: 'copy-path',
      label: 'Copy Paths',
      icon: 'Copy',
      action: (files) => {
        const paths = files.map(f => f.path).join('\n');
        navigator.clipboard.writeText(paths);
      }
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: 'Trash2',
      action: (files) => console.log('Deleting files:', files.map(f => f.name)),
      dangerous: true
    }
  ];

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getFileIcon = (node: FileNode) => {
    if (node.type === 'directory') {
      return expandedNodes.has(node.id) ? FolderOpen : Folder;
    }
    return File;
  };

  const getFileColor = (extension?: string) => {
    switch (extension) {
      case 'tsx':
      case 'ts':
        return 'text-blue-600';
      case 'js':
      case 'jsx':
        return 'text-yellow-600';
      case 'css':
        return 'text-pink-600';
      case 'html':
        return 'text-orange-600';
      case 'json':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const filterNodes = (nodes: FileNode[], term: string): FileNode[] => {
    if (!term) return nodes;
    
    return nodes.filter(node => {
      let matches = false;
      const searchTerm = term.toLowerCase();
      
      switch (searchField) {
        case 'name':
          matches = node.name.toLowerCase().includes(searchTerm);
          break;
        case 'path':
          matches = node.path.toLowerCase().includes(searchTerm);
          break;
        case 'extension':
          matches = node.extension?.toLowerCase().includes(searchTerm) || false;
          break;
        case 'language':
          matches = node.language?.toLowerCase().includes(searchTerm) || false;
          break;
        case 'content':
          // In real implementation, this would search file contents
          matches = node.name.toLowerCase().includes(searchTerm);
          break;
        case 'author':
          // In real implementation, this would search git author
          const gitInfo = getGitInfo(node.id);
          matches = gitInfo?.author.toLowerCase().includes(searchTerm) || false;
          break;
        case 'tags':
          matches = node.tags?.some(tag => tag.toLowerCase().includes(searchTerm)) || false;
          break;
        default:
          matches = node.name.toLowerCase().includes(searchTerm);
      }
      
      const hasMatchingChildren = node.children && filterNodes(node.children, term).length > 0;
      return matches || hasMatchingChildren;
    }).map(node => ({
      ...node,
      children: node.children ? filterNodes(node.children, term) : undefined
    }));
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const Icon = getFileIcon(node);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.id}>
        <div
          className={`flex items-center space-x-2 py-1 px-2 hover:bg-gray-100 cursor-pointer rounded ${
            selectedFile?.id === node.id ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
          }`}
          style={{ paddingLeft: `${depth * 20 + 8}px` }}
          onClick={() => {
            if (node.type === 'directory') {
              toggleNode(node.id);
            } else {
              setSelectedFile(node);
            }
          }}
        >
          {hasChildren && (
            <button className="p-0.5 hover:bg-gray-200 rounded">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-5" />}
          
          <Icon className={`w-4 h-4 ${node.type === 'directory' ? 'text-blue-500' : getFileColor(node.extension)}`} />
          <span className="text-sm text-gray-900 flex-1">{node.name}</span>
          
          {node.type === 'file' && node.size && (
            <span className="text-xs text-gray-500">{formatFileSize(node.size)}</span>
          )}
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const filteredTree = filterNodes(mockFileTree, searchTerm);

  const flattenNodes = (nodes: FileNode[]): FileNode[] => {
    const result: FileNode[] = [];
    const traverse = (nodeList: FileNode[]) => {
      nodeList.forEach(node => {
        if (node.type === 'file') {
          result.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return result;
  };

  const flatFiles = flattenNodes(filteredTree);
  const filteredFiles = flatFiles.filter(file => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'modified') {
      const gitInfo = mockGitInfo[file.id];
      return gitInfo && gitInfo.status !== 'clean';
    }
    if (filterStatus === 'issues') {
      const analysis = mockFileAnalysis.find(a => a.fileId === file.id);
      return analysis && analysis.issues.length > 0;
    }
    return true;
  });

  const groupFilesByDirectory = (files: FileNode[]) => {
    const grouped: { [directory: string]: FileNode[] } = {};
    
    files.forEach(file => {
      const directory = file.path.substring(0, file.path.lastIndexOf('/')) || '/';
      if (!grouped[directory]) {
        grouped[directory] = [];
      }
      grouped[directory].push(file);
    });
    
    return grouped;
  };

  const toggleFileSelection = (fileId: string) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const toggleAllFiles = (files: FileNode[]) => {
    const fileIds = files.map(f => f.id);
    const allSelected = fileIds.every(id => selectedFiles.has(id));
    
    const newSelected = new Set(selectedFiles);
    if (allSelected) {
      fileIds.forEach(id => newSelected.delete(id));
    } else {
      fileIds.forEach(id => newSelected.add(id));
    }
    setSelectedFiles(newSelected);
  };

  const executeBulkAction = (actionId: string) => {
    const action = bulkActions.find(a => a.id === actionId);
    if (!action) return;
    
    const selectedFileNodes = flatFiles.filter(f => selectedFiles.has(f.id));
    action.action(selectedFileNodes);
    
    // Clear selection after action
    setSelectedFiles(new Set());
  };

  const getAnalysis = (fileId: string): FileAnalysis | undefined => {
    return mockFileAnalysis.find(a => a.fileId === fileId);
  };

  const getGitInfo = (fileId: string): GitInfo | undefined => {
    return mockGitInfo[fileId];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'modified': return 'text-orange-600';
      case 'staged': return 'text-green-600';
      case 'untracked': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">File Explorer</h1>
        <p className="text-gray-600 mt-2">Browse and explore your project structure</p>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-500" />
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {searchFilters.map(filter => (
                  <option key={filter.field} value={filter.field}>
                    {filter.label}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder={searchFilters.find(f => f.field === searchField)?.placeholder || 'Search...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 min-w-[200px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">All Files</option>
                <option value="modified">Modified</option>
                <option value="issues">With Issues</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="flex items-center space-x-2 text-sm">
              <input
                type="checkbox"
                checked={showAnalysis}
                onChange={(e) => setShowAnalysis(e.target.checked)}
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>Show Analysis</span>
            </label>
            
            {viewMode === 'table' && (
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={groupByDirectory}
                  onChange={(e) => setGroupByDirectory(e.target.checked)}
                  className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Group by Directory</span>
              </label>
            )}
            
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                onClick={() => setViewMode('tree')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'tree' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1 text-sm ${
                  viewMode === 'table' 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      {selectedFiles.size > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-indigo-900">
              {selectedFiles.size} file{selectedFiles.size !== 1 ? 's' : ''} selected
            </span>
            <div className="flex items-center space-x-2">
              {bulkActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => executeBulkAction(action.id)}
                  className={`px-3 py-1 text-sm rounded ${action.dangerous ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-white text-gray-700 hover:bg-gray-100'} border`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {viewMode === 'tree' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* File Tree */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Project Structure</h3>
            </div>
            
            <div className="p-2 max-h-96 overflow-y-auto">
              {filteredTree.map(node => renderNode(node))}
            </div>
          </div>
        </div>

        {/* File Details */}
        <div className="lg:col-span-2">
          {selectedFile ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <File className={`w-6 h-6 ${getFileColor(selectedFile.extension)}`} />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedFile.name}</h2>
                    <p className="text-sm text-gray-600">{selectedFile.path}</p>
                  </div>
                  {getGitInfo(selectedFile.id) && (
                    <div className="flex items-center space-x-2">
                      <GitBranch className="w-4 h-4 text-gray-500" />
                      <span className={`text-sm ${getStatusColor(getGitInfo(selectedFile.id)!.status)}`}>
                        {getGitInfo(selectedFile.id)!.status}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">File Information</h3>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Size:</dt>
                        <dd className="text-sm text-gray-900">{formatFileSize(selectedFile.size)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Extension:</dt>
                        <dd className="text-sm text-gray-900">{selectedFile.extension || 'None'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Language:</dt>
                        <dd className="text-sm text-gray-900">{selectedFile.language || 'Unknown'}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-sm text-gray-600">Last Modified:</dt>
                        <dd className="text-sm text-gray-900">
                          {new Date(selectedFile.lastModified).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </div>
                  
                  {showAnalysis && getAnalysis(selectedFile.id) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Code Analysis</h3>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Complexity:</dt>
                          <dd className="text-sm text-gray-900">{getAnalysis(selectedFile.id)!.complexity}/10</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Maintainability:</dt>
                          <dd className="text-sm text-gray-900">{getAnalysis(selectedFile.id)!.maintainability}%</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Test Coverage:</dt>
                          <dd className="text-sm text-gray-900">{getAnalysis(selectedFile.id)!.testCoverage}%</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-600">Issues:</dt>
                          <dd className="text-sm text-gray-900">{getAnalysis(selectedFile.id)!.issues.length}</dd>
                        </div>
                      </dl>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Quick Actions</h3>
                    <div className="space-y-2">
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        View Content
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        Run Analysis
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        View Dependencies
                      </button>
                      <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                        Show History
                      </button>
                    </div>
                  </div>
                </div>
                
                {showAnalysis && getAnalysis(selectedFile.id) && getAnalysis(selectedFile.id)!.issues.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Code Issues</h3>
                    <div className="space-y-2">
                      {getAnalysis(selectedFile.id)!.issues.map((issue) => (
                        <div key={issue.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                          <div className="flex-shrink-0">
                            {issue.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {issue.type === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                            {issue.type === 'info' && <CheckCircle className="w-4 h-4 text-blue-500" />}
                          </div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{issue.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Line {issue.line}:{issue.column} • {issue.rule}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">File Preview</h3>
                  <div className="bg-white rounded border p-4 font-mono text-sm text-gray-600">
                    <p>// File content preview would appear here</p>
                    <p>// This would show the actual file contents</p>
                    <p>// with syntax highlighting based on the file type</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <Folder className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a file</h3>
              <p className="text-gray-600">Choose a file from the tree to view its details and content</p>
            </div>
          )}
        </div>
        </div>
      ) : (
        /* Table View */
        <div className="space-y-6">
          {groupByDirectory ? (
            // Directory-grouped view
            Object.entries(groupFilesByDirectory(filteredFiles)).map(([directory, files]) => (
              <div key={directory} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Folder className="w-4 h-4 text-blue-500" />
                      <span className="font-medium text-gray-900">{directory}</span>
                      <span className="text-sm text-gray-500">({files.length} files)</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => toggleAllFiles(files)}
                        className="text-sm text-indigo-600 hover:text-indigo-800"
                      >
                        {files.every(f => selectedFiles.has(f.id)) ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleAllFiles(files)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {files.every(f => selectedFiles.has(f.id)) ? 
                                <CheckSquare className="w-4 h-4" /> : 
                                <Square className="w-4 h-4" />
                              }
                            </button>
                            <span>File</span>
                          </div>
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Size
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Modified
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        {showAnalysis && (
                          <>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Complexity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Issues
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Coverage
                            </th>
                          </>
                        )}
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {files.map((file) => {
                        const analysis = getAnalysis(file.id);
                        const gitInfo = getGitInfo(file.id);
                        const isSelected = selectedFiles.has(file.id);
                        
                        return (
                          <tr
                            key={file.id}
                            className={`hover:bg-gray-50 ${
                              selectedFile?.id === file.id ? 'bg-indigo-50' : ''
                            } ${isSelected ? 'bg-blue-50' : ''}`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFileSelection(file.id);
                                  }}
                                  className="mr-3 text-gray-400 hover:text-gray-600"
                                >
                                  {isSelected ? 
                                    <CheckSquare className="w-4 h-4 text-indigo-600" /> : 
                                    <Square className="w-4 h-4" />
                                  }
                                </button>
                                <File className={`w-4 h-4 mr-3 ${getFileColor(file.extension)}`} />
                                <div
                                  onClick={() => setSelectedFile(file)}
                                  className="cursor-pointer"
                                >
                                  <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                  <div className="text-sm text-gray-500">{file.extension?.toUpperCase()} • {file.language}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatFileSize(file.size)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(file.lastModified).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {gitInfo ? (
                                <div className="flex items-center space-x-2">
                                  <GitBranch className="w-3 h-3 text-gray-400" />
                                  <span className={`text-sm ${getStatusColor(gitInfo.status)}`}>
                                    {gitInfo.status}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            {showAnalysis && (
                              <>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {analysis ? (
                                    <div className="flex items-center">
                                      <BarChart3 className="w-3 h-3 mr-1 text-gray-400" />
                                      <span className={`text-sm ${
                                        analysis.complexity > 7 ? 'text-red-600' :
                                        analysis.complexity > 5 ? 'text-yellow-600' :
                                        'text-green-600'
                                      }`}>
                                        {analysis.complexity.toFixed(1)}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {analysis ? (
                                    <div className="flex items-center">
                                      {analysis.issues.length > 0 ? (
                                        <>
                                          <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                                          <span className="text-sm text-yellow-600">{analysis.issues.length}</span>
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                          <span className="text-sm text-green-600">0</span>
                                        </>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {analysis ? (
                                    <div className="flex items-center">
                                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                        <div
                                          className={`h-2 rounded-full ${
                                            analysis.testCoverage >= 80 ? 'bg-green-500' :
                                            analysis.testCoverage >= 60 ? 'bg-yellow-500' :
                                            'bg-red-500'
                                          }`}
                                          style={{ width: `${analysis.testCoverage}%` }}
                                        />
                                      </div>
                                      <span className="text-sm text-gray-900">{analysis.testCoverage}%</span>
                                    </div>
                                  ) : (
                                    <span className="text-sm text-gray-400">-</span>
                                  )}
                                </td>
                              </>
                            )}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => console.log('Analyze file:', file.name)}
                                  className="text-indigo-600 hover:text-indigo-800"
                                  title="Run Analysis"
                                >
                                  <Play className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => console.log('Download file:', file.name)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Download"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => console.log('File settings:', file.name)}
                                  className="text-gray-600 hover:text-gray-800"
                                  title="Settings"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          ) : (
            // Flat table view
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleAllFiles(filteredFiles)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {filteredFiles.every(f => selectedFiles.has(f.id)) ? 
                              <CheckSquare className="w-4 h-4" /> : 
                              <Square className="w-4 h-4" />
                            }
                          </button>
                          <span>File</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Modified
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      {showAnalysis && (
                        <>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Complexity
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Issues
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Coverage
                          </th>
                        </>
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredFiles.map((file) => {
                      const analysis = getAnalysis(file.id);
                      const gitInfo = getGitInfo(file.id);
                      const isSelected = selectedFiles.has(file.id);
                      
                      return (
                        <tr
                          key={file.id}
                          className={`hover:bg-gray-50 ${
                            selectedFile?.id === file.id ? 'bg-indigo-50' : ''
                          } ${isSelected ? 'bg-blue-50' : ''}`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleFileSelection(file.id);
                                }}
                                className="mr-3 text-gray-400 hover:text-gray-600"
                              >
                                {isSelected ? 
                                  <CheckSquare className="w-4 h-4 text-indigo-600" /> : 
                                  <Square className="w-4 h-4" />
                                }
                              </button>
                              <File className={`w-4 h-4 mr-3 ${getFileColor(file.extension)}`} />
                              <div
                                onClick={() => setSelectedFile(file)}
                                className="cursor-pointer"
                              >
                                <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                <div className="text-sm text-gray-500">{file.path}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatFileSize(file.size)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {new Date(file.lastModified).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {gitInfo ? (
                              <div className="flex items-center space-x-2">
                                <GitBranch className="w-3 h-3 text-gray-400" />
                                <span className={`text-sm ${getStatusColor(gitInfo.status)}`}>
                                  {gitInfo.status}
                                </span>
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </td>
                          {showAnalysis && (
                            <>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {analysis ? (
                                  <div className="flex items-center">
                                    <BarChart3 className="w-3 h-3 mr-1 text-gray-400" />
                                    <span className={`text-sm ${
                                      analysis.complexity > 7 ? 'text-red-600' :
                                      analysis.complexity > 5 ? 'text-yellow-600' :
                                      'text-green-600'
                                    }`}>
                                      {analysis.complexity.toFixed(1)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {analysis ? (
                                  <div className="flex items-center">
                                    {analysis.issues.length > 0 ? (
                                      <>
                                        <AlertTriangle className="w-3 h-3 mr-1 text-yellow-500" />
                                        <span className="text-sm text-yellow-600">{analysis.issues.length}</span>
                                      </>
                                    ) : (
                                      <>
                                        <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
                                        <span className="text-sm text-green-600">0</span>
                                      </>
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {analysis ? (
                                  <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          analysis.testCoverage >= 80 ? 'bg-green-500' :
                                          analysis.testCoverage >= 60 ? 'bg-yellow-500' :
                                          'bg-red-500'
                                        }`}
                                        style={{ width: `${analysis.testCoverage}%` }}
                                      />
                                    </div>
                                    <span className="text-sm text-gray-900">{analysis.testCoverage}%</span>
                                  </div>
                                ) : (
                                  <span className="text-sm text-gray-400">-</span>
                                )}
                              </td>
                            </>
                          )}
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => console.log('Analyze file:', file.name)}
                                className="text-indigo-600 hover:text-indigo-800"
                                title="Run Analysis"
                              >
                                <Play className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => console.log('Download file:', file.name)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Download"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => console.log('File settings:', file.name)}
                                className="text-gray-600 hover:text-gray-800"
                                title="Settings"
                              >
                                <Settings className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {filteredFiles.length === 0 && (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                  <p className="text-gray-600">Try adjusting your search terms or filters</p>
                </div>
              )}
            </div>
          )}
          
          {filteredFiles.length === 0 && groupByDirectory && (
            <div className="text-center py-12">
              <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
              <p className="text-gray-600">Try adjusting your search terms or filters</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}