import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { UserRole } from '../../App';

interface DashboardAprobadorProps {
  rol: UserRole;
}

const statsCards = [
  {
    title: 'Pendientes de Aprobar',
    value: '8',
    change: 'Requieren atención',
    icon: Clock,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Aprobadas (Este Mes)',
    value: '34',
    change: '+5 esta semana',
    icon: CheckCircle2,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Rechazadas (Este Mes)',
    value: '6',
    change: '15% del total',
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Monto Total Pendiente',
    value: '$142,500',
    change: '8 solicitudes',
    icon: AlertCircle,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
];

const solicitudesPendientes = [
  { id: 'SOL-2024-045', usuario: 'Juan Pérez', descripcion: 'Compra de equipos de oficina', monto: '$5,200', fecha: '2024-06-15', prioridad: 'media' },
  { id: 'SOL-2024-044', usuario: 'Ana González', descripcion: 'Software de gestión empresarial', monto: '$12,800', fecha: '2024-06-14', prioridad: 'alta' },
  { id: 'SOL-2024-041', usuario: 'Luis Martín', descripcion: 'Material de construcción', monto: '$15,200', fecha: '2024-06-13', prioridad: 'alta' },
  { id: 'SOL-2024-040', usuario: 'María López', descripcion: 'Mobiliario de oficina', monto: '$8,500', fecha: '2024-06-12', prioridad: 'media' },
  { id: 'SOL-2024-039', usuario: 'Carlos Ruiz', descripcion: 'Equipamiento tecnológico', monto: '$22,000', fecha: '2024-06-11', prioridad: 'alta' },
];

const prioridadBadge = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  baja: { label: 'Baja', className: 'bg-blue-100 text-blue-800' },
};

export function DashboardAprobador({ rol }: DashboardAprobadorProps) {
  const roleLabel = rol === 'aprobador_jefe' ? 'Aprobador Jefe' : 'Aprobador Financiero';

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Solicitud</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudesPendientes.map((solicitud) => {
                const prioridad = prioridadBadge[solicitud.prioridad as keyof typeof prioridadBadge];
                return (
                  <TableRow key={solicitud.id}>
                    <TableCell>{solicitud.id}</TableCell>
                    <TableCell>{solicitud.usuario}</TableCell>
                    <TableCell>{solicitud.descripcion}</TableCell>
                    <TableCell>{solicitud.monto}</TableCell>
                    <TableCell>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={prioridad.className}>
                        {prioridad.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" className="text-green-600 hover:bg-green-50">
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert */}
      <Card className="border-orange-500 bg-orange-50">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-800">Tienes 3 solicitudes de alta prioridad que requieren atención inmediata</p>
              <Button variant="link" className="text-orange-700 p-0 mt-2 h-auto">
                Ver solicitudes prioritarias
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
