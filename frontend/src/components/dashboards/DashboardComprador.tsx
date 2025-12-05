import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { solicitudesAPI } from '../../services/api';

const estadoBadge = {
  pendiente: { label: 'Pendiente', className: 'bg-white/5 text-gray-400 border-white/10', icon: Clock },
  aprobada: { label: 'Aprobada', className: 'bg-white/5 text-white border-white/10', icon: CheckCircle2 },
  rechazada: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
  anulada: { label: 'Anulada', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20', icon: XCircle },
};

export function DashboardComprador() {
  const [loading, setLoading] = useState(true);
  const [misSolicitudes, setMisSolicitudes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
  });

  useEffect(() => {
    loadMisSolicitudes();
  }, []);

  const loadMisSolicitudes = async () => {
    try {
      setLoading(true);
      const solicitudes = await solicitudesAPI.getAll();
      // Asegurar que todas las solicitudes tengan estado
      const solicitudesConEstado = solicitudes.map((s: any) => ({
        ...s,
        estado: s.estado || 'Pendiente', // Estado por defecto si no existe
      }));
      setMisSolicitudes(solicitudesConEstado.slice(0, 5));
      
      const statsData = {
        total: solicitudesConEstado.length,
        pendientes: solicitudesConEstado.filter((s: any) => s.estado === 'Pendiente').length,
        aprobadas: solicitudesConEstado.filter((s: any) => s.estado === 'Aprobada').length,
        rechazadas: solicitudesConEstado.filter((s: any) => s.estado === 'Rechazada').length,
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar mis solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const statsCards = [
    {
      title: 'Mis Solicitudes',
      value: stats.total.toString(),
      change: 'Total enviadas',
      icon: FileText,
    },
    {
      title: 'Pendientes',
      value: stats.pendientes.toString(),
      change: 'En revisión',
      icon: Clock,
    },
    {
      title: 'Aprobadas',
      value: stats.aprobadas.toString(),
      change: stats.total > 0 ? `${((stats.aprobadas / stats.total) * 100).toFixed(0)}% de éxito` : '0% de éxito',
      icon: CheckCircle2,
    },
    {
      title: 'Rechazadas',
      value: stats.rechazadas.toString(),
      change: stats.total > 0 ? `${((stats.rechazadas / stats.total) * 100).toFixed(0)}% del total` : '0% del total',
      icon: XCircle,
    },
  ];

  return (
    <div className="p-16 space-y-16 bg-background">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground">Dashboard</h1>
          <div className="h-px w-32 bg-red-600 mb-4"></div>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[0.7rem]">Estado de mis solicitudes</p>
        </div>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white border-0 h-14 px-8 tracking-[0.2em]"
          onClick={() => {
            const event = new CustomEvent('changeView', { detail: 'solicitudes' });
            window.dispatchEvent(event);
          }}
        >
          <FileText className="h-4 w-4 mr-3" strokeWidth={1.5} />
          Nueva Solicitud
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="border border-border bg-card hover:bg-accent transition-all group">
              <CardContent className="p-10">
                <div className="flex items-start justify-between mb-8">
                  <Icon className="h-8 w-8 text-card-foreground" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem] mb-4">{stat.title}</p>
                  <h2 className="text-card-foreground mb-3 text-4xl tracking-wider">{stat.value}</h2>
                  <p className="text-muted-foreground text-[0.7rem] tracking-wider">{stat.change}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mis Solicitudes Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-8">
          <CardTitle className="text-card-foreground tracking-[0.15em]">Mis Solicitudes</CardTitle>
          <div className="h-px bg-border my-4"></div>
          <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem]">Estado de las solicitudes creadas</CardDescription>
        </CardHeader>
        <CardContent>
          {misSolicitudes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">ID</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Descripción</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Monto</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Fecha</TableHead>
                  <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {misSolicitudes.map((solicitud) => {
                  const estado = estadoBadge[solicitud.estado?.toLowerCase() as keyof typeof estadoBadge] || estadoBadge.pendiente;
                  const IconEstado = estado.icon;
                  return (
                    <TableRow key={solicitud.id} className="border-border hover:bg-accent transition-colors">
                      <TableCell className="text-card-foreground font-mono text-sm tracking-wider">{solicitud.numero || solicitud.id}</TableCell>
                      <TableCell className="text-muted-foreground tracking-wide">{solicitud.descripcion}</TableCell>
                      <TableCell className="text-card-foreground font-mono tracking-wider">${solicitud.monto.toLocaleString('es-ES')}</TableCell>
                      <TableCell className="text-muted-foreground text-sm tracking-wide">{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${estado.className} uppercase text-[0.65rem] tracking-[0.15em]`}>
                          <IconEstado className="h-3 w-3 mr-1.5" strokeWidth={1.5} />
                          {estado.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No tienes solicitudes aún
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-border bg-card">
          <CardHeader className="pb-6">
            <CardTitle className="text-card-foreground tracking-[0.15em]">Acciones Rápidas</CardTitle>
            <div className="h-px bg-border mt-4"></div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border h-14 tracking-[0.1em] text-[0.7rem]"
              onClick={() => {
                const event = new CustomEvent('changeView', { detail: 'solicitudes' });
                window.dispatchEvent(event);
              }}
            >
              <FileText className="h-4 w-4 mr-4" strokeWidth={1.5} />
              Crear Nueva Solicitud
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border h-14 tracking-[0.1em] text-[0.7rem]"
              onClick={() => {
                const event = new CustomEvent('changeView', { detail: 'solicitudes' });
                window.dispatchEvent(event);
              }}
            >
              <Clock className="h-4 w-4 mr-4" strokeWidth={1.5} />
              Ver Solicitudes Pendientes
            </Button>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-6">
            <CardTitle className="text-card-foreground tracking-[0.15em]">Consejos</CardTitle>
            <div className="h-px bg-border mt-4"></div>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground text-sm tracking-wide leading-relaxed">
            <p>• Asegúrate de completar todos los campos requeridos</p>
            <p>• Adjunta documentación de respaldo cuando sea posible</p>
            <p>• Verifica los montos antes de enviar la solicitud</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
