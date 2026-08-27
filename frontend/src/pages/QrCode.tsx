import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { urlApi } from '../api/urlApi';
import type { UrlResponse } from '../types';
import { Button } from '../components/ui/Button';
import { ArrowLeft, Download, Share2, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

export default function QrCode() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [url, setUrl] = useState<UrlResponse | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      if (!id) return;
      
      const [urlData, qrBlob] = await Promise.all([
        urlApi.getUrl(parseInt(id)),
        urlApi.getQrCode(parseInt(id))
      ]);
      
      setUrl(urlData);
      setQrCodeUrl(URL.createObjectURL(qrBlob));
    } catch (error) {
      toast.error('Failed to load QR code');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (url) {
      navigator.clipboard.writeText(url.shortUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const downloadQrCode = () => {
    if (!qrCodeUrl || !url) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qr-clickme-${url.shortCode}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const shareLink = async () => {
    if (!url) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'ClickMe Short Link',
          url: url.shortUrl,
        });
      } catch (err) {
        // user cancelled share, don't show error
      }
    } else {
      copyToClipboard();
    }
  };

  if (isLoading) {
    return <div className="text-center p-12 text-muted-foreground animate-pulse">Generating QR Code...</div>;
  }

  if (!url || !qrCodeUrl) {
    return (
      <div className="text-center p-12">
        <p className="text-destructive mb-4">Failed to load QR code</p>
        <Button onClick={() => navigate('/urls')}>Back to Links</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button 
        onClick={() => navigate('/urls')}
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft size={16} /> Back to Links
      </button>

      <div className="bg-card border border-border rounded-xl shadow-sm p-8 text-center space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">QR Code Ready</h1>
          <p className="text-muted-foreground mt-2">Scan this code to visit the destination URL</p>
        </div>

        <div className="flex justify-center">
          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <img 
              src={qrCodeUrl} 
              alt="QR Code" 
              className="w-64 h-64 object-contain"
            />
          </div>
        </div>

        <div className="bg-accent/50 p-4 rounded-lg flex items-center justify-between border border-border max-w-md mx-auto">
          <a href={url.shortUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-medium text-primary hover:underline truncate">
            {url.shortUrl}
          </a>
          <button onClick={copyToClipboard} className="ml-4 text-muted-foreground hover:text-foreground transition-colors p-2" title="Copy">
            <Copy size={20} />
          </button>
        </div>

        <div className="flex justify-center gap-4">
          <Button onClick={downloadQrCode} className="gap-2">
            <Download size={18} /> Download PNG
          </Button>
          <Button variant="secondary" onClick={shareLink} className="gap-2">
            <Share2 size={18} /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
