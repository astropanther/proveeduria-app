import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { CheckCircle2, XCircle, Eye, Clock, AlertCircle } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { UserRole } from '../App';

interface AprobacionSolicitudesProps {
  userRole: UserRole;
}

interface Solicitud {
  id: string;
  numero: string;
  descripcion: string;
  usuario: string;
  monto: string;
  categoria: string;
  fecha: string;
  prioridad: 'alta' | 'media' | 'baja';
  justificacion: string;
}

const mockSolicitudes: Solicitud[] = [
  {
    id: '1',
    numero: 'SOL-2024-045',
    descripcion: 'Compra de equipos de oficina',
    usuario: 'Juan Pérez',
    monto: '$5,200',
    categoria: 'Equipamiento',
    fecha: '2024-06-15',
    prioridad: 'media',
    justificacion: 'Se requieren nuevos equipos para el área de ventas debido al aumento de personal.',
  },
  {
    id: '2',
    numero: 'SOL-2024-044',
    descripcion: 'Software de gestión empresarial',
    usuario: 'Ana González',
    monto: '$12,800',
    categoria: 'Software',
    fecha: '2024-06-14',
    prioridad: 'alta',
    justificacion: 'Sistema crítico para mejorar la eficiencia operativa del departamento.',
  },
  {
    id: '3',
    numero: 'SOL-2024-041',
    descripcion: 'Material de construcción',
    usuario: 'Luis Martín',
    monto: '$15,200',
    categoria: 'Materiales',
    fecha: '2024-06-13',
    prioridad: 'alta',
    justificacion: 'Materiales urgentes para proyecto en curso con fecha límite próxima.',
  },
  {
    id: '4',
    numero: 'SOL-2024-040',
    descripcion: 'Mobiliario de oficina',
    usuario: 'María López',
    monto: '$8,500',
    categoria: 'Mobiliario',
    fecha: '2024-06-12',
    prioridad: 'media',
    justificacion: 'Reemplazo de mobiliario desgastado en área administrativa.',
  },
  {
    id: '5',
    numero: 'SOL-2024-039',
    descripcion: 'Equipamiento tecnológico',
    usuario: 'Carlos Ruiz',
    monto: '$22,000',
    categoria: 'Tecnología',
    fecha: '2024-06-11',
    prioridad: 'alta',
    justificacion: 'Actualización de servidores para mejorar capacidad y seguridad.',
  },
];

const prioridadConfig = {
  alta: { label: 'Alta', className: 'bg-red-100 text-red-800' },
  media: { label: 'Media', className: 'bg-yellow-100 text-yellow-800' },
  baja: { label: 'Baja', className: 'bg-blue-100 text-blue-800' },
};

export function AprobacionSolicitudes({ userRole }: AprobacionSolicitudesProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(mockSolicitudes);
  const [selectedSolicitud, setSelectedSolicitud] = useState<Solicitud | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [motivoRechazo, setMotivoRechazo] = useState('');

  const handleApprove = () => {
    if (selectedSolicitud) {
      setSolicitudes(solicitudes.filter(s => s.id !== selectedSolicitud.id));
      setShowApproveDialog(false);
      setSelectedSolicitud(null);
    }
  };

  const handleReject = () => {
    if (selectedSolicitud && motivoRechazo.trim()) {
      setSolicitudes(solicitudes.filter(s => s.id !== selectedSolicitud.id));
      setShowRejectDialog(false);
      setSelectedSolicitud(null);
      setMotivoRechazo('');
    }
  };

  const openApproveDialog = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowApproveDialog(true);
  };

  const openRejectDialog = (solicitud: Solicitud) => {
    setSelectedSolicitud(solicitud);
    setShowRejectDialog(true);
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1>Aprobación de Solicitudes</h1>
        <p className="text-gray-600 mt-2">Solicitudes pendientes de tu aprobación</p>
      </div>

      {/* Alert */}
      <Card className="border-orange-500 bg-orange-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-orange-800">
                Tienes {solicitudes.filter(s => s.prioridad === 'alta').length} solicitudes de alta prioridad pendientes
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Pendientes</p>
                <h3 className="mt-1">{solicitudes.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Alta Prioridad</p>
                <h3 className="mt-1">{solicitudes.filter(s => s.prioridad === 'alta').length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Monto Total</p>
                <h3 className="mt-1">$63,700</h3>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Solicitud</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Prioridad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.map((solicitud) => {
                const prioridad = prioridadConfig[solicitud.prioridad];
                return (
                  <TableRow key={solicitud.id}>
                    <TableCell>{solicitud.numero}</TableCell>
                    <TableCell>{solicitud.descripcion}</TableCell>
                    <TableCell>{solicitud.usuario}</TableCell>
                    <TableCell>{solicitud.monto}</TableCell>
                    <TableCell>{new Date(solicitud.fecha).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={prioridad.className}>
                        {prioridad.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSolicitud(solicitud);
                          }}
                        >
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
        </CardContent>
      </Card>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aprobar Solicitud</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aprobar esta solicitud?
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitud && (
            <div className="space-y-3 py-4">
              <div>
                <p className="text-gray-600">Número de Solicitud:</p>
                <p>{selectedSolicitud.numero}</p>
              </div>
              <div>
                <p className="text-gray-600">Descripción:</p>
                <p>{selectedSolicitud.descripcion}</p>
              </div>
              <div>
                <p className="text-gray-600">Monto:</p>
                <p>{selectedSolicitud.monto}</p>
              </div>
              <div>
                <p className="text-gray-600">Justificación:</p>
                <p className="bg-gray-50 p-3 rounded-lg mt-1">{selectedSolicitud.justificacion}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Aprobar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rechazar Solicitud</DialogTitle>
            <DialogDescription>
              Por favor indica el motivo del rechazo
            </DialogDescription>
          </DialogHeader>
          {selectedSolicitud && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-gray-600">Número de Solicitud:</p>
                <p>{selectedSolicitud.numero}</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="motivo">Motivo del Rechazo *</Label>
                <Textarea
                  id="motivo"
                  placeholder="Explica por qué se rechaza esta solicitud..."
                  value={motivoRechazo}
                  onChange={(e) => setMotivoRechazo(e.target.value)}
                  rows={4}
                  required
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectDialog(false);
              setMotivoRechazo('');
            }}>
              Cancelar
            </Button>
            <Button
              onClick={handleReject}
              className="bg-red-600 hover:bg-red-700"
              disabled={!motivoRechazo.trim()}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Rechazar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}