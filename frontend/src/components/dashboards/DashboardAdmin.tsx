import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Users, FileText, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { dashboardAPI } from '../../services/api';

const estadoBadge = {
  pendiente: { label: 'Pendiente', className: 'bg-white/5 text-gray-400 border-white/10' },
  aprobada: { label: 'Aprobada', className: 'bg-white/5 text-white border-white/10' },
  rechazada: { label: 'Rechazada', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
  anulada: { label: 'Anulada', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' },
};

export function DashboardAdmin() {
  const [loading, setLoading] = useState(true);
  const [resumen, setResumen] = useState<any>({
    solicitudes: {
      total: 0,
      pendientes: 0,
      aprobadas: 0,
      rechazadas: 0,
      anuladas: 0,
      montoTotal: 0,
      montoPendiente: 0,
      montoAprobado: 0,
    },
    usuarios: {
      total: 0,
      activos: 0,
    },
  });
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [recientes, setRecientes] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Cargando datos del dashboard...');
      const [resumenData, estadisticasData, recientesData] = await Promise.all([
        dashboardAPI.getResumen().catch(err => {
          console.error('Error al obtener resumen:', err);
          return {
            solicitudes: {
              total: 0,
              pendientes: 0,
              aprobadas: 0,
              rechazadas: 0,
              anuladas: 0,
              montoTotal: 0,
              montoPendiente: 0,
              montoAprobado: 0,
            },
            usuarios: {
              total: 0,
              activos: 0,
            },
          };
        }),
        dashboardAPI.getEstadisticas().catch(err => {
          console.error('Error al obtener estadísticas:', err);
          return [];
        }),
        dashboardAPI.getRecientes(5).catch(err => {
          console.error('Error al obtener recientes:', err);
          return [];
        }),
      ]);
      console.log('Datos cargados:', { resumenData, estadisticasData, recientesData });
      // Asegurar que siempre tengamos un objeto con la estructura correcta
      if (resumenData && resumenData.solicitudes && resumenData.usuarios) {
        setResumen(resumenData);
      } else {
        // Si no hay datos, establecer valores por defecto
        console.warn('No se recibieron datos del resumen, usando valores por defecto');
        setResumen({
          solicitudes: {
            total: 0,
            pendientes: 0,
            aprobadas: 0,
            rechazadas: 0,
            anuladas: 0,
            montoTotal: 0,
            montoPendiente: 0,
            montoAprobado: 0,
          },
          usuarios: {
            total: 0,
            activos: 0,
          },
        });
      }
      setEstadisticas(Array.isArray(estadisticasData) ? estadisticasData : []);
      setRecientes(Array.isArray(recientesData) ? recientesData : []);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Si está cargando, mostrar spinner
  if (loading) {
    return (
      <div className="p-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Cargando datos del dashboard...</p>
        </div>
      </div>
    );
  }


  const statsCards = [
    {
      title: 'Usuarios Activos',
      value: resumen.usuarios.activos.toString(),
      change: `${resumen.usuarios.total} total`,
      icon: Users,
    },
    {
      title: 'Solicitudes Totales',
      value: resumen.solicitudes.total.toString(),
      change: `${resumen.solicitudes.pendientes} pendientes`,
      icon: FileText,
    },
    {
      title: 'Aprobadas',
      value: resumen.solicitudes.aprobadas.toString(),
      change: resumen.solicitudes.total > 0 
        ? `${((resumen.solicitudes.aprobadas / resumen.solicitudes.total) * 100).toFixed(1)}% del total`
        : '0% del total',
      icon: CheckCircle2,
    },
    {
      title: 'Pendientes',
      value: resumen.solicitudes.pendientes.toString(),
      change: resumen.solicitudes.total > 0
        ? `${((resumen.solicitudes.pendientes / resumen.solicitudes.total) * 100).toFixed(1)}% del total`
        : '0% del total',
      icon: Clock,
    },
  ];

  const solicitudesPorEstado = [
    { name: 'Aprobadas', value: resumen.solicitudes.aprobadas, color: '#10b981' },
    { name: 'Pendientes', value: resumen.solicitudes.pendientes, color: '#f59e0b' },
    { name: 'Rechazadas', value: resumen.solicitudes.rechazadas, color: '#ef4444' },
    { name: 'Anuladas', value: resumen.solicitudes.anuladas, color: '#6b7280' },
  ].filter(item => item.value > 0);

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
            {estadisticas.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={estadisticas}>
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
                  <Bar dataKey="aprobadas" fill="#10b981" name="Aprobadas" />
                  <Bar dataKey="rechazadas" fill="#ef4444" name="Rechazadas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-border bg-card">
          <CardHeader className="pb-8">
            <CardTitle className="text-card-foreground tracking-[0.15em]">Distribución por Estado</CardTitle>
            <div className="h-px bg-border my-4"></div>
            <CardDescription className="text-muted-foreground uppercase tracking-[0.2em] text-[0.65rem]">Estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            {solicitudesPorEstado.length > 0 ? (
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
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No hay datos disponibles
              </div>
            )}
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
          {recientes.length > 0 ? (
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
                {recientes.map((solicitud) => (
                  <TableRow key={solicitud.id} className="border-border hover:bg-accent transition-colors">
                    <TableCell className="text-card-foreground font-mono text-sm tracking-wider">{solicitud.id}</TableCell>
                    <TableCell className="text-muted-foreground tracking-wide">{solicitud.usuario}</TableCell>
                    <TableCell className="text-card-foreground font-mono tracking-wider">{solicitud.monto}</TableCell>
                    <TableCell className="text-muted-foreground text-sm tracking-wide">{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`${estadoBadge[solicitud.estado as keyof typeof estadoBadge]?.className || 'bg-gray-500/10 text-gray-500'} uppercase text-[0.65rem] tracking-[0.15em]`}
                      >
                        {estadoBadge[solicitud.estado as keyof typeof estadoBadge]?.label || solicitud.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No hay solicitudes recientes
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
