'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import {
  FileText,
  ExternalLink,
  Loader2,
  ShieldAlert,
  Download,
  UploadCloud,
  Trash2,
  RefreshCw,
  Search,
  FileCode,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  FileVideo,
  FileAudio,
  File as FileIcon,
  CheckCircle2,
  AlertCircle,
  HardDrive,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IconBreadcrumbs from '@/components/IconBreadcrumbs';
import { logger } from '@/lib/logger';

interface StorageFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  modifiedTime: string;
  createdTime?: string;
  viewUrl: string;
  downloadUrl: string;
  bucketId?: string;
}

export default function Resources() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [files, setFiles] = useState<StorageFile[]>([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      void fetchFiles();
    }
  }, [isAuthenticated]);

  const fetchFiles = async (search?: string) => {
    setFilesLoading(true);
    setError(null);
    logger.info('Fetching Appwrite storage files', { path: '/resources', search });

    try {
      const url = new URL('/api/storage/files', window.location.origin);
      if (search) {
        url.searchParams.set('search', search);
      }
      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Appwrite Storage API returned ${res.status}`);
      }

      setFiles(data.files || []);
      logger.info('Appwrite storage files loaded', { count: data.files?.length || 0 });
    } catch (err: any) {
      logger.error('Error fetching Appwrite storage files', { error: err.message });
      setError(err.message || 'An error occurred while fetching storage files');
    } finally {
      setFilesLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadMessage(null);
    logger.info('Uploading file to Appwrite storage', { filename: file.name, size: file.size });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/storage/files', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }

      setUploadMessage({ type: 'success', text: `Uploaded "${file.name}" successfully!` });
      await fetchFiles();
    } catch (err: any) {
      logger.error('File upload error', { error: err.message });
      setUploadMessage({ type: 'error', text: err.message || 'File upload failed' });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete "${fileName}"?`)) return;

    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/storage/files?fileId=${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete file');
      }

      setFiles((prev) => prev.filter((f) => f.id !== fileId));
      setUploadMessage({ type: 'success', text: `Deleted "${fileName}"` });
    } catch (err: any) {
      setError(err.message || 'Failed to delete file');
    } finally {
      setDeletingId(null);
    }
  };

  const getFileIcon = (mimeType: string, name: string) => {
    const lowerName = name.toLowerCase();
    if (mimeType.includes('pdf') || lowerName.endsWith('.pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (
      mimeType.includes('image') ||
      ['.png', '.jpg', '.jpeg', '.svg', '.webp', '.gif'].some((ext) => lowerName.endsWith(ext))
    ) {
      return <FileImage className="w-5 h-5 text-emerald-500" />;
    }
    if (
      mimeType.includes('javascript') ||
      mimeType.includes('typescript') ||
      mimeType.includes('json') ||
      ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.py'].some((ext) => lowerName.endsWith(ext))
    ) {
      return <FileCode className="w-5 h-5 text-sky-500" />;
    }
    if (lowerName.endsWith('.md') || mimeType.includes('markdown')) {
      return <FileText className="w-5 h-5 text-primary" />;
    }
    if (
      mimeType.includes('zip') ||
      mimeType.includes('tar') ||
      mimeType.includes('gzip') ||
      ['.zip', '.rar', '.7z', '.gz'].some((ext) => lowerName.endsWith(ext))
    ) {
      return <FileArchive className="w-5 h-5 text-amber-500" />;
    }
    if (mimeType.includes('sheet') || mimeType.includes('csv') || lowerName.endsWith('.xlsx') || lowerName.endsWith('.csv')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    }
    if (mimeType.includes('video')) {
      return <FileVideo className="w-5 h-5 text-purple-500" />;
    }
    if (mimeType.includes('audio')) {
      return <FileAudio className="w-5 h-5 text-pink-500" />;
    }
    return <FileIcon className="w-5 h-5 text-muted-foreground" />;
  };

  const formatSize = (bytes?: string) => {
    if (!bytes) return '--';
    const num = parseInt(bytes, 10);
    if (isNaN(num)) return '--';
    if (num < 1024) return num + ' B';
    if (num < 1048576) return (num / 1024).toFixed(1) + ' KB';
    return (num / 1048576).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '--';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredFiles = files.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          This area contains cloud architecture resources and storage artifacts. Sign in with your account to access.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/sign-in?redirect=/resources"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg"
          >
            Sign In to Access Resources
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background min-h-[calc(100vh-4rem)] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <IconBreadcrumbs />

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-foreground">Cloud Resources</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                <HardDrive className="w-3.5 h-3.5" /> Appwrite Storage
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Secure cloud storage bucket <span className="font-mono text-foreground">resources</span> • Connected as <span className="text-foreground font-medium">{user?.email || 'User'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-md disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  Upload File
                </>
              )}
            </button>

            <button
              onClick={() => void fetchFiles(searchQuery)}
              disabled={filesLoading}
              className="inline-flex items-center gap-2 rounded-full bg-card border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-50 transition-colors"
              title="Refresh files"
            >
              <RefreshCw className={`h-4 w-4 ${filesLoading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* Upload feedback banner */}
        <AnimatePresence>
          {uploadMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-4 rounded-2xl mb-6 flex items-center gap-3 border text-sm ${
                uploadMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
              }`}
            >
              {uploadMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <span className="flex-1">{uploadMessage.text}</span>
              <button
                onClick={() => setUploadMessage(null)}
                className="text-xs font-semibold opacity-70 hover:opacity-100"
              >
                Dismiss
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Stats Bar */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search resources by filename..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background border border-border rounded-xl pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
          </div>
          <div className="text-xs text-muted-foreground self-start sm:self-center font-medium">
            Total Files: <span className="text-foreground font-semibold">{filteredFiles.length}</span>
            {searchQuery && files.length !== filteredFiles.length && (
              <span className="ml-1 opacity-70">({files.length} unfiltered)</span>
            )}
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="bg-destructive/10 text-destructive p-4 rounded-2xl mb-8 border border-destructive/20 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => void fetchFiles()}
              className="underline font-medium hover:text-foreground text-xs ml-4"
            >
              Retry
            </button>
          </div>
        )}

        {/* Content Section */}
        {filesLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading storage files from Appwrite...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 text-center shadow-sm">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <UploadCloud className="h-8 w-8 text-muted-foreground/60" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {searchQuery ? 'No matching files found' : 'No files in Appwrite Storage'}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
              {searchQuery
                ? `No files match "${searchQuery}". Clear your search query to see all resources.`
                : 'Your resources bucket is ready. Upload architecture diagrams, PDFs, and data files directly.'}
            </p>
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="rounded-full bg-muted px-6 py-2 text-sm font-medium text-foreground hover:bg-muted/80 transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all shadow-md"
              >
                Upload First File
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/60 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">File</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Type</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Size</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Last Modified</th>
                    <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredFiles.map((file, i) => (
                    <motion.tr
                      key={file.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-xl bg-background border border-border/60 group-hover:border-primary/30 transition-colors">
                            {getFileIcon(file.mimeType, file.name)}
                          </div>
                          <div>
                            <span className="font-medium text-foreground block truncate max-w-[240px] sm:max-w-[360px] md:max-w-[480px]">
                              {file.name}
                            </span>
                            <span className="text-[11px] font-mono text-muted-foreground/70">
                              ID: {file.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {file.mimeType || 'unknown'}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {formatSize(file.size)}
                      </td>

                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {formatDate(file.modifiedTime)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={file.viewUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium bg-muted/60 text-foreground hover:bg-primary hover:text-white transition-all"
                            title="Preview file in browser"
                          >
                            Preview <ExternalLink className="h-3 w-3" />
                          </a>

                          <a
                            href={file.downloadUrl}
                            download={file.name}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            title="Download file"
                          >
                            <Download className="h-4 w-4" />
                          </a>

                          <button
                            onClick={() => handleDeleteFile(file.id, file.name)}
                            disabled={deletingId === file.id}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                            title="Delete file"
                          >
                            {deletingId === file.id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-destructive" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
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
