import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Upload, FileText, CheckCircle, ChevronRight } from 'lucide-react';

const STEPS = ['Selecionar Categoria', 'Anexar Arquivo', 'Confirmar Envio'];

export default function DocumentUpload() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.documents.categories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const handleUpload = async () => {
    if (!selectedCategory || !file) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', selectedCategory);
      await api.documents.upload(formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const reset = () => {
    setStep(0);
    setSelectedCategory('');
    setFile(null);
    setSuccess(false);
    setError('');
  };

  const categoryLabel = (cat: string) => cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-10 pb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <CardTitle className="mb-2">Documento Enviado!</CardTitle>
            <CardDescription className="mb-6">
              Seu documento foi enviado com sucesso e aguarda aprovação do orientador.
            </CardDescription>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Voltar ao Painel
              </Button>
              <Button onClick={reset}>
                Enviar Outro
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b">
        <div className="max-w-2xl mx-auto px-4 h-16 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="font-semibold text-lg">Upload de Documento</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i <= step ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}>
                  {i + 1}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <ChevronRight className={`mx-2 h-4 w-4 ${i < step ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 0 && 'Selecione a Categoria do Documento'}
              {step === 1 && 'Anexe o Arquivo'}
              {step === 2 && 'Confirme o Envio'}
            </CardTitle>
            <CardDescription>
              {step === 0 && 'Escolha o tipo de documento que deseja enviar'}
              {step === 1 && 'Selecione o arquivo no seu computador (PDF, DOC, JPG ou PNG)'}
              {step === 2 && 'Revise as informações antes de enviar'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <div className="grid gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    className="justify-start h-auto py-3"
                    onClick={() => { setSelectedCategory(cat); setStep(1); }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {categoryLabel(cat)}
                  </Button>
                ))}
              </div>
            )}

            {step === 1 && (
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                  <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <span className="text-primary font-medium">Clique para selecionar</span>
                    <span className="text-muted-foreground"> ou arraste o arquivo</span>
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    PDF, DOC, DOCX, JPG ou PNG (máx. 10MB)
                  </p>
                </div>
                {file && (
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <Badge variant="secondary">Selecionado</Badge>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(0)}>Voltar</Button>
                  <Button onClick={() => setStep(2)} disabled={!file}>Avançar</Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div className="space-y-3 bg-muted rounded-lg p-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Categoria:</span>
                    <span className="font-medium">{categoryLabel(selectedCategory)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Arquivo:</span>
                    <span className="font-medium">{file?.name}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tamanho:</span>
                    <span className="font-medium">
                      {file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '-'}
                    </span>
                  </div>
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)}>Voltar</Button>
                  <Button onClick={handleUpload} disabled={uploading}>
                    {uploading ? 'Enviando...' : 'Confirmar Envio'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
