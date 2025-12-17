import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Eye, Trash2, Clock, CheckCircle2, XCircle, Ban } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { UserRole } from '../App';

interface SolicitudesCompraProps {
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
  estado: 'pendiente' | 'aprobada' | 'rechazada' | 'anulada';
}

const mockSolicitudes: Solicitud[] = [
  { id: '1', numero: 'SOL-2024-045', descripcion: 'Compra de equipos de oficina', usuario: 'Juan Pérez', monto: '$5,200', categoria: 'Equipamiento', fecha: '2024-06-15', estado: 'pendiente' },
  { id: '2', numero: 'SOL-2024-044', descripcion: 'Software de gestión empresarial', usuario: 'Ana González', monto: '$12,800', categoria: 'Software', fecha: '2024-06-14', estado: 'aprobada' },
  { id: '3', numero: 'SOL-2024-043', descripcion: 'Material de construcción', usuario: 'Carlos Ruiz', monto: '$8,450', categoria: 'Materiales', fecha: '2024-06-14', estado: 'aprobada' },
  { id: '4', numero: 'SOL-2024-042', descripcion: 'Mobiliario de oficina', usuario: 'María López', monto: '$6,900', categoria: 'Mobiliario', fecha: '2024-06-13', estado: 'rechazada' },
  { id: '5', numero: 'SOL-2024-041', descripcion: 'Equipamiento tecnológico', usuario: 'Luis Martín', monto: '$15,200', categoria: 'Tecnología', fecha: '2024-06-13', estado: 'pendiente' },
  { id: '6', numero: 'SOL-2024-040', descripcion: 'Suministros de limpieza', usuario: 'Juan Pérez', monto: '$1,200', categoria: 'Servicios', fecha: '2024-06-12', estado: 'aprobada' },
  { id: '7', numero: 'SOL-2024-039', descripcion: 'Herramientas de trabajo', usuario: 'Ana González', monto: '$3,450', categoria: 'Herramientas', fecha: '2024-06-11', estado: 'anulada' },
];

const estadoConfig = {
  pendiente: { label: 'Pendiente', icon: Clock, className: 'bg-orange-100 text-orange-800' },
  aprobada: { label: 'Aprobada', icon: CheckCircle2, className: 'bg-green-100 text-green-800' },
  rechazada: { label: 'Rechazada', icon: XCircle, className: 'bg-red-100 text-red-800' },
  anulada: { label: 'Anulada', icon: Ban, className: 'bg-gray-100 text-gray-800' },
};

export function SolicitudesCompra({ userRole }: SolicitudesCompraProps) {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(mockSolicitudes);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredSolicitudes = solicitudes.filter(s => {
    const matchesSearch = s.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         s.usuario.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || s.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  const canCreateSolicitud = userRole === 'admin' || userRole === 'comprador';

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Solicitudes de Compra</h1>
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
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Nueva Solicitud de Compra</DialogTitle>
                <DialogDescription>
                  Completa los datos de la solicitud de compra
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="descripcion">Descripción</Label>
                    <Input id="descripcion" placeholder="Descripción breve de la compra" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoría</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="equipamiento">Equipamiento</SelectItem>
                        <SelectItem value="software">Software</SelectItem>
                        <SelectItem value="materiales">Materiales</SelectItem>
                        <SelectItem value="mobiliario">Mobiliario</SelectItem>
                        <SelectItem value="tecnologia">Tecnología</SelectItem>
                        <SelectItem value="servicios">Servicios</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proveedor">Proveedor</Label>
                    <Input id="proveedor" placeholder="Nombre del proveedor" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="monto">Monto Total</Label>
                    <Input id="monto" type="number" placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Items de la Solicitud</Label>
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-5">
                        <Input placeholder="Descripción del ítem" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Cantidad" type="number" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Precio Unit." type="number" />
                      </div>
                      <div className="col-span-2">
                        <Input placeholder="Subtotal" disabled />
                      </div>
                      <div className="col-span-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="justificacion">Justificación</Label>
                  <Textarea
                    id="justificacion"
                    placeholder="Justifica la necesidad de esta compra..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={() => setIsDialogOpen(false)}>Crear Solicitud</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(estadoConfig).map(([estado, config]) => {
          const Icon = config.icon;
          const count = solicitudes.filter(s => s.estado === estado).length;
          return (
            <Card key={estado}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  <div>
                    <p className="text-muted-foreground">{config.label}</p>
                    <h3 className="mt-1">{count}</h3>
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
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
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
                    <TableCell>{solicitud.numero}</TableCell>
                    <TableCell>{solicitud.descripcion}</TableCell>
                    <TableCell>{solicitud.usuario}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{solicitud.categoria}</Badge>
                    </TableCell>
                    <TableCell>{solicitud.monto}</TableCell>
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
                        {canCreateSolicitud && solicitud.estado === 'pendiente' && (
                          <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}