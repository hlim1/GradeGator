import React, { useEffect, useState } from 'react';

interface PDFViewerProps {
  url: string;
}

export default function PDFViewer({ url }: PDFViewerProps) {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    async function fetchPDF() {
      try {
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.error('Failed to fetch PDF:', err);
      }
    }

    fetchPDF();

    // Clean up blob URL on unmount
    return () => {
      if (pdfBlobUrl) URL.revokeObjectURL(pdfBlobUrl);
    };
  }, [url]);

  if (!pdfBlobUrl) return <p>Loading PDF...</p>;

  return (
    <iframe
      src={pdfBlobUrl}
      width="100%"
      height="600px"
      title="PDF Viewer"
      className="border rounded-xl shadow mt-2"
    />
  );
}
