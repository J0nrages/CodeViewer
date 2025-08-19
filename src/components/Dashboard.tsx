import React from 'react';
import { BarChart3, FileText, Folder, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { mockProjects, mockQualityMetrics } from '../lib/mockData';

export function Dashboard() {
  const totalProjects = mockProjects.length;
  const avgQualityScore = Math.round(mockProjects.reduce((sum, p) => sum + p.qualityScore, 0) / totalProjects);
  const totalFiles = mockProjects.reduce((sum, p) => sum + p.files, 0);
  const totalLOC = mockProjects.reduce((sum, p) => sum + p.linesOfCode, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your codebase analysis and quality metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-gray-900">{totalProjects}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Folder className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Quality Score</p>
              <p className="text-3xl font-bold text-gray-900">{avgQualityScore}%</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Files</p>
              <p className="text-3xl font-bold text-gray-900">{totalFiles.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lines of Code</p>
              <p className="text-3xl font-bold text-gray-900">{(totalLOC / 1000).toFixed(0)}K</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Clock className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Projects List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {mockProjects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-600">{project.description}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>{project.language}</span>
                      <span>{project.files} files</span>
                      <span>{(project.linesOfCode / 1000).toFixed(1)}K LOC</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.qualityScore >= 90 ? 'bg-green-100 text-green-800' :
                      project.qualityScore >= 80 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.qualityScore}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quality Metrics */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quality Metrics</h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              {mockQualityMetrics.map((metric, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {metric.status === 'good' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {metric.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                      {metric.status === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      <span className="font-medium text-gray-900">{metric.name}</span>
                    </div>
                    <span className="text-sm text-gray-600">{metric.value}{metric.max === 100 ? '%' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'good' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${(metric.value / metric.max) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{metric.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}