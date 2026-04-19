'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../src/hooks/useAuth';
import { FileText, Lock, ExternalLink, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import IconBreadcrumbs from '../../src/components/IconBreadcrumbs';

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink: string;
  modifiedTime: string;
  size?: string;
}

export default function Resources() {
  const { isAuthenticated, signInWithGoogle } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [authRequired, setAuthRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchFiles();
  }, []);

  useEffect(() => {
    if (isAuthenticated && authRequired) {
      void fetchFiles();
    }
  }, [authRequired, isAuthenticated]);

  const fetchFiles = async () => {
    setFilesLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/drive/files');
      const contentType = res.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');
      const data = isJson ? await res.json() : null;

      if (!res.ok) {
        if (res.status === 401) {
          setAuthRequired(true);
          setFiles([]);
          return;
        }

        throw new Error((data && data.error) || `Drive API returned ${res.status}`);
      }

      if (!data) {
        throw new Error('Drive API returned a non-JSON response');
      }

      setAuthRequired(false);
      setFiles(data.files || []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching files');
    } finally {
      setFilesLoading(false);
    }
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return '--';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '--';
    if (num < 1024) return num + ' B';
    else if (num < 1048576) return (num / 1024).toFixed(1) + ' KB';
    else return (num / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      year: 'numeric', month: 'short', day: 'numeric' 
    });
  };

  if (authRequired && !isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Secure Network Resources</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          This Drive source requires Google authentication. Sign in to load the connected files.
        </p>
        <button 
          onClick={() => void signInWithGoogle()}
          className="inline-flex flex-row items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary-dark transition-colors shadow-lg"
        >
          Authenticate via Google
        </button>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <IconBreadcrumbs />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Cloud Architecture & Resources</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAuthenticated ? 'Connected with Google authentication' : 'Showing your public Google Drive resources'}
            </p>
          </div>
          <button 
            onClick={fetchFiles}
            disabled={filesLoading}
            className="rounded-full bg-card border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50"
          >
            {filesLoading ? 'Syncing...' : 'Refresh Files'}
          </button>
        </div>
 
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-8 border border-red-100 text-sm">
            {error}
          </div>
        )}

        {filesLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Unable to load files</h3>
            <p className="text-muted-foreground text-sm">Check the Drive API configuration and try again.</p>
          </div>
        ) : files.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-sm">
            <FileText className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No files found</h3>
            <p className="text-muted-foreground text-sm">Your connected drive is currently empty or unshared.</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Name</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Last Modified</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs">Size</th>
                    <th className="px-6 py-4 font-medium uppercase tracking-wider text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {files.map((file, i) => (
                    <motion.tr 
                      key={file.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="hover:bg-muted/50 transition-colors group"
                    >
                      <td className="px-6 py-4 flex items-center gap-3">
                        <img src={file.iconLink || ''} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[400px]">
                          {file.name}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(file.modifiedTime)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{formatSize(file.size)}</td>
                      <td className="px-6 py-4 text-right">
                        <a 
                          href={file.webViewLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-dark"
                        >
                          Open <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
