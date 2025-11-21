import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Eye, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { UserRole } from '../App';
import { solicitudesAPI } from '../services/api';

interface AprobacionSolicitudesProps {
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
  prioridad: 'alta' | 'media' | 'baja';
  justificacion: string;
  estado: 'Pendiente' | 'Aprobada' | 'Rechazada' | 'Anulada';
  aprobadorJefe?: number;
  aprobadorFinanciero?: number;
}

const prioridadConfig = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  baja: { label: 'Baja', className: 'bg-blue-100 text-blue-800' },
};

export function AprobacionSolicitudes({ userRole }: AprobacionSolicitudesProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canApprove = userRole === 'admin' || userRole === 'aprobador_jefe' || userRole === 'aprobador_financiero';

  useEffect(() => {
    if (canApprove) {
      cargarSolicitudes();
    }
  }, [canApprove]);

  const cargarSolicitudes = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Cargando solicitudes pendientes para aprobación...');
      const data = await solicitudesAPI.getAll({ estado: 'Pendiente' });
      console.log('Solicitudes pendientes recibidas:', data);
      setSolicitudes(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error al cargar solicitudes:', err);
      setError(err.message || 'Error al cargar solicitudes');
      setSolicitudes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedSolicitud) return;

    try {
      setSubmitting(true);
      setError('');
      await solicitudesAPI.aprobar(selectedSolicitud.id.toString());
      setShowApproveDialog(false);
      setSelectedSolicitud(null);
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al aprobar solicitud:', err);
      setError(err.message || 'Error al aprobar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedSolicitud || !motivoRechazo.trim()) {
      setError('Por favor ingresa el motivo del rechazo');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await solicitudesAPI.rechazar(selectedSolicitud.id.toString(), motivoRechazo);
      setShowRejectDialog(false);
      setSelectedSolicitud(null);
      setMotivoRechazo('');
      await cargarSolicitudes();
    } catch (err: any) {
      console.error('Error al rechazar solicitud:', err);
      setError(err.message || 'Error al rechazar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  const openApproveDialog = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowApproveDialog(true);
    setError('');
  };

  const openRejectDialog = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowRejectDialog(true);
    setMotivoRechazo('');
    setError('');
  };

  if (!canApprove) {
    return (
      <div className="p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">No tienes permiso para aprobar solicitudes</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const solicitudesAltaPrioridad = solicitudes.filter(s => s.prioridad === 'alta');
  const montoTotal = solicitudes.reduce((sum, s) => sum + s.monto, 0);

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Aprobación de Solicitudes</h1>
        <p className="text-gray-600 mt-2">Solicitudes pendientes de tu aprobación</p>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Alert */}
      {solicitudesAltaPrioridad.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-orange-800 font-medium">
                  Tienes {solicitudesAltaPrioridad.length} solicitudes de alta prioridad pendientes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground text-sm">Pendientes</p>
                <h3 className="mt-1 text-2xl font-bold">{solicitudes.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground text-sm">Alta Prioridad</p>
                <h3 className="mt-1 text-2xl font-bold">{solicitudesAltaPrioridad.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground text-sm">Monto Total</p>
                <h3 className="mt-1 text-2xl font-bold">${montoTotal.toLocaleString('es-ES')}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes</CardTitle>
          <CardDescription>Revisa y aprueba o rechaza las solicitudes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col justify-center items-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mb-2" />
              <p className="text-sm text-muted-foreground">Cargando solicitudes...</p>
            </div>
          ) : solicitudes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No hay solicitudes pendientes</p>
              <p className="text-sm text-muted-foreground mt-2">Las solicitudes pendientes aparecerán aquí cuando estén disponibles</p>
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
                  <TableHead>Prioridad</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudes.map((solicitud) => {
                  const prioridad = prioridadConfig[solicitud.prioridad] || prioridadConfig.media;
                  return (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-medium">{solicitud.numero}</TableCell>
                      <TableCell>{solicitud.descripcion}</TableCell>
                      <TableCell>{solicitud.usuario}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{solicitud.categoria}</Badge>
                      </TableCell>
                      <TableCell>${solicitud.monto.toLocaleString('es-ES')}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={prioridad.className}>
                          {prioridad.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openApproveDialog(solicitud)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => openApproveDialog(solicitud)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                            onClick={() => openRejectDialog(solicitud)}
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
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

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Aprobar Solicitud</DialogTitle>
            <DialogDescription>
              Revisa los detalles de la solicitud antes de aprobarla
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
                  <Label className="text-muted-foreground">Prioridad</Label>
                  <Badge variant="secondary" className={prioridadConfig[selectedSolicitud.prioridad].className}>
                    {prioridadConfig[selectedSolicitud.prioridad].label}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground">Fecha</Label>
                  <p className="font-medium">{new Date(selectedSolicitud.fecha).toLocaleDateString('es-ES')}</p>
                </div>
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
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aprobando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Aprobar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Indica el motivo del rechazo de la solicitud
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
                  <Label className="text-muted-foreground">Monto</Label>
                  <p className="font-medium">${selectedSolicitud.monto.toLocaleString('es-ES')}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Descripción</Label>
                <p className="mt-1">{selectedSolicitud.descripcion}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del rechazo *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  rows={4}
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  disabled={submitting}
                />
              </div>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                  {error}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={submitting}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={submitting || !motivoRechazo.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rechazando...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Rechazar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
