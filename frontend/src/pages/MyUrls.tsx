import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { urlApi } from '../api/urlApi';
import type { UrlResponse } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { LinkIcon, Search, MoreVertical, Copy, BarChart2, QrCode, Trash2, Edit2, Ban, ExternalLink, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyUrls() {
  const navigate = useNavigate();
  const [urls, setUrls] = useState<UrlResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'clicks_high' | 'clicks_low'>('newest');

  // Bulk state
  const [selectedUrls, setSelectedUrls] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const data = await urlApi.getMyUrls();
      setUrls(data);
    } catch (error) {
      // Handled by interceptor
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl);
    toast.success('Copied to clipboard!');
  };

  const deleteUrl = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this link? This action cannot be undone.')) return;
    
    try {
      await urlApi.deleteUrl(id);
      setUrls(urls.filter(url => url.id !== id));
      toast.success('URL deleted successfully');
    } catch (error) {
      // Handled by interceptor
    }
  };

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedUrls);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedUrls(newSelection);
  };

  const selectAll = () => {
    if (selectedUrls.size === filteredUrls.length) {
      setSelectedUrls(new Set());
    } else {
      setSelectedUrls(new Set(filteredUrls.map(u => u.id)));
    }
  };

  // Filter & Sort Logic
  const filteredUrls = urls
    .filter(url => {
      if (filterStatus === 'active') return url.active;
      if (filterStatus === 'disabled') return !url.active;
      return true;
    })
    .filter(url => 
      url.originalUrl.toLowerCase().includes(searchQuery.toLowerCase()) || 
      url.shortCode.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'oldest': return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'clicks_high': return b.clickCount - a.clickCount;
        case 'clicks_low': return a.clickCount - b.clickCount;
        case 'newest':
        default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Links</h1>
          <p className="text-muted-foreground mt-1">Manage and track your shortened URLs.</p>
        </div>
        <Button onClick={() => navigate('/urls/new')}>
          <LinkIcon className="mr-2 h-4 w-4" /> Create New Link
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="w-full md:w-96 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input 
            placeholder="Search original URL or alias..." 
            className="pl-9 h-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="disabled">Disabled Only</option>
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="clicks_high">Most Clicks</option>
            <option value="clicks_low">Least Clicks</option>
          </select>
        </div>
      </div>

      {/* Bulk Actions (Visible only when items selected) */}
      {selectedUrls.size > 0 && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-center justify-between animate-in slide-in-from-top-2">
          <span className="text-sm font-medium text-primary">{selectedUrls.size} links selected</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => toast.error('Bulk disable requires backend API support')} className="h-8 text-xs">
              Disable
            </Button>
            <Button variant="danger" size="sm" onClick={() => toast.error('Bulk delete requires backend API support')} className="h-8 text-xs">
              Delete
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Loading your links...</div>
        ) : filteredUrls.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            No links found. {searchQuery ? 'Try adjusting your search.' : 'Create your first link!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="p-4 w-12">
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-ring"
                      checked={selectedUrls.size > 0 && selectedUrls.size === filteredUrls.length}
                      onChange={selectAll}
                    />
                  </th>
                  <th className="p-4 font-medium text-muted-foreground text-sm">Short Link</th>
                  <th className="p-4 font-medium text-muted-foreground text-sm hidden sm:table-cell">Original URL</th>
                  <th className="p-4 font-medium text-muted-foreground text-sm">Clicks</th>
                  <th className="p-4 font-medium text-muted-foreground text-sm hidden md:table-cell">Created</th>
                  <th className="p-4 font-medium text-muted-foreground text-sm">Status</th>
                  <th className="p-4 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUrls.map(url => (
                  <tr key={url.id} className="hover:bg-muted/30 transition-colors group">
                    <td className="p-4">
                      <input 
                        type="checkbox" 
                        className="rounded border-input text-primary focus:ring-ring"
                        checked={selectedUrls.has(url.id)}
                        onChange={() => toggleSelection(url.id)}
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                          /{url.shortCode}
                        </a>
                        <button onClick={() => copyToClipboard(url.shortUrl)} className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity" title="Copy">
                          <Copy size={14} />
                        </button>
                      </div>
                    </td>
                    <td className="p-4 hidden sm:table-cell max-w-[200px] lg:max-w-[400px]">
                      <div className="truncate text-sm text-muted-foreground" title={url.originalUrl}>
                        {url.originalUrl}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-foreground">{url.clickCount.toLocaleString()}</td>
                    <td className="p-4 hidden md:table-cell text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {new Date(url.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      {url.active ? <Badge variant="success">Active</Badge> : <Badge variant="destructive">Disabled</Badge>}
                    </td>
                    <td className="p-4 text-right">
                      {/* Using a native HTML details/summary as a simple popover menu without external libs */}
                      <details className="relative inline-block text-left" style={{ cursor: 'pointer' }}>
                        <summary className="list-none p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
                          <MoreVertical size={18} />
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-border focus:outline-none overflow-hidden">
                          <div className="py-1">
                            <button onClick={() => copyToClipboard(url.shortUrl)} className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <Copy size={16} /> Copy
                            </button>
                            <button onClick={() => navigate(`/urls/${url.id}/analytics`)} className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <BarChart2 size={16} /> Analytics
                            </button>
                            <button onClick={() => navigate(`/urls/${url.id}/qr`)} className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <QrCode size={16} /> QR Code
                            </button>
                            <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <ExternalLink size={16} /> Open
                            </a>
                            <div className="h-px bg-border my-1"></div>
                            <button onClick={() => toast.error('Edit URL feature requires backend API support')} className="w-full text-left px-4 py-2 text-sm hover:bg-accent flex items-center gap-2">
                              <Edit2 size={16} /> Edit
                            </button>
                            <button onClick={() => toast.error('Disable URL feature requires backend API support')} className="w-full text-left px-4 py-2 text-sm text-amber-600 hover:bg-accent flex items-center gap-2">
                              <Ban size={16} /> Disable
                            </button>
                            <button onClick={() => deleteUrl(url.id)} className="w-full text-left px-4 py-2 text-sm text-destructive hover:bg-accent flex items-center gap-2">
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>
                      </details>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
