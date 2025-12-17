import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Mail, CheckCircle2, XCircle, AlertCircle, Clock, FileText, Loader2, CheckCheck } from 'lucide-react';
import { UserRole } from '../App';
import { notificacionesAPI, solicitudesAPI } from '../services/api';
import { toast } from 'sonner';

interface NotificacionesAprobadorProps {
  userRole: UserRole;
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
  detalles?: any;
}

export function NotificacionesAprobador({ userRole }: NotificacionesAprobadorProps) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [noLeidasCount, setNoLeidasCount] = useState(0);

  useEffect(() => {
    if (userRole === 'aprobador_jefe' || userRole === 'aprobador_financiero' || userRole === 'admin') {
      loadNotificaciones();
      loadNoLeidasCount();
      // Recargar cada 30 segundos
      const interval = setInterval(() => {
        loadNotificaciones();
        loadNoLeidasCount();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [userRole]);

  const loadNotificaciones = async () => {
    try {
      setLoading(true);
      console.log('[NOTIFICACIONES APROBADOR] Cargando notificaciones...');
      console.log('[NOTIFICACIONES APROBADOR] Rol del usuario:', userRole);
      
      // El backend maneja el filtrado automáticamente:
      // - Admin: ve todas sus notificaciones (sin filtrar por tipo)
      // - Aprobadores: solo ven sus notificaciones de tipo 'aprobador'
      // No necesitamos filtrar por tipo en el frontend, el backend lo hace por userId
      const filters: any = { limite: 50 };
      
      // Solo si NO es admin, podemos especificar el tipo para optimizar
      // pero el backend ya filtra por userId, así que esto es opcional
      if (userRole !== 'admin') {
        filters.tipo = 'aprobador';
      }
      
      const notifs = await notificacionesAPI.getAll(filters);
      console.log('[NOTIFICACIONES APROBADOR] Notificaciones recibidas del API:', notifs);
      console.log('[NOTIFICACIONES APROBADOR] Cantidad de notificaciones:', notifs.length);
      
      // Mapear al formato esperado
      const notificacionesMapeadas: Notificacion[] = notifs.map((n: any) => {
        console.log('[NOTIFICACIONES APROBADOR] Mapeando notificación:', {
          id: n.id,
          tipo: n.tipo,
          evento: n.evento,
          titulo: n.titulo,
          detalles: n.detalles,
        });
        
        return {
          id: n.id.toString(),
          tipo: n.tipo,
          evento: n.evento,
          titulo: n.titulo,
          mensaje: n.mensaje,
          fechaCreacion: n.fechaCreacion,
          solicitudNumero: n.solicitudNumero,
          solicitudId: n.solicitudId,
          leida: n.leida,
          detalles: n.detalles,
        };
      });

      console.log('[NOTIFICACIONES APROBADOR] Notificaciones mapeadas:', notificacionesMapeadas);
      console.log('[NOTIFICACIONES APROBADOR] Total notificaciones a mostrar:', notificacionesMapeadas.length);
      setNotificaciones(notificacionesMapeadas);
    } catch (error: any) {
      console.error('[NOTIFICACIONES APROBADOR] Error al cargar notificaciones:', error);
      toast.error(error.message || 'Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const loadNoLeidasCount = async () => {
    try {
      const result = await notificacionesAPI.getNoLeidas();
      setNoLeidasCount(result.count);
    } catch (error) {
      console.error('Error al contar no leídas:', error);
    }
  };

  const handleMarcarComoLeida = async (id: string) => {
    try {
      await notificacionesAPI.marcarComoLeida(id);
      setNotificaciones(prev => 
        prev.map(n => n.id === id ? { ...n, leida: true } : n)
      );
      setNoLeidasCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error al marcar como leída:', error);
    }
  };

  const handleMarcarTodasComoLeidas = async () => {
    try {
      await notificacionesAPI.marcarTodasComoLeidas();
      setNotificaciones(prev => prev.map(n => ({ ...n, leida: true })));
      setNoLeidasCount(0);
      toast.success('Todas las notificaciones marcadas como leídas');
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error);
      toast.error('Error al marcar todas como leídas');
    }
  };

  const handleVerSolicitud = async (solicitudId: number) => {
    try {
      // Disparar evento para cambiar a la vista de solicitudes
      const event = new CustomEvent('changeView', { detail: 'solicitudes' });
      window.dispatchEvent(event);
      // También podríamos abrir el detalle de la solicitud específica
      toast.info('Redirigiendo a la solicitud...');
    } catch (error) {
      console.error('Error al ver solicitud:', error);
    }
  };

  const getIcono = (evento: string) => {
    switch (evento) {
      case 'nueva_solicitud':
        return FileText;
      case 'aprobacion':
        return CheckCircle2;
      case 'rechazo':
        return XCircle;
      case 'anulacion':
        return AlertCircle;
      case 'contacto':
        return Mail;
      default:
        return Clock;
    }
  };

  const getColor = (evento: string) => {
    switch (evento) {
      case 'nueva_solicitud':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'aprobacion':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'rechazo':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'anulacion':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      case 'contacto':
        return 'text-purple-600 bg-purple-50 border-purple-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  if (userRole !== 'aprobador_jefe' && userRole !== 'aprobador_financiero' && userRole !== 'admin') {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">Esta sección es solo para aprobadores y administradores</p>
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
          <h1 className="text-3xl font-bold">Bandeja de Notificaciones</h1>
          <p className="text-gray-600 mt-2">
            {userRole === 'admin' 
              ? 'Todas las notificaciones del sistema' 
              : 'Solicitudes nuevas, acciones realizadas y consultas'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {noLeidasCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {noLeidasCount} nueva{noLeidasCount !== 1 ? 's' : ''}
            </Badge>
          )}
          {notificaciones.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarcarTodasComoLeidas}
              disabled={noLeidasCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como leídas
            </Button>
          )}
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
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
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-lg">{notif.titulo}</p>
                            {userRole === 'admin' && notif.tipo && (
                              <Badge variant="outline" className="text-xs">
                                {notif.tipo === 'comprador' ? 'Comprador' : 'Aprobador'}
                              </Badge>
                            )}
                            {!notif.leida && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                Nueva
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">{notif.mensaje}</p>
                          
                          {/* Mostrar detalles adicionales */}
                          {notif.detalles && (
                            <div className="mt-3 space-y-1">
                              {notif.detalles.monto && (
                                <p className="text-sm font-semibold text-gray-700">
                                  Monto: ${parseFloat(notif.detalles.monto).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </p>
                              )}
                              {notif.detalles.usuario && (
                                <p className="text-sm text-gray-600">
                                  Usuario: {notif.detalles.usuario}
                                </p>
                              )}
                              {notif.detalles.descripcion && (
                                <p className="text-sm text-gray-600">
                                  Descripción: {notif.detalles.descripcion}
                                </p>
                              )}
                              {notif.detalles.mensaje && notif.evento === 'contacto' && (
                                <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
                                  <p className="text-xs font-semibold text-purple-800 mb-1">
                                    Consulta de {notif.detalles.compradorNombre || 'Comprador'}
                                    {notif.detalles.compradorEmail && ` (${notif.detalles.compradorEmail})`}
                                  </p>
                                  <p className="text-sm text-purple-700">{notif.detalles.mensaje}</p>
                                  {notif.detalles.solicitudNumero && (
                                    <p className="text-xs text-purple-600 mt-1">
                                      Solicitud: {notif.detalles.solicitudNumero}
                                    </p>
                                  )}
                                </div>
                              )}
                              {notif.detalles.aprobador && (
                                <p className="text-sm text-gray-600">
                                  Aprobador: {notif.detalles.aprobador}
                                </p>
                              )}
                              {notif.detalles.motivo && (
                                <p className="text-sm text-red-600">
                                  Motivo: {notif.detalles.motivo}
                                </p>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs text-gray-500 mt-3">
                            {new Date(notif.fechaCreacion).toLocaleDateString('es-ES', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                      </div>
                      {notif.solicitudNumero && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (notif.solicitudId) {
                                handleVerSolicitud(notif.solicitudId);
                              }
                            }}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Solicitud {notif.solicitudNumero}
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
    </div>
  );
}

