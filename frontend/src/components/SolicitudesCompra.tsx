import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Eye, Ban, Clock, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { UserRole } from '../App';
import { solicitudesAPI } from '../services/api';

interface SolicitudesCompraProps {
  userRole: UserRole;
}

interface Solicitud {
  id: number;
  numero: string;
  descripcion: string;
  usuario: string;
  usuarioEmail: string;
  monto: number;
  categoria: string;
  fecha: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Anulada';
  prioridad?: string;
  justificacion?: string;
}

const estadoConfig = {
  Pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-orange-100 text-orange-800' },
  Aprobada: { label: 'Aprobada', icon: CheckCircle2, className: 'bg-green-100 text-green-800' },
  Rechazada: { label: 'Rechazada', icon: XCircle, className: 'bg-red-100 text-red-800' },
  Anulada: { label: 'Anulada', icon: Ban, className: 'bg-gray-100 text-gray-800' },
};

const categorias = [
  'Equipamiento',
  'Software',
  'Materiales',
  'Mobiliario',
  'Tecnología',
  'Servicios',
  'Herramientas',
];

const prioridades = [
  { value: 'alta', label: 'Alta' },
  { value: 'media', label: 'Media' },
  { value: 'baja', label: 'Baja' },
];

export function SolicitudesCompra({ userRole }: SolicitudesCompraProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [justificacion, setJustificacion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canCreateSolicitud = userRole === 'admin' || userRole === 'comprador';

  useEffect(() => {
    cargarSolicitudes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterEstado]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Cargando solicitudes con filtro:', filterEstado);
      const estado = filterEstado === 'todos' ? undefined : filterEstado;
      const data = await solicitudesAPI.getAll({ estado });
      console.log('Solicitudes recibidas:', data);
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar solicitudes:', err);
      setError(err.message || 'Error al cargar solicitudes');
      setSolicitudes([]); // Asegurar que no quede undefined
    } finally {
      setLoading(false);
    }
  };

  const handleCrearSolicitud = async () => {
    if (!descripcion || !monto || !categoria) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      setError('El monto debe ser un número positivo');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await solicitudesAPI.create({
        descripcion,
        monto: montoNum,
        categoria,
        prioridad,
        justificacion: justificacion || undefined,
      });

      // Reset form
      setDescripcion('');
      setMonto('');
      setCategoria('');
      setPrioridad('media');
      setJustificacion('');
      setIsDialogOpen(false);

      // Reload solicitudes
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al crear solicitud:', err);
      setError(err.message || 'Error al crear solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnular = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas anular esta solicitud?')) {
      return;
    }

    try {
      await solicitudesAPI.anular(id.toString());
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al anular solicitud:', err);
      setError(err.message || 'Error al anular solicitud');
    }
  };

  const filteredSolicitudes = solicitudes.filter(s => {
    const matchesSearch = s.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const estadoCounts = {
    Pendiente: solicitudes.filter(s => s.estado === 'Pendiente').length,
    Aprobada: solicitudes.filter(s => s.estado === 'Aprobada').length,
    Rechazada: solicitudes.filter(s => s.estado === 'Rechazada').length,
    Anulada: solicitudes.filter(s => s.estado === 'Anulada').length,
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Solicitudes de Compra</h1>
          <p className="text-gray-600 mt-2">Gestión de solicitudes de compra</p>
        </div>
        {canCreateSolicitud && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Solicitud
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
                <DialogDescription>
                  Completa los datos de la solicitud de compra
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción *</Label>
                    <Input
                      id="descripcion"
                      placeholder="Descripción breve de la compra"
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select value={categoria} onValueChange={setCategoria} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto Total *</Label>
                    <Input
                      id="monto"
                      type="number"
                      placeholder="0.00"
                      value={monto}
                      onChange={(e) => setMonto(e.target.value)}
                      disabled={submitting}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prioridad">Prioridad</Label>
                    <Select value={prioridad} onValueChange={setPrioridad} disabled={submitting}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {prioridades.map(pri => (
                          <SelectItem key={pri.value} value={pri.value}>{pri.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificacion">Justificación</Label>
                  <Textarea
                    id="justificacion"
                    placeholder="Justifica la necesidad de esta compra..."
                    rows={3}
                    value={justificacion}
                    onChange={(e) => setJustificacion(e.target.value)}
                    disabled={submitting}
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                    {error}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={submitting}>
                  Cancelar
                </Button>
                <Button onClick={handleCrearSolicitud} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    'Crear Solicitud'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {error && !isDialogOpen && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(estadoConfig).map(([estado, config]) => {
          const Icon = config.icon;
          const count = estadoCounts[estado as keyof typeof estadoCounts];
          return (
            <Card key={estado}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  <div>
                    <p className="text-muted-foreground text-sm">{config.label}</p>
                    <h3 className="mt-1 text-2xl font-bold">{count}</h3>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Solicitudes</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Pendiente">Pendiente</SelectItem>
                  <SelectItem value="Aprobada">Aprobada</SelectItem>
                  <SelectItem value="Rechazada">Rechazada</SelectItem>
                  <SelectItem value="Anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar solicitud..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Cargando solicitudes...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={cargarSolicitudes}>
                Reintentar
              </Button>
            </div>
          ) : filteredSolicitudes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No hay solicitudes para mostrar
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Solicitud</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSolicitudes.map((solicitud) => {
                  const estado = estadoConfig[solicitud.estado];
                  const IconEstado = estado.icon;
                  return (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">{solicitud.numero}</TableCell>
                      <TableCell>{solicitud.descripcion}</TableCell>
                      <TableCell>{solicitud.usuario}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{solicitud.categoria}</Badge>
                      </TableCell>
                      <TableCell>${solicitud.monto.toLocaleString('es-ES')}</TableCell>
                      <TableCell>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={estado.className}>
                          <IconEstado className="h-3 w-3 mr-1" />
                          {estado.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCreateSolicitud && solicitud.estado === 'Pendiente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleAnular(solicitud.id)}
                            >
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
