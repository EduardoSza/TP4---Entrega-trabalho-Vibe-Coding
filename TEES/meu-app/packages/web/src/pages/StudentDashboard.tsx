import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  FileText, Clock, AlertCircle, CheckCircle, XCircle, Upload, 
  Bell, LogOut, User, Building2, BarChart3 
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard.student()
      .then(setData)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!data) return null;

  const { student, documents, hoursByMonth } = data;

  const statusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'destructive'> = {
      APPROVED: 'success',
      PENDING: 'warning',
      REJECTED: 'destructive',
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status === 'APPROVED' ? 'Aprovado' : status === 'PENDING' ? 'Pendente' : 'Rejeitado'}
      </Badge>
    );
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg">Gestão de Estágios</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/notifications')} className="relative">
              <Bell className="h-5 w-5" />
              {data.notifications?.filter((n: any) => !n.read).length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {data.notifications.filter((n: any) => !n.read).length}
                </span>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carga Horária</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{student.totalHours}h</div>
              <p className="text-xs text-muted-foreground">de {student.requiredHours}h obrigatórias</p>
              <Progress value={student.progressPercentage} className="mt-3" />
              <p className="text-xs text-muted-foreground mt-1">{student.progressPercentage}% concluído</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Documentos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{documents.total}</div>
              <div className="flex gap-3 mt-1 text-xs">
                <span className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" /> {documents.approved}
                </span>
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertCircle className="h-3 w-3" /> {documents.pending}
                </span>
                <span className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-3 w-3" /> {documents.rejected}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresa</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {student.company ? (
                <>
                  <div className="text-sm font-medium">{student.company.name}</div>
                  <p className="text-xs text-muted-foreground">{student.company.supervisorName}</p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Não vinculado</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Curso</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{student.course}</div>
              <p className="text-xs text-muted-foreground">Matrícula: {student.registrationNumber}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Horas por Mês</CardTitle>
              <CardDescription>Distribuição de carga horária mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {hoursByMonth.map((m: any) => (
                  <div key={m.month} className="flex items-center gap-3">
                    <span className="text-sm w-10 font-medium">{m.month}</span>
                    <Progress value={(m.hours / 70) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground w-10 text-right">{m.hours}h</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Documentos Recentes</CardTitle>
                <CardDescription>Últimos documentos enviados</CardDescription>
              </div>
              <Button size="sm" onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4 mr-2" /> Novo Documento
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.recent?.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Nenhum documento enviado ainda
                  </p>
                )}
                {documents.recent?.map((doc: any) => (
                  <div key={doc.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{doc.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.category.replace(/_/g, ' ')}
                        </p>
                      </div>
                    </div>
                    {statusBadge(doc.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notificações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.notifications?.map((n: any) => (
                <div key={n.id} className={`flex items-start gap-3 p-3 rounded-lg ${!n.read ? 'bg-muted/50' : ''}`}>
                  <Bell className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(n.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
