import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { UserRole } from '../../App';
import { solicitudesAPI } from '../../services/api';

interface DashboardAprobadorProps {
  rol: UserRole;
}

const prioridadBadge = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  baja: { label: 'Baja', className: 'bg-blue-100 text-blue-800' },
};

export function DashboardAprobador({ rol }: DashboardAprobadorProps) {
  const [loading, setLoading] = useState(true);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([]);
  const [stats, setStats] = useState({
    pendientes: 0,
    aprobadas: 0,
    rechazadas: 0,
    montoPendiente: 0,
  });

  useEffect(() => {
    loadSolicitudesPendientes();
  }, []);

  const loadSolicitudesPendientes = async () => {
    try {
      setLoading(true);
      const solicitudes = await solicitudesAPI.getAll({ estado: 'Pendiente' }).catch(err => {
        console.error('Error al obtener solicitudes pendientes:', err);
        return [];
      });
      setSolicitudesPendientes((solicitudes || []).slice(0, 5));
      
      const todas = await solicitudesAPI.getAll().catch(err => {
        console.error('Error al obtener todas las solicitudes:', err);
        return [];
      });
      const statsData = {
        pendientes: (solicitudes || []).length,
        aprobadas: (todas || []).filter((s: any) => s.estado === 'Aprobada').length,
        rechazadas: (todas || []).filter((s: any) => s.estado === 'Rechazada').length,
        montoPendiente: (solicitudes || []).reduce((sum: number, s: any) => sum + (s.monto || 0), 0),
      };
      setStats(statsData);
    } catch (error) {
      console.error('Error al cargar solicitudes pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const roleLabel = rol === 'aprobador_jefe' ? 'Aprobador Jefe' : 'Aprobador Financiero';

  const statsCards = [
    {
      title: 'Pendientes de Aprobar',
      value: stats.pendientes.toString(),
      change: 'Requieren atención',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Aprobadas (Este Mes)',
      value: stats.aprobadas.toString(),
      change: 'Total aprobadas',
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Rechazadas (Este Mes)',
      value: stats.rechazadas.toString(),
      change: 'Total rechazadas',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Monto Total Pendiente',
      value: `$${stats.montoPendiente.toLocaleString('es-ES')}`,
      change: `${stats.pendientes} solicitudes`,
      icon: AlertCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
  ];

  const altaPrioridad = solicitudesPendientes.filter((s: any) => s.prioridad === 'alta').length;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Dashboard - {roleLabel}</h1>
        <p className="text-gray-600 mt-2">Solicitudes pendientes de aprobación</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">{stat.title}</p>
                    <h2 className="mt-2">{stat.value}</h2>
                    <p className="text-gray-500 mt-1">{stat.change}</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-4 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Pending Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes de Aprobación</CardTitle>
          <CardDescription>Solicitudes que requieren tu revisión</CardDescription>
        </CardHeader>
        <CardContent>
          {solicitudesPendientes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Solicitud</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Prioridad</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudesPendientes.map((solicitud) => {
                  const prioridad = prioridadBadge[solicitud.prioridad as keyof typeof prioridadBadge] || prioridadBadge.media;
                  return (
                    <TableRow key={solicitud.id}>
                      <TableCell>{solicitud.numero || solicitud.id}</TableCell>
                      <TableCell>{solicitud.usuario}</TableCell>
                      <TableCell>{solicitud.descripcion}</TableCell>
                      <TableCell>${solicitud.monto.toLocaleString('es-ES')}</TableCell>
                      <TableCell>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={prioridad.className}>
                          {prioridad.label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No hay solicitudes pendientes
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert */}
      {altaPrioridad > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-800">Tienes {altaPrioridad} solicitud{altaPrioridad > 1 ? 'es' : ''} de alta prioridad que requieren atención inmediata</p>
                <Button 
                  variant="link" 
                  className="text-orange-700 p-0 mt-2 h-auto"
                  onClick={() => {
                    const event = new CustomEvent('changeView', { detail: 'aprobaciones' });
                    window.dispatchEvent(event);
                  }}
                >
                  Ver solicitudes prioritarias
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
