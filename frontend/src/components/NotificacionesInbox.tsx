import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, CheckCircle2, XCircle, AlertCircle, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { UserRole } from '../App';
import { solicitudesAPI, notificacionesAPI } from '../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';

interface NotificacionesInboxProps {
  userRole: UserRole;
}

interface Notificacion {
  id: string;
  tipo: 'creacion' | 'aprobacion' | 'rechazo' | 'anulacion';
  mensaje: string;
  fecha: string;
  solicitudNumero?: string;
  solicitudId?: number;
  leida: boolean;
}

export function NotificacionesInbox({ userRole }: NotificacionesInboxProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<{ id: number; numero: string } | null>(null);
  const [mensajeContacto, setMensajeContacto] = useState('');
  const [enviandoContacto, setEnviandoContacto] = useState(false);

  useEffect(() => {
    if (userRole === 'comprador') {
      loadNotificaciones();
    }
  }, [userRole]);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      // Obtener todas las solicitudes del comprador para generar notificaciones
      const solicitudes = await solicitudesAPI.getAll();
      
      // Generar notificaciones basadas en el estado de las solicitudes
      const notifs: Notificacion[] = solicitudes.map((s: any) => {
        let tipo: 'creacion' | 'aprobacion' | 'rechazo' | 'anulacion' = 'creacion';
        let mensaje = '';

        if (s.estado === 'Aprobada') {
          tipo = 'aprobacion';
          mensaje = `¡Tu solicitud ${s.numero} ha sido aprobada!`;
        } else if (s.estado === 'Rechazada') {
          tipo = 'rechazo';
          mensaje = `Tu solicitud ${s.numero} fue rechazada.${s.motivoRechazo ? ` Motivo: ${s.motivoRechazo}` : ''}`;
        } else if (s.estado === 'Anulada') {
          tipo = 'anulacion';
          mensaje = `Tu solicitud ${s.numero} ha sido anulada.`;
        } else {
          tipo = 'creacion';
          mensaje = `Tu solicitud ${s.numero} ha sido creada correctamente.`;
        }

        return {
          id: s.id.toString(),
          tipo,
          mensaje,
          fecha: s.fechaAprobacion || s.fechaRechazo || s.fechaAnulacion || s.fecha,
          solicitudNumero: s.numero,
          solicitudId: s.id,
          leida: false,
        };
      });

      // Ordenar por fecha (más recientes primero)
      notifs.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
      setNotificaciones(notifs);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactar = (solicitud: { id: number; numero: string }) => {
    setSelectedSolicitud(solicitud);
    setIsContactDialogOpen(true);
  };

  const handleEnviarContacto = async () => {
    if (!selectedSolicitud || !mensajeContacto.trim()) return;

    try {
      setEnviandoContacto(true);
      // Enviar notificación a admin y aprobadores
      await notificacionesAPI.enviar('admin@proveeduria.com', 'contacto', {
        solicitudNumero: selectedSolicitud.numero,
        mensaje: mensajeContacto,
      });
      
      setMensajeContacto('');
      setIsContactDialogOpen(false);
      setSelectedSolicitud(null);
      // Aquí podrías mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al enviar contacto:', error);
    } finally {
      setEnviandoContacto(false);
    }
  };

  const getIcono = (tipo: string) => {
    switch (tipo) {
      case 'aprobacion':
        return CheckCircle2;
      case 'rechazo':
        return XCircle;
      case 'anulacion':
        return AlertCircle;
      default:
        return Clock;
    }
  };

  const getColor = (tipo: string) => {
    switch (tipo) {
      case 'aprobacion':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rechazo':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'anulacion':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (userRole !== 'comprador') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Esta sección es solo para compradores</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mi Bandeja de Entrada</h1>
          <p className="text-gray-600 mt-2">Notificaciones sobre tus solicitudes</p>
        </div>
        <Mail className="h-8 w-8 text-blue-600" />
      </div>

      {notificaciones.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tienes notificaciones aún</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notificaciones.map((notif) => {
            const Icono = getIcono(notif.tipo);
            const colorClass = getColor(notif.tipo);

            return (
              <Card key={notif.id} className={`border ${colorClass}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icono className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notif.mensaje}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(notif.fecha).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        {!notif.leida && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            Nueva
                          </Badge>
                        )}
                      </div>
                      {notif.solicitudNumero && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContactar({
                              id: notif.solicitudId!,
                              numero: notif.solicitudNumero!,
                            })}
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            ¿Tienes una duda? Haz clic aquí
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialog de Contacto */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contactar sobre Solicitud {selectedSolicitud?.numero}</DialogTitle>
            <DialogDescription>
              Envía un mensaje a los administradores y aprobadores sobre esta solicitud
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="mensaje">Tu mensaje</Label>
              <Textarea
                id="mensaje"
                placeholder="Escribe tu pregunta o comentario aquí..."
                rows={4}
                value={mensajeContacto}
                onChange={(e) => setMensajeContacto(e.target.value)}
                disabled={enviandoContacto}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsContactDialogOpen(false);
                setMensajeContacto('');
              }}
              disabled={enviandoContacto}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleEnviarContacto}
              disabled={enviandoContacto || !mensajeContacto.trim()}
            >
              {enviandoContacto ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar Mensaje
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

