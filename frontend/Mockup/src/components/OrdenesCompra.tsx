import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Eye, Download, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface Orden {
  id: string;
  numero: string;
  proveedor: string;
  fecha: string;
  fechaEntrega: string;
  total: string;
  estado: 'pendiente' | 'aprobada' | 'enviada' | 'recibida' | 'cancelada';
  items: number;
}

const mockOrdenes: Orden[] = [
  {
    id: '1',
    numero: 'OC-2024-001',
    proveedor: 'Distribuidora ABC S.A.',
    fecha: '2024-06-01',
    fechaEntrega: '2024-06-15',
    total: '$5,420',
    estado: 'aprobada',
    items: 12,
  },
  {
    id: '2',
    numero: 'OC-2024-002',
    proveedor: 'Suministros XYZ Ltda.',
    fecha: '2024-06-03',
    fechaEntrega: '2024-06-17',
    total: '$3,280',
    estado: 'enviada',
    items: 8,
  },
  {
    id: '3',
    numero: 'OC-2024-003',
    proveedor: 'Proveeduría Global',
    fecha: '2024-06-05',
    fechaEntrega: '2024-06-20',
    total: '$8,950',
    estado: 'pendiente',
    items: 15,
  },
  {
    id: '4',
    numero: 'OC-2024-004',
    proveedor: 'Materiales del Norte',
    fecha: '2024-06-07',
    fechaEntrega: '2024-06-18',
    total: '$2,150',
    estado: 'recibida',
    items: 6,
  },
  {
    id: '5',
    numero: 'OC-2024-005',
    proveedor: 'Importadora Sur',
    fecha: '2024-06-08',
    fechaEntrega: '2024-06-22',
    total: '$6,780',
    estado: 'aprobada',
    items: 10,
  },
  {
    id: '6',
    numero: 'OC-2024-006',
    proveedor: 'Distribuidora ABC S.A.',
    fecha: '2024-06-10',
    fechaEntrega: '2024-06-25',
    total: '$4,330',
    estado: 'enviada',
    items: 9,
  },
];

const estadoColors = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  aprobada: 'bg-blue-100 text-blue-800',
  enviada: 'bg-purple-100 text-purple-800',
  recibida: 'bg-green-100 text-green-800',
  cancelada: 'bg-red-100 text-red-800',
};

export function OrdenesCompra() {
  const [ordenes, setOrdenes] = useState<Orden[]>(mockOrdenes);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterEstado, setFilterEstado] = useState<string>('todos');

  const filteredOrdenes = ordenes.filter(o => {
    const matchesSearch = o.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         o.proveedor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterEstado === 'todos' || o.estado === filterEstado;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Órdenes de Compra</h1>
          <p className="text-gray-600 mt-2">Gestión y seguimiento de órdenes de compra</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Orden
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nueva Orden de Compra</DialogTitle>
              <DialogDescription>
                Crea una nueva orden de compra para un proveedor
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="proveedor-select">Proveedor</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="abc">Distribuidora ABC S.A.</SelectItem>
                      <SelectItem value="xyz">Suministros XYZ Ltda.</SelectItem>
                      <SelectItem value="global">Proveeduría Global</SelectItem>
                      <SelectItem value="norte">Materiales del Norte</SelectItem>
                      <SelectItem value="sur">Importadora Sur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fecha-entrega">Fecha de Entrega</Label>
                  <Input id="fecha-entrega" type="date" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Items de la Orden</Label>
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input placeholder="Producto" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="Cantidad" type="number" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="Precio" type="number" />
                    </div>
                    <div className="col-span-2">
                      <Input placeholder="Total" disabled />
                    </div>
                    <div className="col-span-1">
                      <Button variant="outline" size="sm" className="w-full">+</Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observaciones">Observaciones</Label>
                <Textarea 
                  id="observaciones" 
                  placeholder="Notas adicionales sobre la orden..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end p-4 bg-gray-50 rounded-lg">
                <div className="text-right">
                  <p className="text-gray-600">Total de la Orden</p>
                  <p>$0.00</p>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Crear Orden</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Pendientes', count: ordenes.filter(o => o.estado === 'pendiente').length, color: 'border-yellow-500' },
          { label: 'Aprobadas', count: ordenes.filter(o => o.estado === 'aprobada').length, color: 'border-blue-500' },
          { label: 'Enviadas', count: ordenes.filter(o => o.estado === 'enviada').length, color: 'border-purple-500' },
          { label: 'Recibidas', count: ordenes.filter(o => o.estado === 'recibida').length, color: 'border-green-500' },
          { label: 'Canceladas', count: ordenes.filter(o => o.estado === 'cancelada').length, color: 'border-red-500' },
        ].map((stat, idx) => (
          <Card key={idx} className={`border-l-4 ${stat.color}`}>
            <CardContent className="p-4">
              <p className="text-gray-600">{stat.label}</p>
              <h2 className="mt-1">{stat.count}</h2>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Órdenes</CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="enviada">Enviada</SelectItem>
                  <SelectItem value="recibida">Recibida</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar orden..."
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
                <TableHead>N° Orden</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrdenes.map((orden) => (
                <TableRow key={orden.id}>
                  <TableCell>{orden.numero}</TableCell>
                  <TableCell>{orden.proveedor}</TableCell>
                  <TableCell>{new Date(orden.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{new Date(orden.fechaEntrega).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>{orden.items}</TableCell>
                  <TableCell>{orden.total}</TableCell>
                  <TableCell>
                    <Badge className={estadoColors[orden.estado]} variant="secondary">
                      {orden.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
