import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { FileDown, FileSpreadsheet, Filter, BarChart3, TrendingUp, DollarSign, Calendar, Loader2, RefreshCw } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserRole } from '../App';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { reportesAPI, solicitudesAPI } from '../services/api';

interface ReportesProps {
  userRole: UserRole;
}

interface SolicitudReporte {
  id: number;
  numero: string;
  usuario: string;
  categoria: string;
  monto: number;
  fecha: string;
  estado: string;
}

const estadoConfig = {
  Pendiente: { className: 'bg-orange-100 text-orange-800' },
  Aprobada: { className: 'bg-green-100 text-green-800' },
  Rechazada: { className: 'bg-red-100 text-red-800' },
  Anulada: { className: 'bg-gray-100 text-gray-800' },
};

export function Reportes({ userRole }: ReportesProps) {
  const [filterEstado, setFilterEstado] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date.toISOString().split('T')[0];
  });
  const [fechaFin, setFechaFin] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [solicitudes, setSolicitudes] = useState<SolicitudReporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTipo, setLoadingTipo] = useState<'pdf' | 'excel' | 'ambos' | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [archivosGenerados, setArchivosGenerados] = useState<{ excel?: string; pdf?: string }>({});

  // Cargar solicitudes al montar y cuando cambian los filtros
  useEffect(() => {
    cargarSolicitudes();
  }, [filterEstado, fechaInicio, fechaFin, userRole]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      const estado = filterEstado === 'todos' ? undefined : filterEstado;
      
      // Aprobador financiero puede ver todas las solicitudes (no solo las suyas)
      // Admin también ve todas
      const data = await solicitudesAPI.getAll({ estado });
      
      // Filtrar por rango de fechas
      let filtered = Array.isArray(data) ? data : [];
      
      if (fechaInicio || fechaFin) {
        filtered = filtered.filter((s: any) => {
          const fechaSolicitud = new Date(s.fecha || s.fechaCreacion);
          const inicio = fechaInicio ? new Date(fechaInicio) : null;
          const fin = fechaFin ? new Date(fechaFin + 'T23:59:59') : null;
          
          if (inicio && fechaSolicitud < inicio) return false;
          if (fin && fechaSolicitud > fin) return false;
          return true;
        });
      }
      
      setSolicitudes(filtered);
    } catch (err: any) {
      console.error('Error al cargar solicitudes:', err);
      setError(err.message || 'Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerarArchivo = async (formato: 'excel' | 'pdf' | 'ambos') => {
    setLoadingTipo(formato);
    setError('');
    setSuccess('');

    try {
      const estado = filterEstado === 'todos' ? undefined : filterEstado;
      
      const resultado = await reportesAPI.generar({
        estado,
        fechaInicio,
        fechaFin,
        formato,
      });

      setArchivosGenerados(resultado.archivos);
      setSuccess(`Reporte generado exitosamente. Total: ${resultado.total} solicitudes`);

      // Descargar archivos automáticamente
      if (resultado.archivos) {
        setTimeout(async () => {
          try {
            if (resultado.archivos.excel) {
              await reportesAPI.descargar(resultado.archivos.excel);
            }
            if (resultado.archivos.pdf) {
              setTimeout(async () => {
                await reportesAPI.descargar(resultado.archivos.pdf!);
              }, 1000);
            }
          } catch (downloadError: any) {
            console.error('Error al descargar:', downloadError);
            setError(`Error al descargar archivos: ${downloadError.message}`);
          }
        }, 1000);
      }
    } catch (err: any) {
      console.error('Error al generar reporte:', err);
      setError(err.message || 'Error al generar reporte');
    } finally {
      setLoadingTipo(null);
    }
  };

  // Calcular estadísticas de las solicitudes filtradas
  const stats = {
    total: solicitudes.length,
    aprobadas: solicitudes.filter(s => s.estado === 'Aprobada').length,
    rechazadas: solicitudes.filter(s => s.estado === 'Rechazada').length,
    pendientes: solicitudes.filter(s => s.estado === 'Pendiente').length,
    montoTotal: solicitudes.reduce((sum, s) => sum + (s.monto || 0), 0),
    montoAprobado: solicitudes.filter(s => s.estado === 'Aprobada').reduce((sum, s) => sum + (s.monto || 0), 0),
    tasaAprobacion: solicitudes.length > 0 
      ? ((solicitudes.filter(s => s.estado === 'Aprobada').length / solicitudes.length) * 100).toFixed(1)
      : '0.0',
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reportes</h1>
          <p className="text-gray-600 mt-2">Análisis y reportes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => handleGenerarArchivo('pdf')}
            disabled={loadingTipo !== null}
          >
            {loadingTipo === 'pdf' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => handleGenerarArchivo('excel')}
            disabled={loadingTipo !== null}
          >
            {loadingTipo === 'excel' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="mr-2 h-4 w-4" />
            )}
            Exportar Excel
          </Button>
          <Button 
            variant="default" 
            onClick={() => handleGenerarArchivo('ambos')}
            disabled={loadingTipo !== null}
          >
            {loadingTipo === 'ambos' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportar Ambos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Total Solicitudes</p>
                <h3 className="mt-1">{stats.total}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Tasa Aprobación</p>
                <h3 className="mt-1">{stats.tasaAprobacion}%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Monto Aprobado</p>
                <h3 className="mt-1">${stats.montoAprobado.toLocaleString('es-ES')}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Monto Total</p>
                <h3 className="mt-1">${stats.montoTotal.toLocaleString('es-ES')}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
          <CardDescription>
            Los filtros actualizan la tabla automáticamente. Usa los botones de exportar para generar archivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado-filter">Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                  <SelectItem value="Rechazada">Rechazada</SelectItem>
                  <SelectItem value="Anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button 
                variant="outline"
                className="w-full"
                onClick={cargarSolicitudes}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Actualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800 font-semibold">Error:</p>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}
      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <p className="text-green-800 font-semibold">Éxito:</p>
            <p className="text-green-700">{success}</p>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Reporte</CardTitle>
          <CardDescription>
            Solicitudes que coinciden con los filtros aplicados ({solicitudes.length} encontradas)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <p className="text-muted-foreground">Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay solicitudes que coincidan con los filtros aplicados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Solicitud</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudes.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.numero}</TableCell>
                    <TableCell>{item.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.categoria}</Badge>
                    </TableCell>
                    <TableCell>${item.monto.toLocaleString('es-ES')}</TableCell>
                    <TableCell>{new Date(item.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={estadoConfig[item.estado as keyof typeof estadoConfig]?.className || 'bg-gray-100 text-gray-800'}
                      >
                        {item.estado}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
