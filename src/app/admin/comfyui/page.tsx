'use client'

import { useState, useEffect } from 'react'

interface ComfyUIConfig {
  id: string
  name: string
  apiUrl: string
  apiKey?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export default function ComfyUIConfigPage() {
  const [configs, setConfigs] = useState<ComfyUIConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<ComfyUIConfig | null>(null)
  const [testingConnection, setTestingConnection] = useState<string | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/comfyui/configs')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data.configs)
      }
    } catch (error) {
      console.error('Failed to fetch configs:', error)
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async (config: ComfyUIConfig) => {
    setTestingConnection(config.id)
    try {
      const response = await fetch('/api/admin/comfyui/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ configId: config.id }),
      })
      
      const data = await response.json()
      if (data.success) {
        alert('连接测试成功！')
      } else {
        alert(`连接测试失败: ${data.error}`)
      }
    } catch (error) {
      alert('连接测试失败')
    } finally {
      setTestingConnection(null)
    }
  }

  const toggleActive = async (config: ComfyUIConfig) => {
    try {
      const response = await fetch(`/api/admin/comfyui/configs/${config.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !config.isActive }),
      })

      if (response.ok) {
        fetchConfigs()
      }
    } catch (error) {
      alert('操作失败')
    }
  }

  const deleteConfig = async (config: ComfyUIConfig) => {
    if (!confirm('确定要删除这个配置吗？')) return

    try {
      const response = await fetch(`/api/admin/comfyui/configs/${config.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchConfigs()
      }
    } catch (error) {
      alert('删除失败')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-1/3"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">ComfyUI配置</h1>
          <p className="text-gray-600 mt-2">管理ComfyUI API连接配置</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          添加配置
        </button>
      </div>

      {/* Configs List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                名称
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                API地址
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {configs.map((config) => (
              <tr key={config.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {config.name}
                      </div>
                      {config.isActive && (
                        <div className="text-xs text-green-600">当前使用</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{config.apiUrl}</div>
                  {config.apiKey && (
                    <div className="text-xs text-gray-500">已配置API密钥</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    config.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {config.isActive ? '启用' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(config.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center space-x-2 justify-end">
                    <button
                      onClick={() => testConnection(config)}
                      disabled={testingConnection === config.id}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                    >
                      {testingConnection === config.id ? '测试中...' : '测试连接'}
                    </button>
                    <button
                      onClick={() => setEditingConfig(config)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      编辑
                    </button>
                    <button
                      onClick={() => toggleActive(config)}
                      className={config.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                    >
                      {config.isActive ? '禁用' : '启用'}
                    </button>
                    <button
                      onClick={() => deleteConfig(config)}
                      className="text-red-600 hover:text-red-900"
                    >
                      删除
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {configs.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无配置</h3>
            <p className="text-gray-600 mb-6">添加第一个ComfyUI配置来开始使用</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              添加配置
            </button>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingConfig) && (
        <ConfigModal
          config={editingConfig}
          onClose={() => {
            setShowAddModal(false)
            setEditingConfig(null)
          }}
          onSuccess={() => {
            setShowAddModal(false)
            setEditingConfig(null)
            fetchConfigs()
          }}
        />
      )}
    </div>
  )
}

// Config Modal Component
function ConfigModal({ 
  config, 
  onClose, 
  onSuccess 
}: { 
  config: ComfyUIConfig | null
  onClose: () => void
  onSuccess: () => void
}) {
  const [formData, setFormData] = useState({
    name: config?.name || '',
    apiUrl: config?.apiUrl || '',
    apiKey: config?.apiKey || ''
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = config 
        ? `/api/admin/comfyui/configs/${config.id}`
        : '/api/admin/comfyui/configs'
      
      const response = await fetch(url, {
        method: config ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        onSuccess()
      } else {
        const data = await response.json()
        alert(data.error || '操作失败')
      }
    } catch (error) {
      alert('操作失败')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">
          {config ? '编辑配置' : '添加配置'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              配置名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="例如：默认ComfyUI"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API地址
            </label>
            <input
              type="url"
              value={formData.apiUrl}
              onChange={(e) => setFormData({ ...formData, apiUrl: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="http://127.0.0.1:8188"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API密钥（可选）
            </label>
            <input
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="如果需要认证请填写"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? '保存中...' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

