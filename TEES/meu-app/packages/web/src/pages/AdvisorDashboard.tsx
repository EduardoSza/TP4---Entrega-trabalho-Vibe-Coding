import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Users, FileText, Clock, Building2, Bell, LogOut, Search,
  BarChart3, Download
} from 'lucide-react';

export default function AdvisorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.dashboard.advisor()
      .then(setData)
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  if (!data) return null;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';

  const filteredStudents = data.students?.filter((s: any) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.registrationNumber.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-6 w-6 text-primary" />
            <h1 className="font-semibold text-lg">Painel do Orientador</h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
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
              <CardTitle className="text-sm font-medium">Total de Alunos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalStudents}</div>
              <p className="text-xs text-muted-foreground">{data.withCompany} com empresa</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revisões Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{data.pendingReviews}</div>
              <p className="text-xs text-muted-foreground">documentos aguardando</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Horas Totais</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.totalHours}h</div>
              <p className="text-xs text-muted-foreground">somadas dos alunos</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empresas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.companies?.length || 0}</div>
              <p className="text-xs text-muted-foreground">parceiras cadastradas</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-lg">Alunos Orientados</CardTitle>
                <CardDescription>Gerencie e acompanhe seus alunos</CardDescription>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou matrícula..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 font-medium">Nome</th>
                    <th className="pb-3 font-medium hidden md:table-cell">Matrícula</th>
                    <th className="pb-3 font-medium hidden lg:table-cell">Empresa</th>
                    <th className="pb-3 font-medium">Horas</th>
                    <th className="pb-3 font-medium hidden sm:table-cell">Documentos</th>
                    <th className="pb-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents?.map((s: any) => (
                    <tr key={s.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs">
                              {s.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3 hidden md:table-cell text-muted-foreground">{s.registrationNumber}</td>
                      <td className="py-3 hidden lg:table-cell text-muted-foreground">{s.company?.name || '-'}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {s.totalHours}h
                        </div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <div className="flex gap-1">
                          <Badge variant="success" className="text-xs">{s.approvedDocuments}</Badge>
                          {s.pendingDocuments > 0 && (
                            <Badge variant="warning" className="text-xs">{s.pendingDocuments}</Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        <Button variant="outline" size="sm" onClick={() => navigate(`/students/${s.id}`)}>
                          Detalhes
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!filteredStudents || filteredStudents.length === 0) && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-muted-foreground">
                        Nenhum aluno encontrado
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Empresas</CardTitle>
              <CardDescription>Empresas com alunos vinculados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.companies?.map((c: any) => (
                  <div key={c.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{c.name}</span>
                    </div>
                    <Badge variant="secondary">{c._count.students} alunos</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Ações Rápidas</CardTitle>
                <CardDescription>Tarefas administrativas</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/documents')}>
                <FileText className="h-4 w-4 mr-2" /> Revisar Documentos
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="h-4 w-4 mr-2" /> Exportar Relatórios
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Building2 className="h-4 w-4 mr-2" /> Cadastrar Empresa
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
