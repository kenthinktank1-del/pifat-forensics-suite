import { useState } from 'react';
import { Upload, Sparkles, FileJson, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

export default function AIAnalyzer() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setAnalysis(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    
    setIsAnalyzing(true);
    
    // Simulated AI analysis - replace with actual AI integration
    setTimeout(() => {
      setAnalysis({
        summary: 'Evidence analysis completed. File contains metadata indicating creation on January 15, 2024. No signs of tampering detected.',
        classification: 'Digital Document',
        suggestedTags: ['document', 'metadata', 'verified', 'january-2024'],
        riskScore: 15,
        findings: [
          'File integrity verified',
          'Metadata extraction successful',
          'Timestamp consistent with case timeline',
          'No suspicious patterns detected'
        ]
      });
      setIsAnalyzing(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Evidence Analyzer
        </h1>
        <p className="text-muted-foreground">
          Upload and analyze evidence using artificial intelligence
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle>Upload Evidence</CardTitle>
              <CardDescription>
                Supported: JSON, Text, Images (JPG, PNG)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-primary/20 rounded-lg p-8 text-center hover:border-primary/40 transition-colors">
                <input
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="file-upload"
                  accept=".json,.txt,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-sm font-medium">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Maximum file size: 10MB
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    {selectedFile.type.includes('json') && (
                      <FileJson className="h-8 w-8 text-primary" />
                    )}
                    {selectedFile.type.includes('image') && (
                      <Image className="h-8 w-8 text-primary" />
                    )}
                    {selectedFile.type.includes('text') && (
                      <FileText className="h-8 w-8 text-primary" />
                    )}
                    <div>
                      <p className="font-medium">{selectedFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {selectedFile && (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle>Metadata Viewer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Name:</span>
                    <span className="font-medium">{selectedFile.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-medium">
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Type:</span>
                    <span className="font-medium">{selectedFile.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Modified:</span>
                    <span className="font-medium">
                      {new Date(selectedFile.lastModified).toLocaleString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          {analysis ? (
            <>
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Summary</span>
                    <p className="mt-1">{analysis.summary}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-muted-foreground">
                      Classification
                    </span>
                    <p className="mt-1 font-medium text-primary">
                      {analysis.classification}
                    </p>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Risk Score</span>
                    <div className="mt-2">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-success to-warning transition-all"
                            style={{ width: `${analysis.riskScore}%` }}
                          />
                        </div>
                        <span className="font-bold text-success">
                          {analysis.riskScore}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Suggested Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {analysis.suggestedTags.map((tag: string) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle>Key Findings</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysis.findings.map((finding: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-primary/20">
              <CardContent className="py-12 text-center">
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Upload a file and click Analyze to see AI-powered insights
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
