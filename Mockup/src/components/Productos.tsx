import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  categoria: string;
  proveedor: string;
  precioUnitario: string;
  stock: number;
  stockMinimo: number;
  unidad: string;
}

const mockProductos: Producto[] = [
  {
    id: '1',
    codigo: 'PROD-001',
    nombre: 'Cemento Portland 50kg',
    categoria: 'Materiales',
    proveedor: 'Distribuidora ABC S.A.',
    precioUnitario: '$12.50',
    stock: 450,
    stockMinimo: 100,
    unidad: 'Saco',
  },
  {
    id: '2',
    codigo: 'PROD-002',
    nombre: 'Varilla de acero 12mm',
    categoria: 'Materiales',
    proveedor: 'Materiales del Norte',
    precioUnitario: '$8.75',
    stock: 280,
    stockMinimo: 50,
    unidad: 'Unidad',
  },
  {
    id: '3',
    codigo: 'PROD-003',
    nombre: 'Pintura Latex 20L',
    categoria: 'Insumos',
    proveedor: 'Suministros XYZ Ltda.',
    precioUnitario: '$45.00',
    stock: 85,
    stockMinimo: 30,
    unidad: 'Galón',
  },
  {
    id: '4',
    codigo: 'PROD-004',
    nombre: 'Taladro Industrial',
    categoria: 'Equipos',
    proveedor: 'Proveeduría Global',
    precioUnitario: '$320.00',
    stock: 15,
    stockMinimo: 5,
    unidad: 'Unidad',
  },
  {
    id: '5',
    codigo: 'PROD-005',
    nombre: 'Tornillos galvanizados 2"',
    categoria: 'Insumos',
    proveedor: 'Importadora Sur',
    precioUnitario: '$0.15',
    stock: 5000,
    stockMinimo: 1000,
    unidad: 'Unidad',
  },
  {
    id: '6',
    codigo: 'PROD-006',
    nombre: 'Tubería PVC 4"',
    categoria: 'Materiales',
    proveedor: 'Distribuidora ABC S.A.',
    precioUnitario: '$18.50',
    stock: 120,
    stockMinimo: 40,
    unidad: 'Metro',
  },
  {
    id: '7',
    codigo: 'PROD-007',
    nombre: 'Arena gruesa',
    categoria: 'Materiales',
    proveedor: 'Materiales del Norte',
    precioUnitario: '$25.00',
    stock: 45,
    stockMinimo: 80,
    unidad: 'm³',
  },
  {
    id: '8',
    codigo: 'PROD-008',
    nombre: 'Guantes de seguridad',
    categoria: 'Equipos',
    proveedor: 'Suministros XYZ Ltda.',
    precioUnitario: '$3.50',
    stock: 350,
    stockMinimo: 100,
    unidad: 'Par',
  },
];

export function Productos() {
  const [productos, setProductos] = useState<Producto[]>(mockProductos);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredProductos = productos.filter(p =>
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productosStockBajo = productos.filter(p => p.stock < p.stockMinimo);

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Productos</h1>
          <p className="text-gray-600 mt-2">Catálogo de productos y gestión de inventario</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Nuevo Producto</DialogTitle>
              <DialogDescription>
                Agrega un nuevo producto al catálogo
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código</Label>
                <Input id="codigo" placeholder="PROD-XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nombre-producto">Nombre</Label>
                <Input id="nombre-producto" placeholder="Nombre del producto" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria-producto">Categoría</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="materiales">Materiales</SelectItem>
                    <SelectItem value="insumos">Insumos</SelectItem>
                    <SelectItem value="equipos">Equipos</SelectItem>
                    <SelectItem value="servicios">Servicios</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="proveedor-producto">Proveedor</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="abc">Distribuidora ABC S.A.</SelectItem>
                    <SelectItem value="xyz">Suministros XYZ Ltda.</SelectItem>
                    <SelectItem value="global">Proveeduría Global</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio">Precio Unitario</Label>
                <Input id="precio" type="number" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unidad">Unidad de Medida</Label>
                <Input id="unidad" placeholder="Ej: Unidad, kg, m³" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-inicial">Stock Inicial</Label>
                <Input id="stock-inicial" type="number" placeholder="0" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock-min">Stock Mínimo</Label>
                <Input id="stock-min" type="number" placeholder="0" />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Textarea 
                  id="descripcion" 
                  placeholder="Descripción del producto..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Guardar Producto</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alerta Stock Bajo */}
      {productosStockBajo.length > 0 && (
        <Card className="border-orange-500 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Package className="h-5 w-5 text-orange-600 mt-1" />
              <div>
                <p className="text-orange-800">
                  Alerta: {productosStockBajo.length} producto(s) por debajo del stock mínimo
                </p>
                <p className="text-orange-700 mt-1">
                  {productosStockBajo.map(p => p.nombre).join(', ')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600">Total Productos</p>
            <h2 className="mt-1">{productos.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600">Categorías</p>
            <h2 className="mt-1">{new Set(productos.map(p => p.categoria)).size}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600">Stock Bajo</p>
            <h2 className="mt-1 text-orange-600">{productosStockBajo.length}</h2>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-gray-600">Proveedores</p>
            <h2 className="mt-1">{new Set(productos.map(p => p.proveedor)).size}</h2>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Catálogo de Productos</CardTitle>
            <div className="flex items-center space-x-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar producto..."
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
                <TableHead>Código</TableHead>
                <TableHead>Producto</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Unidad</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductos.map((producto) => {
                const stockBajo = producto.stock < producto.stockMinimo;
                return (
                  <TableRow key={producto.id}>
                    <TableCell>{producto.codigo}</TableCell>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{producto.categoria}</Badge>
                    </TableCell>
                    <TableCell className="text-gray-600">{producto.proveedor}</TableCell>
                    <TableCell>{producto.precioUnitario}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={stockBajo ? 'text-orange-600' : ''}>
                          {producto.stock}
                        </span>
                        {stockBajo && (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Bajo
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{producto.unidad}</TableCell>
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
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
