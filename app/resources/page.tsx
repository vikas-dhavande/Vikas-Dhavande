'use client';

import { useState, useEffect } from 'react';
import { useAuth, OAuthProvider } from '../../src/hooks/useAuth';
import { FileText, Lock, ExternalLink, Loader2, ShieldAlert, Download, Folder, ChevronRight, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import IconBreadcrumbs from '../../src/components/IconBreadcrumbs';
import { logger } from '../../src/lib/logger';

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
  const { isAuthenticated, signInWithProvider, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [folderStack, setFolderStack] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchFiles();
    }
  }, [isAuthenticated]);

  const fetchFiles = async (folderId?: string) => {
    setFilesLoading(true);
    setError(null);
    logger.info('Fetching drive files', { path: '/resources', folderId });

    try {
      const url = new URL('/api/drive/files', window.location.origin);
      if (folderId) {
        url.searchParams.set('folderId', folderId);
      }
      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Drive API returned ${res.status}`);
      }

      setFiles(data.files || []);
      logger.info('Drive files fetched successfully', { count: data.files?.length || 0 });
    } catch (err: any) {
      logger.error('Error fetching drive files', { error: err.message });
      setError(err.message || 'An error occurred while fetching files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFolderClick = (folder: DriveFile) => {
    setFolderStack(prev => [...prev, { id: folder.id, name: folder.name }]);
    void fetchFiles(folder.id);
  };

  const handleBackClick = () => {
    const newStack = [...folderStack];
    newStack.pop();
    setFolderStack(newStack);
    const parentFolder = newStack[newStack.length - 1];
    void fetchFiles(parentFolder?.id);
  };

  const handleDownload = (file: DriveFile) => {
    // Note: Using webViewLink for download-like experience since Google Drive 
    // files (Docs, Sheets) don't have a direct download URL without export.
    // For binary files, this URL can be constructed if needed.
    window.open(file.webViewLink, '_blank');
    logger.info('File download/view initiated', { fileId: file.id, fileName: file.name });
  };

  const isFolder = (mimeType: string) => mimeType === 'application/vnd.google-apps.folder';

  const handleProviderLogin = (provider: OAuthProvider) => {
    logger.info('Initiating provider login from resources page', { provider });
    void signInWithProvider(provider);
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

  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-3xl font-bold text-foreground mb-4">Restricted Access</h2>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          This area contains sensitive cloud architecture resources and requires authentication.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => handleProviderLogin('google')}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-white hover:bg-primary/90 transition-colors shadow-lg"
          >
            Sign in with Google
          </button>
          <button 
            onClick={() => handleProviderLogin('github')}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-8 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            Sign in with GitHub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <IconBreadcrumbs />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">my cloude resource</h1>
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
              {folderStack.length > 0 && (
                <button 
                  onClick={handleBackClick}
                  className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
                >
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
              )}
              {folderStack.length > 0 ? (
                <span className="flex items-center gap-1">
                  <ChevronRight className="h-3.5 w-3.5 opacity-50" />
                  {folderStack[folderStack.length - 1].name}
                </span>
              ) : (
                isAuthenticated ? 'Connected with Google authentication' : 'Showing your public Google Drive resources'
              )}
            </p>
          </div>
          <button 
            onClick={() => fetchFiles(folderStack[folderStack.length - 1]?.id)}
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
            <p className="text-muted-foreground text-sm max-w-md mx-auto">{error}</p>
            <button
              onClick={() => fetchFiles(folderStack[folderStack.length - 1]?.id)}
              className="mt-6 rounded-full bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Try again
            </button>
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
                        {isFolder(file.mimeType) ? (
                          <Folder className="w-4 h-4 text-primary fill-primary/10" />
                        ) : (
                          <img src={file.iconLink || ''} alt="" className="w-4 h-4 object-contain" referrerPolicy="no-referrer" />
                        )}
                        {isFolder(file.mimeType) ? (
                          <button 
                            onClick={() => handleFolderClick(file)}
                            className="font-medium text-foreground hover:text-primary transition-colors text-left truncate max-w-[200px] sm:max-w-[400px]"
                          >
                            {file.name}
                          </button>
                        ) : (
                          <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-[400px]">
                            {file.name}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{formatDate(file.modifiedTime)}</td>
                      <td className="px-6 py-4 text-muted-foreground">{isFolder(file.mimeType) ? '--' : formatSize(file.size)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isFolder(file.mimeType) && (
                            <button
                              onClick={() => handleDownload(file)}
                              className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                              title="Download file"
                            >
                              <Download className="h-4 w-4" />
                            </button>
                          )}
                          <a 
                            href={file.webViewLink} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary text-sm font-medium hover:text-primary-dark p-2"
                          >
                            {isFolder(file.mimeType) ? 'Open Folder' : 'Open'} <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        </div>
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
