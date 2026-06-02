'use client';
import { useEffect } from 'react';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UploadCloud, CheckCircle2, FileVideo, Download, Package } from 'lucide-react';
import { toast } from 'sonner';

export default function GenerateLabels() {
  const [shippingLabel, setShippingLabel] = useState<File | null>(null);
  const [productList, setProductList] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ labelCount: number; thermalPdfPath: string; docxPath?: string } | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingLabel) {
      toast.error('Please upload a Shipping Label PDF');
      return;
    }

    setIsProcessing(true);
    toast.info('Starting label generation...');

    const formData = new FormData();
    formData.append('shippingLabel', shippingLabel);
    if (productList) {
      formData.append('productList', productList);
    }

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to process files');
      }

      const data = await res.json();
      setResult(data);
      toast.success('Labels generated successfully!');
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#111827] p-8">
        {/* Glowing circles */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full filter blur-3xl"></div>
      <div>
        <div className="flex items-center space-x-3 mb-4">
          <Package className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Generate Labels</h1>
            <p className="text-muted-foreground mt-1">Generate translated shipping labels with SKU, quantity, title, barcode, and order mapping.</p>
          </div>
        </div>
      </div>

      <Card className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8 max-w-2xl w-full mx-auto relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        <CardHeader>
          <CardTitle>Upload Documents</CardTitle>
          <CardDescription>Select the PDF documents to be processed by the backend engine.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGenerate} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3 relative group">
                <Label htmlFor="shipping-label" className="text-base font-semibold flex items-center">
                  Shipping Label PDF <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center group-hover:shadow-md">
                  <Input 
                    id="shipping-label" 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setShippingLabel(e.target.files?.[0] || null)}
                    required
                  />
                  {shippingLabel ? (
                    <div className="flex flex-col items-center space-y-2 text-primary">
                      <FileVideo className="h-8 w-8" />
                      <span className="text-sm font-medium">{shippingLabel.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                      <UploadCloud className="h-8 w-8" />
                      <span className="text-sm">Click to upload or drag & drop</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 relative group">
                <Label htmlFor="product-list" className="text-base font-semibold flex items-center">
                  Product List PDF <span className="text-destructive ml-1">*</span>
                </Label>
                <div className="relative border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer text-center group-hover:shadow-md">
                  <Input 
                    id="product-list" 
                    type="file" 
                    accept=".pdf" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => setProductList(e.target.files?.[0] || null)}
                    required
                  />
                  {productList ? (
                    <div className="flex flex-col items-center space-y-2 text-primary">
                      <FileVideo className="h-8 w-8" />
                      <span className="text-sm font-medium">{productList.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2 text-muted-foreground">
                      <UploadCloud className="h-8 w-8" />
                      <span className="text-sm">Click to upload or drag & drop</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-lg font-medium shadow-lg hover:shadow-primary/25 transition-all"
              disabled={isProcessing || !shippingLabel || !productList}
            >
              {isProcessing ? 'Processing Pipeline...' : 'Generate Labels'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="bg-white/5 border border-white/10 rounded-2xl shadow-xl p-6 animate-in fade-in slide-in-from-bottom-4">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Labels Generated</h3>
                  <p className="text-sm text-muted-foreground">{result.labelCount} labels processed.</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => window.open(result.thermalPdfPath, '_blank')}>
                  <Download className="mr-1 h-3 w-3" /> PDF
                </Button>
                {/* Add DOCX download if available in result */}
                {result.docxPath && (
                  <Button variant="outline" onClick={() => window.open(result.docxPath, '_blank')}>
                    <Download className="mr-1 h-3 w-3" /> DOCX
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}    </div>
  );
}
