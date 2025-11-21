import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Lock, Unlock, Shield, User, Briefcase, DollarSign } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  fechaCreacion: string;
}

const roleIcons = {
  admin: Shield,
  comprador: User,
  aprobador_jefe: Briefcase,
  aprobador_financiero: DollarSign,
};

const mockUsuarios: Usuario[] = [
  { id: '1', nombre: 'Admin Usuario', email: 'admin@empresa.com', rol: 'admin', activo: true, fechaCreacion: '2024-01-10' },
  { id: '2', nombre: 'Juan Pérez', email: 'juan.perez@empresa.com', rol: 'comprador', activo: true, fechaCreacion: '2024-02-15' },
  { id: '3', nombre: 'Ana González', email: 'ana.gonzalez@empresa.com', rol: 'comprador', activo: true, fechaCreacion: '2024-02-20' },
  { id: '4', nombre: 'María García', email: 'maria.garcia@empresa.com', rol: 'aprobador_jefe', activo: true, fechaCreacion: '2024-01-15' },
  { id: '5', nombre: 'Carlos López', email: 'carlos.lopez@empresa.com', rol: 'aprobador_financiero', activo: true, fechaCreacion: '2024-01-20' },
  { id: '6', nombre: 'Luis Martín', email: 'luis.martin@empresa.com', rol: 'comprador', activo: false, fechaCreacion: '2024-03-01' },
];

const roleLabels = {
  admin: 'Administrador',
  comprador: 'Comprador',
  aprobador_jefe: 'Aprobador Jefe',
  aprobador_financiero: 'Aprobador Financiero',
};

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(mockUsuarios);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRol === 'todos' || u.rol === filterRol;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Gestión de Usuarios</h1>
          <p className="text-gray-600 mt-2">Administración de usuarios del sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Crear Usuario
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Ingresa los datos del nuevo usuario del sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input id="nombre" placeholder="Ej: Juan Pérez" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input id="email" type="email" placeholder="usuario@empresa.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <Input id="password" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol del Usuario</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comprador">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Comprador
                      </div>
                    </SelectItem>
                    <SelectItem value="aprobador_jefe">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Aprobador Jefe
                      </div>
                    </SelectItem>
                    <SelectItem value="aprobador_financiero">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Aprobador Financiero
                      </div>
                    </SelectItem>
                    <SelectItem value="admin">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4" />
                        Administrador
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>Crear Usuario</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Total Usuarios</p>
                <h3 className="mt-1">{usuarios.length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Unlock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Activos</p>
                <h3 className="mt-1">{usuarios.filter(u => u.activo).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Inactivos</p>
                <h3 className="mt-1">{usuarios.filter(u => !u.activo).length}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Aprobadores</p>
                <h3 className="mt-1">
                  {usuarios.filter(u => u.rol.includes('aprobador')).length}
                </h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuarios</CardTitle>
            <div className="flex items-center gap-2">
              <Select value={filterRol} onValueChange={setFilterRol}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="comprador">Comprador</SelectItem>
                  <SelectItem value="aprobador_jefe">Aprobador Jefe</SelectItem>
                  <SelectItem value="aprobador_financiero">Aprobador Financiero</SelectItem>
                </SelectContent>
              </Select>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar usuario..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha Creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsuarios.map((usuario) => {
                const RolIcon = roleIcons[usuario.rol as keyof typeof roleIcons] || User;
                return (
                  <TableRow key={usuario.id}>
                    <TableCell>{usuario.nombre}</TableCell>
                    <TableCell className="text-gray-600">{usuario.email}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <RolIcon className="h-4 w-4 text-gray-600" />
                        <span>{roleLabels[usuario.rol as keyof typeof roleLabels]}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {usuario.activo ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Unlock className="h-3 w-3 mr-1" />
                          Activo
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <Lock className="h-3 w-3 mr-1" />
                          Inactivo
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{new Date(usuario.fechaCreacion).toLocaleDateString('es-ES')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className={usuario.activo ? 'text-red-600' : 'text-green-600'}>
                          {usuario.activo ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
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