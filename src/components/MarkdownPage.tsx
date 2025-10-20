"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiDownload, FiPrinter, FiShare2, FiLoader } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';

interface MarkdownPageProps {
  title: string;
  markdownFile: string;
  lastUpdated?: string;
}

export default function MarkdownPage({ title, markdownFile, lastUpdated }: MarkdownPageProps) {
  const router = useRouter();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/content/${markdownFile}`)
      .then((res) => res.text())
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Error loading content:', error);
        setLoading(false);
      });
  }, [markdownFile]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: window.location.href
        });
      } catch (error) {
        // console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${markdownFile}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center">
        <FiLoader className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50">
      <div className="max-w-4xl mx-auto p-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-pink-600 mb-4 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {title}
            </h1>
            {lastUpdated && (
              <p className="text-sm text-gray-600">
                Last Updated: {lastUpdated}
              </p>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
              >
                <FiPrinter className="w-4 h-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
              >
                <FiDownload className="w-4 h-4 mr-2" />
                Download
              </button>
              <button
                onClick={handleShare}
                className="flex items-center px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
              >
                <FiShare2 className="w-4 h-4 mr-2" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-8 md:p-12 prose prose-pink max-w-none">
          <ReactMarkdown
            components={{
              h1: ({ node, ...props }) => (
                <h1 className="text-3xl font-bold text-gray-800 mb-4 mt-8 pb-2 border-b-2 border-pink-200" {...props} />
              ),
              h2: ({ node, ...props }) => (
                <h2 className="text-2xl font-bold text-gray-800 mb-3 mt-6" {...props} />
              ),
              h3: ({ node, ...props }) => (
                <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-4" {...props} />
              ),
              h4: ({ node, ...props }) => (
                <h4 className="text-lg font-semibold text-gray-700 mb-2 mt-3" {...props} />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="ml-4" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a className="text-pink-600 hover:text-pink-700 underline" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-semibold text-gray-800" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-gray-700" {...props} />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote className="border-l-4 border-pink-500 pl-4 py-2 mb-4 bg-pink-50 italic text-gray-700" {...props} />
              ),
              code: ({ node, ...props }) => (
                <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-pink-600" {...props} />
              ),
              pre: ({ node, ...props }) => (
                <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto mb-4" {...props} />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-8 border-t-2 border-pink-200" {...props} />
              ),
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full border border-gray-300" {...props} />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-pink-50" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th className="border border-gray-300 px-4 py-2 text-left font-semibold text-gray-800" {...props} />
              ),
              td: ({ node, ...props }) => (
                <td className="border border-gray-300 px-4 py-2 text-gray-700" {...props} />
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        {/* Footer Info */}
        <div className="mt-8 bg-gradient-to-r from-pink-100 to-purple-100 rounded-2xl p-6 border border-pink-200">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💬</span>
            Have Questions?
          </h3>
          <p className="text-gray-700 mb-4">
            If you have any questions about our {title.toLowerCase()}, please don't hesitate to contact us.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="tel:+919650461390"
              className="flex items-center justify-center px-4 py-3 bg-white text-pink-600 rounded-lg hover:shadow-md transition-all font-medium"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 rotate-180" />
              Call Us
            </a>
            <a
              href="mailto:support@kritikasalonpatna.com"
              className="flex items-center justify-center px-4 py-3 bg-white text-pink-600 rounded-lg hover:shadow-md transition-all font-medium"
            >
              <FiArrowLeft className="w-5 h-5 mr-2 rotate-180" />
              Email Us
            </a>
            <a
              href="/contact"
              className="flex items-center justify-center px-4 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all font-medium"
            >
              Contact Form
            </a>
          </div>
        </div>

        {/* Print Styles */}
        <style jsx global>{`
          @media print {
            body {
              background: white;
            }
            .no-print {
              display: none !important;
            }
            .prose {
              max-width: 100%;
            }
          }
        `}</style>
      </div>
    </div>
  );
}