import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, CheckCircle2, XCircle, AlertCircle, Clock, MessageCircle, Loader2 } from 'lucide-react';
import { UserRole, User } from '../App';
import { notificacionesAPI } from '../services/api';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';

interface NotificacionesInboxProps {
  userRole: UserRole;
  user?: User;
}

interface Notificacion {
  id: string;
  tipo: string;
  evento: string;
  titulo: string;
  mensaje: string;
  fechaCreacion: string;
  solicitudNumero?: string;
  solicitudId?: number | null;
  leida: boolean;
}

export function NotificacionesInbox({ userRole, user }: NotificacionesInboxProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedSolicitud, setSelectedSolicitud] = useState<{ id: number; numero: string } | null>(null);
  const [mensajeContacto, setMensajeContacto] = useState('');
  const [enviandoContacto, setEnviandoContacto] = useState(false);

  useEffect(() => {
    if (userRole === 'comprador') {
      loadNotificaciones();
      // Recargar cada 30 segundos
      const interval = setInterval(() => {
        loadNotificaciones();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      console.log('[NOTIFICACIONES INBOX] Cargando notificaciones para comprador...');
      // Obtener notificaciones desde la base de datos
      const notifs = await notificacionesAPI.getAll({ tipo: 'comprador' });
      console.log('[NOTIFICACIONES INBOX] Notificaciones recibidas:', notifs);
      
      // Mapear al formato esperado
      const notificacionesMapeadas: Notificacion[] = notifs.map((n: any) => ({
        id: n.id.toString(),
        tipo: n.tipo,
        evento: n.evento,
        titulo: n.titulo,
        mensaje: n.mensaje,
        fechaCreacion: n.fechaCreacion,
        solicitudNumero: n.solicitudNumero,
        solicitudId: n.solicitudId,
        leida: n.leida,
      }));

      console.log('[NOTIFICACIONES INBOX] Notificaciones mapeadas:', notificacionesMapeadas);
      setNotificaciones(notificacionesMapeadas);
    } catch (error: any) {
      console.error('[NOTIFICACIONES INBOX] Error al cargar notificaciones:', error);
      toast.error(error.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleMarcarComoLeida = async (id: string) => {
    try {
      await notificacionesAPI.marcarComoLeida(id);
      // Actualizar estado local
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
    } catch (error) {
      console.error('Error al marcar como leída:', error);
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
      console.log('[NOTIFICACIONES INBOX] Enviando consulta:', {
        solicitudNumero: selectedSolicitud.numero,
        solicitudId: selectedSolicitud.id,
        mensaje: mensajeContacto,
      });
      
      // Enviar notificación a admin y aprobadores usando el endpoint POST /notificaciones
      // El backend manejará el envío a todos los aprobadores y admin
      const compradorEmail = user?.email || 'comprador@proveeduria.com';
      const compradorNombre = user?.nombre || 'Comprador';
      
      await notificacionesAPI.enviar('admin@proveeduria.com', 'contacto', {
        solicitudNumero: selectedSolicitud.numero,
        solicitudId: selectedSolicitud.id,
        mensaje: mensajeContacto,
        compradorEmail: compradorEmail,
        compradorNombre: compradorNombre,
      });
      
      setMensajeContacto('');
      setIsContactDialogOpen(false);
      setSelectedSolicitud(null);
      toast.success('Mensaje enviado exitosamente. Te contactaremos pronto.');
    } catch (error: any) {
      console.error('[NOTIFICACIONES INBOX] Error al enviar contacto:', error);
      toast.error(error.message || 'Error al enviar mensaje');
    } finally {
      setEnviandoContacto(false);
    }
  };

  const getIcono = (evento: string) => {
    switch (evento) {
      case 'aprobacion':
        return CheckCircle2;
      case 'rechazo':
        return XCircle;
      case 'anulacion':
        return AlertCircle;
      case 'creacion':
        return Clock;
      default:
        return Mail;
    }
  };

  const getColor = (evento: string) => {
    switch (evento) {
      case 'aprobacion':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rechazo':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'anulacion':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'creacion':
        return 'text-blue-600 bg-blue-50 border-blue-200';
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
            const Icono = getIcono(notif.evento);
            const colorClass = getColor(notif.evento);

            return (
              <Card 
                key={notif.id} 
                className={`border ${colorClass} ${!notif.leida ? 'ring-2 ring-blue-200' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                onClick={() => !notif.leida && handleMarcarComoLeida(notif.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${colorClass}`}>
                      <Icono className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{notif.titulo}</p>
                          <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notif.fechaCreacion).toLocaleDateString('es-ES', {
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
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactar({
                                id: notif.solicitudId!,
                                numero: notif.solicitudNumero!,
                              });
                            }}
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

