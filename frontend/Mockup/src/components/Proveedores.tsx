import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, Mail, Phone, MapPin } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Proveedor {
  id: string;
  nombre: string;
  contacto: string;
  email: string;
  telefono: string;
  direccion: string;
  categoria: string;
  estado: 'activo' | 'inactivo';
  ordenes: number;
}

const mockProveedores: Proveedor[] = [
  {
    id: '1',
    nombre: 'Distribuidora ABC S.A.',
    contacto: 'Juan Pérez',
    email: 'contacto@abc.com',
    telefono: '+34 123 456 789',
    direccion: 'Calle Principal 123, Madrid',
    categoria: 'Materiales',
    estado: 'activo',
    ordenes: 28,
  },
  {
    id: '2',
    nombre: 'Suministros XYZ Ltda.',
    contacto: 'María González',
    email: 'ventas@xyz.com',
    telefono: '+34 987 654 321',
    direccion: 'Av. Industrial 456, Barcelona',
    categoria: 'Insumos',
    estado: 'activo',
    ordenes: 23,
  },
  {
    id: '3',
    nombre: 'Proveeduría Global',
    contacto: 'Carlos Ruiz',
    email: 'info@global.com',
    telefono: '+34 555 123 456',
    direccion: 'Plaza Mayor 789, Valencia',
    categoria: 'Equipos',
    estado: 'activo',
    ordenes: 19,
  },
  {
    id: '4',
    nombre: 'Materiales del Norte',
    contacto: 'Ana Martínez',
    email: 'compras@norte.com',
    telefono: '+34 444 789 012',
    direccion: 'Polígono Industrial 12, Bilbao',
    categoria: 'Materiales',
    estado: 'inactivo',
    ordenes: 15,
  },
  {
    id: '5',
    nombre: 'Importadora Sur',
    contacto: 'Luis Fernández',
    email: 'contacto@sur.com',
    telefono: '+34 333 567 890',
    direccion: 'Zona Comercial 34, Sevilla',
    categoria: 'Servicios',
    estado: 'activo',
    ordenes: 12,
  },
];

export function Proveedores() {
  const [proveedores, setProveedores] = useState<Proveedor[]>(mockProveedores);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProveedores = proveedores.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contacto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Proveedores</h1>
          <p className="text-gray-600 mt-2">Gestión de proveedores y contactos</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Proveedor</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo proveedor
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre de la Empresa</Label>
                <Input id="nombre" placeholder="Ej: Distribuidora ABC S.A." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contacto">Persona de Contacto</Label>
                <Input id="contacto" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="contacto@ejemplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefono">Teléfono</Label>
                <Input id="telefono" placeholder="+34 123 456 789" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input id="direccion" placeholder="Calle, Ciudad, País" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materiales">Materiales</SelectItem>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="equipos">Equipos</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <Select defaultValue="activo">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Guardar Proveedor</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Proveedores</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar proveedor..."
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
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Órdenes</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProveedores.map((proveedor) => (
                <TableRow key={proveedor.id}>
                  <TableCell>
                    <div>
                      <p>{proveedor.nombre}</p>
                      <div className="flex items-center gap-3 text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {proveedor.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {proveedor.telefono}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{proveedor.contacto}</p>
                      <p className="text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {proveedor.direccion}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{proveedor.categoria}</Badge>
                  </TableCell>
                  <TableCell>{proveedor.ordenes}</TableCell>
                  <TableCell>
                    <Badge variant={proveedor.estado === 'activo' ? 'default' : 'secondary'}>
                      {proveedor.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
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
