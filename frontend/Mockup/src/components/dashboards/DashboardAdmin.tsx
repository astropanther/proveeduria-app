import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, FileText, CheckCircle2, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';

const statsCards = [
  {
    title: 'Usuarios Activos',
    value: '24',
    change: '+3 este mes',
    icon: Users,
  },
  {
    title: 'Solicitudes Totales',
    value: '156',
    change: '+12 esta semana',
    icon: FileText,
  },
  {
    title: 'Aprobadas',
    value: '98',
    change: '62.8% del total',
    icon: CheckCircle2,
  },
  {
    title: 'Pendientes',
    value: '34',
    change: '21.8% del total',
    icon: Clock,
  },
];

const solicitudesPorMes = [
  { mes: 'ENE', total: 45, aprobadas: 32, rechazadas: 8 },
  { mes: 'FEB', total: 52, aprobadas: 38, rechazadas: 10 },
  { mes: 'MAR', total: 48, aprobadas: 35, rechazadas: 9 },
  { mes: 'ABR', total: 61, aprobadas: 45, rechazadas: 11 },
  { mes: 'MAY', total: 58, aprobadas: 42, rechazadas: 12 },
  { mes: 'JUN', total: 65, aprobadas: 48, rechazadas: 13 },
];

const solicitudesPorEstado = [
  { name: 'Aprobadas', value: 98, color: '#ffffff' },
  { name: 'Pendientes', value: 34, color: '#666666' },
  { name: 'Rechazadas', value: 24, color: '#ff1744' },
];

const solicitudesRecientes = [
  { id: 'SOL-2024-045', usuario: 'Juan Pérez', monto: '$5,200', fecha: '2024-06-15', estado: 'pendiente' },
  { id: 'SOL-2024-044', usuario: 'Ana González', monto: '$12,800', fecha: '2024-06-14', estado: 'aprobada' },
  { id: 'SOL-2024-043', usuario: 'Carlos Ruiz', monto: '$3,450', fecha: '2024-06-14', estado: 'aprobada' },
  { id: 'SOL-2024-042', usuario: 'María López', monto: '$8,900', fecha: '2024-06-13', estado: 'rechazada' },
  { id: 'SOL-2024-041', usuario: 'Luis Martín', monto: '$15,200', fecha: '2024-06-13', estado: 'pendiente' },
];

const estadoBadge = {
  pendiente: { label: 'Pendiente', className: 'bg-white/5 text-gray-400 border-white/10' },
  aprobada: { label: 'Aprobada', className: 'bg-white/5 text-white border-white/10' },
  rechazada: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
};

export function DashboardAdmin() {
  return (
    <div className="p-16 space-y-16 bg-background">
      <div>
        <h1 className="text-foreground">Dashboard</h1>
        <div className="h-px w-32 bg-red-600 mb-4"></div>
        <p className="text-muted-foreground uppercase tracking-[0.2em] text-[0.7rem]">Resumen general del sistema</p>
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border border-border bg-card">
          <CardHeader className="pb-8">
            <CardTitle className="text-card-foreground tracking-[0.15em]">Solicitudes por Mes</CardTitle>
            <div className="h-px bg-border my-4"></div>
            <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem]">Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={solicitudesPorMes}>
                <CartesianGrid strokeDasharray="0" stroke="var(--border)" vertical={false} />
                <XAxis 
                  dataKey="mes" 
                  stroke="var(--muted-foreground)" 
                  style={{ fontSize: '10px', letterSpacing: '0.2em', fontWeight: 600 }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <YAxis 
                  stroke="var(--muted-foreground)" 
                  style={{ fontSize: '10px' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: 'var(--card-foreground)'
                  }} 
                  cursor={{ fill: 'var(--accent)' }}
                />
                <Legend 
                  wrapperStyle={{ 
                    fontSize: '10px', 
                    textTransform: 'uppercase', 
                    letterSpacing: '0.15em',
                    fontWeight: 600
                  }} 
                />
                <Bar dataKey="aprobadas" fill="var(--chart-2)" name="Aprobadas" />
                <Bar dataKey="rechazadas" fill="#ff1744" name="Rechazadas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-8">
            <CardTitle className="text-card-foreground tracking-[0.15em]">Distribución por Estado</CardTitle>
            <div className="h-px bg-border my-4"></div>
            <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem]">Estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={solicitudesPorEstado}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontSize: '11px', letterSpacing: '0.1em', fill: 'var(--card-foreground)' }}
                  stroke="var(--background)"
                  strokeWidth={2}
                >
                  {solicitudesPorEstado.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--card)', 
                    border: '1px solid var(--border)',
                    borderRadius: '0',
                    fontSize: '11px',
                    letterSpacing: '0.1em',
                    color: 'var(--card-foreground)'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests Table */}
      <Card className="border border-border bg-card">
        <CardHeader className="pb-8">
          <CardTitle className="text-card-foreground tracking-[0.15em]">Solicitudes Recientes</CardTitle>
          <div className="h-px bg-border my-4"></div>
          <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem]">Últimas solicitudes ingresadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">ID</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Usuario</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Monto</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Fecha</TableHead>
                <TableHead className="text-muted-foreground uppercase tracking-[0.15em] text-[0.65rem]">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudesRecientes.map((solicitud) => (
                <TableRow key={solicitud.id} className="border-border hover:bg-accent transition-colors">
                  <TableCell className="text-card-foreground font-mono text-sm tracking-wider">{solicitud.id}</TableCell>
                  <TableCell className="text-muted-foreground tracking-wide">{solicitud.usuario}</TableCell>
                  <TableCell className="text-card-foreground font-mono tracking-wider">{solicitud.monto}</TableCell>
                  <TableCell className="text-muted-foreground text-sm tracking-wide">{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${estadoBadge[solicitud.estado as keyof typeof estadoBadge].className} uppercase text-[0.65rem] tracking-[0.15em]`}
                    >
                      {estadoBadge[solicitud.estado as keyof typeof estadoBadge].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}