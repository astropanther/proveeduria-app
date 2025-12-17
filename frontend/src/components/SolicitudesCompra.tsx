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
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [puedeDeshacerRechazo, setPuedeDeshacerRechazo] = useState(false);
  const [puedeDeshacerAprobacion, setPuedeDeshacerAprobacion] = useState(false);
  const [minutosRestantes, setMinutosRestantes] = useState(0);
  const [error, setError] = useState('');

  // Form state
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [categoria, setCategoria] = useState('');
  const [prioridad, setPrioridad] = useState('media');
  const [justificacion, setJustificacion] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState<{
    descripcion?: string;
    monto?: string;
    categoria?: string;
  }>({});

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

  // Validación en tiempo real
  const validateForm = () => {
    const errors: { descripcion?: string; monto?: string; categoria?: string } = {};
    
    if (!descripcion.trim()) {
      errors.descripcion = 'La descripción es requerida';
    } else if (descripcion.trim().length < 10) {
      errors.descripcion = 'La descripción debe tener al menos 10 caracteres';
    }
    
    if (!monto.trim()) {
      errors.monto = 'El monto es requerido';
    } else {
      const montoNum = parseFloat(monto);
      if (isNaN(montoNum)) {
        errors.monto = 'El monto debe ser un número válido';
      } else if (montoNum <= 0) {
        errors.monto = 'El monto debe ser mayor a 0';
      } else if (montoNum > 10000000) {
        errors.monto = 'El monto no puede ser mayor a $10,000,000';
      }
    }
    
    if (!categoria) {
      errors.categoria = 'La categoría es requerida';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCrearSolicitud = async () => {
    if (!validateForm()) {
      setError('Por favor corrige los errores en el formulario');
      return;
    }

    const montoNum = parseFloat(monto);

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
      setValidationErrors({});
      setError('');
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

  const handleVerDetalles = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setIsViewDialogOpen(true);
    
    // Verificar si se puede deshacer el rechazo (solo admin, solo rechazadas, dentro de 15 min)
    if (solicitud.estado === 'Rechazada' && userRole === 'admin' && solicitud.fechaRechazo) {
      const fechaRechazo = new Date(solicitud.fechaRechazo);
      const ahora = new Date();
      const minutosTranscurridos = (ahora.getTime() - fechaRechazo.getTime()) / (1000 * 60);
      const puedeDeshacer = minutosTranscurridos <= 15;
      setPuedeDeshacerRechazo(puedeDeshacer);
      setMinutosRestantes(Math.max(0, Math.round(15 - minutosTranscurridos)));
      
      // Actualizar contador cada minuto
      if (puedeDeshacer) {
        const interval = setInterval(() => {
          const ahora = new Date();
          const minutosTranscurridos = (ahora.getTime() - fechaRechazo.getTime()) / (1000 * 60);
          const minutosRest = Math.max(0, Math.round(15 - minutosTranscurridos));
          setMinutosRestantes(minutosRest);
          if (minutosRest === 0) {
            setPuedeDeshacerRechazo(false);
            clearInterval(interval);
          }
        }, 60000);
        
        return () => clearInterval(interval);
      }
    } else {
      setPuedeDeshacerRechazo(false);
    }

    // Verificar si se puede deshacer la aprobación (quien aprobó o admin, dentro de 15 min)
    if (solicitud.estado === 'Aprobada' && solicitud.fechaAprobacion) {
      const fechaAprobacion = new Date(solicitud.fechaAprobacion);
      const ahora = new Date();
      const minutosTranscurridos = (ahora.getTime() - fechaAprobacion.getTime()) / (1000 * 60);
      const puedeDeshacer = minutosTranscurridos <= 15;
      
      // Solo puede deshacer si es admin o aprobador que aprobó
      const puedeDeshacerPorRol = userRole === 'admin' || 
        userRole === 'aprobador_jefe' || 
        userRole === 'aprobador_financiero';
      
      setPuedeDeshacerAprobacion(puedeDeshacer && puedeDeshacerPorRol);
      setMinutosRestantes(Math.max(0, Math.round(15 - minutosTranscurridos)));
      
      // Actualizar contador cada minuto
      if (puedeDeshacer && puedeDeshacerPorRol) {
        const interval = setInterval(() => {
          const ahora = new Date();
          const minutosTranscurridos = (ahora.getTime() - fechaAprobacion.getTime()) / (1000 * 60);
          const minutosRest = Math.max(0, Math.round(15 - minutosTranscurridos));
          setMinutosRestantes(minutosRest);
          if (minutosRest === 0) {
            setPuedeDeshacerAprobacion(false);
            clearInterval(interval);
          }
        }, 60000);
        
        return () => clearInterval(interval);
      }
    } else {
      setPuedeDeshacerAprobacion(false);
    }
  };

  const handleDeshacerRechazo = async () => {
    if (!selectedSolicitud) return;
    
    if (!confirm('¿Estás seguro de que deseas deshacer el rechazo de esta solicitud? La solicitud volverá a estado Pendiente.')) {
      return;
    }

    try {
      await solicitudesAPI.deshacerRechazo(selectedSolicitud.id.toString());
      setPuedeDeshacerRechazo(false);
      setIsViewDialogOpen(false);
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al deshacer rechazo:', err);
      setError(err.message || 'Error al deshacer rechazo');
    }
  };

  const handleDeshacerAprobacion = async () => {
    if (!selectedSolicitud) return;
    
    if (!confirm('¿Estás seguro de que deseas deshacer la aprobación de esta solicitud? La solicitud volverá a estado Pendiente.')) {
      return;
    }

    try {
      await solicitudesAPI.deshacerAprobacion(selectedSolicitud.id.toString());
      setPuedeDeshacerAprobacion(false);
      setIsViewDialogOpen(false);
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al deshacer aprobación:', err);
      setError(err.message || 'Error al deshacer aprobación');
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
                      onChange={(e) => {
                        setDescripcion(e.target.value);
                        if (validationErrors.descripcion) {
                          validateForm();
                        }
                      }}
                      onBlur={validateForm}
                      disabled={submitting}
                      className={validationErrors.descripcion ? 'border-red-500' : ''}
                    />
                    {validationErrors.descripcion && (
                      <p className="text-sm text-red-600">{validationErrors.descripcion}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select 
                      value={categoria} 
                      onValueChange={(value) => {
                        setCategoria(value);
                        if (validationErrors.categoria) {
                          validateForm();
                        }
                      }} 
                      disabled={submitting}
                    >
                      <SelectTrigger className={validationErrors.categoria ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categorias.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {validationErrors.categoria && (
                      <p className="text-sm text-red-600">{validationErrors.categoria}</p>
                    )}
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
                      onChange={(e) => {
                        setMonto(e.target.value);
                        if (validationErrors.monto) {
                          validateForm();
                        }
                      }}
                      onBlur={validateForm}
                      disabled={submitting}
                      min="0"
                      step="0.01"
                      className={validationErrors.monto ? 'border-red-500' : ''}
                    />
                    {validationErrors.monto && (
                      <p className="text-sm text-red-600">{validationErrors.monto}</p>
                    )}
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
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleVerDetalles(solicitud)}
                            title="Ver detalles"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canCreateSolicitud && solicitud.estado === 'Pendiente' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                              onClick={() => handleAnular(solicitud.id)}
                              title="Anular solicitud"
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

      {/* Ver Detalles Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Solicitud</DialogTitle>
            <DialogDescription>
              Información completa de la solicitud
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitud && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">N° Solicitud</Label>
                  <p className="font-medium">{selectedSolicitud.numero}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Estado</Label>
                  <div className="mt-1">
                    <Badge variant="secondary" className={estadoConfig[selectedSolicitud.estado].className}>
                      {estadoConfig[selectedSolicitud.estado].label}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Usuario</Label>
                  <p className="font-medium">{selectedSolicitud.usuario}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Categoría</Label>
                  <p className="font-medium">{selectedSolicitud.categoria}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Monto</Label>
                  <p className="font-medium">${selectedSolicitud.monto.toLocaleString('es-ES')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{new Date(selectedSolicitud.fecha).toLocaleDateString('es-ES')}</p>
                </div>
                {selectedSolicitud.prioridad && (
                  <div>
                    <Label className="text-muted-foreground">Prioridad</Label>
                    <p className="font-medium capitalize">{selectedSolicitud.prioridad}</p>
                  </div>
                )}
              </div>
              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="mt-1">{selectedSolicitud.descripcion}</p>
              </div>
              {selectedSolicitud.justificacion && (
                <div>
                  <Label className="text-muted-foreground">Justificación</Label>
                  <p className="mt-1">{selectedSolicitud.justificacion}</p>
                </div>
              )}
              {selectedSolicitud.estado === 'Rechazada' && selectedSolicitud.motivoRechazo && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <Label className="text-muted-foreground text-red-800">Motivo de Rechazo</Label>
                  <p className="mt-1 text-red-700">{selectedSolicitud.motivoRechazo}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {puedeDeshacerRechazo && selectedSolicitud?.estado === 'Rechazada' && (
              <Button 
                variant="default" 
                onClick={handleDeshacerRechazo}
                className="bg-green-600 hover:bg-green-700"
              >
                Deshacer Rechazo ({minutosRestantes} min restantes)
              </Button>
            )}
            {puedeDeshacerAprobacion && selectedSolicitud?.estado === 'Aprobada' && (
              <Button 
                variant="default" 
                onClick={handleDeshacerAprobacion}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Deshacer Aprobación ({minutosRestantes} min restantes)
              </Button>
            )}
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
