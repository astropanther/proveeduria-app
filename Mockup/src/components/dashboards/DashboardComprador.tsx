import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { FileText, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

const statsCards = [
  {
    title: 'Mis Solicitudes',
    value: '18',
    change: 'Total enviadas',
    icon: FileText,
  },
  {
    title: 'Pendientes',
    value: '5',
    change: 'En revisión',
    icon: Clock,
  },
  {
    title: 'Aprobadas',
    value: '11',
    change: '61% de éxito',
    icon: CheckCircle2,
  },
  {
    title: 'Rechazadas',
    value: '2',
    change: '11% del total',
    icon: XCircle,
  },
];

const misSolicitudes = [
  { id: 'SOL-2024-045', descripcion: 'Compra de equipos de oficina', monto: '$5,200', fecha: '2024-06-15', estado: 'pendiente' },
  { id: 'SOL-2024-041', descripcion: 'Material de construcción', monto: '$15,200', fecha: '2024-06-13', estado: 'pendiente' },
  { id: 'SOL-2024-038', descripcion: 'Mobiliario para sala de juntas', monto: '$8,500', fecha: '2024-06-10', estado: 'aprobada' },
  { id: 'SOL-2024-035', descripcion: 'Suministros de limpieza', monto: '$1,200', fecha: '2024-06-08', estado: 'aprobada' },
  { id: 'SOL-2024-032', descripcion: 'Equipos de cómputo', monto: '$22,000', fecha: '2024-06-05', estado: 'rechazada' },
];

const estadoBadge = {
  pendiente: { label: 'Pendiente', className: 'bg-white/5 text-gray-400 border-white/10', icon: Clock },
  aprobada: { label: 'Aprobada', className: 'bg-white/5 text-white border-white/10', icon: CheckCircle2 },
  rechazada: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500 border-red-500/20', icon: XCircle },
};

export function DashboardComprador() {
  return (
    <div className="p-16 space-y-16 bg-background">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-foreground">Dashboard</h1>
          <div className="h-px w-32 bg-red-600 mb-4"></div>
          <p className="text-muted-foreground uppercase tracking-[0.2em] text-[0.7rem]">Estado de mis solicitudes</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white border-0 h-14 px-8 tracking-[0.2em]">
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
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">ID</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Descripción</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Monto</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Fecha</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Estado</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem] text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {misSolicitudes.map((solicitud) => {
                const estado = estadoBadge[solicitud.estado as keyof typeof estadoBadge];
                const IconEstado = estado.icon;
                return (
                  <TableRow key={solicitud.id} className="border-border hover:bg-accent transition-colors">
                    <TableCell className="text-card-foreground font-mono text-sm tracking-wider">{solicitud.id}</TableCell>
                    <TableCell className="text-muted-foreground tracking-wide">{solicitud.descripcion}</TableCell>
                    <TableCell className="text-card-foreground font-mono tracking-wider">{solicitud.monto}</TableCell>
                    <TableCell className="text-muted-foreground text-sm tracking-wide">{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`${estado.className} uppercase text-[0.65rem] tracking-[0.15em]`}>
                        <IconEstado className="h-3 w-3 mr-1.5" strokeWidth={1.5} />
                        {estado.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground hover:bg-accent tracking-wider text-[0.65rem]">
                        Ver Detalles
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
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
            <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border h-14 tracking-[0.1em] text-[0.7rem]">
              <FileText className="h-4 w-4 mr-4" strokeWidth={1.5} />
              Crear Nueva Solicitud
            </Button>
            <Button variant="outline" className="w-full justify-start border-border text-muted-foreground hover:text-foreground hover:bg-accent hover:border-border h-14 tracking-[0.1em] text-[0.7rem]">
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