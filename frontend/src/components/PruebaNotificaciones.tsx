import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mail, Send, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { notificacionesAPI } from '../services/api';
import { UserRole } from '../App';

interface PruebaNotificacionesProps {
  userRole: UserRole;
}

const eventosDisponibles = [
  { value: 'creacion', label: 'Creación de Solicitud', desc: 'Cuando se crea una nueva solicitud' },
  { value: 'aprobacion', label: 'Aprobación', desc: 'Cuando se aprueba una solicitud' },
  { value: 'rechazo', label: 'Rechazo', desc: 'Cuando se rechaza una solicitud' },
  { value: 'anulacion', label: 'Anulación', desc: 'Cuando se anula una solicitud' },
];

export function PruebaNotificaciones({ userRole }: PruebaNotificacionesProps) {
  const [email, setEmail] = useState('');
  const [evento, setEvento] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<{
    enviado: boolean;
    modo?: string;
    email?: string;
    evento?: string;
    error?: string;
  } | null>(null);

  const handleEnviar = async () => {
    if (!email || !evento) {
      setResultado({
        enviado: false,
        error: 'Por favor completa todos los campos',
      });
      return;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setResultado({
        enviado: false,
        error: 'Por favor ingresa un email válido',
      });
      return;
    }

    setLoading(true);
    setResultado(null);

    try {
      const respuesta = await notificacionesAPI.enviar(email, evento);
      setResultado(respuesta);
    } catch (error: any) {
      console.error('Error al enviar notificación:', error);
      setResultado({
        enviado: false,
        error: error.message || 'Error al enviar notificación',
      });
    } finally {
      setLoading(false);
    }
  };

  const eventoSeleccionado = eventosDisponibles.find(e => e.value === evento);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificaciones</h1>
          <p className="text-gray-600 mt-2">PB-13: Envío de Notificaciones Automáticas</p>
        </div>
        <Mail className="h-8 w-8 text-blue-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enviar Notificación de Prueba</CardTitle>
          <CardDescription>
            Prueba el sistema de notificaciones enviando un email de prueba
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email del destinatario</Label>
            <Input
              id="email"
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="evento">Tipo de evento</Label>
            <Select value={evento} onValueChange={setEvento} disabled={loading}>
              <SelectTrigger id="evento">
                <SelectValue placeholder="Selecciona un tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                {eventosDisponibles.map((evt) => (
                  <SelectItem key={evt.value} value={evt.value}>
                    <div>
                      <div className="font-medium">{evt.label}</div>
                      <div className="text-xs text-gray-500">{evt.desc}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {eventoSeleccionado && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-2">
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Mensaje que se enviará:</p>
                  <p className="mt-1">
                    {eventoSeleccionado.value === 'creacion' && 'Tu solicitud ha sido creada correctamente.'}
                    {eventoSeleccionado.value === 'aprobacion' && '¡Tu solicitud ha sido aprobada!'}
                    {eventoSeleccionado.value === 'rechazo' && 'Lo sentimos, tu solicitud fue rechazada.'}
                    {eventoSeleccionado.value === 'anulacion' && 'Tu solicitud ha sido anulada.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleEnviar}
            disabled={loading || !email || !evento}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Enviar Notificación
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {resultado && (
        <Card className={resultado.enviado ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {resultado.enviado ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="flex-1">
                <p className={`font-semibold ${resultado.enviado ? 'text-green-800' : 'text-red-800'}`}>
                  {resultado.enviado ? 'Notificación enviada exitosamente' : 'Error al enviar notificación'}
                </p>
                {resultado.error && (
                  <p className="text-red-700 mt-1">{resultado.error}</p>
                )}
                {resultado.modo === 'desarrollo' && (
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
                    <p className="font-medium">Modo desarrollo activo</p>
                    <p className="mt-1">
                      No hay configuración de email. La notificación se registró en la consola del servidor.
                    </p>
                  </div>
                )}
                {resultado.enviado && resultado.email && resultado.evento && (
                  <div className="mt-2 text-sm text-gray-700">
                    <p><strong>Email:</strong> {resultado.email}</p>
                    <p><strong>Evento:</strong> {eventosDisponibles.find(e => e.value === resultado.evento)?.label || resultado.evento}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
