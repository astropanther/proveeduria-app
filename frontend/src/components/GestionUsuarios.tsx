import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Plus, Search, Edit, Lock, Unlock, Shield, User, Briefcase, DollarSign, Loader2, AlertCircle } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { usersAPI } from '../services/api';
import { Alert, AlertDescription } from './ui/alert';

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

// Mapear roles del backend a roles del frontend
const mapBackendRoleToFrontend = (backendRole: string): string => {
  const roleMap: Record<string, string> = {
    'Administrador': 'admin',
    'Comprador': 'comprador',
    'Aprobador Jefe': 'aprobador_jefe',
    'Aprobador Financiero': 'aprobador_financiero',
  };
  return roleMap[backendRole] || 'comprador';
};

// Mapear roles del frontend a roles del backend
const mapFrontendRoleToBackend = (frontendRole: string): string => {
  const roleMap: Record<string, string> = {
    'admin': 'Administrador',
    'comprador': 'Comprador',
    'aprobador_jefe': 'Aprobador Jefe',
    'aprobador_financiero': 'Aprobador Financiero',
  };
  return roleMap[frontendRole] || 'Comprador';
};

const roleLabels = {
  admin: 'Administrador',
  comprador: 'Comprador',
  aprobador_jefe: 'Aprobador Jefe',
  aprobador_financiero: 'Aprobador Financiero',
};

export function GestionUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRol, setFilterRol] = useState('todos');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formulario de creación
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'comprador',
  });
  const [creating, setCreating] = useState(false);

  // Formulario de edición
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Usuario | null>(null);
  const [editFormData, setEditFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'comprador',
  });
  const [updating, setUpdating] = useState(false);
  const [editPasswordStrength, setEditPasswordStrength] = useState<any>(null);
  const [editSuccess, setEditSuccess] = useState('');
  const [editError, setEditError] = useState('');
  const [createPasswordStrength, setCreatePasswordStrength] = useState<any>(null);
  const [createError, setCreateError] = useState('');

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsuarios();
  }, []);

  const loadUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await usersAPI.getAll();
      
      // Mapear usuarios del backend al formato del frontend
      const mappedUsuarios: Usuario[] = response.users.map((u: any) => ({
        id: u.id.toString(),
        nombre: u.nombre || u.email.split('@')[0],
        email: u.email,
        rol: mapBackendRoleToFrontend(u.role),
        activo: u.activo !== false,
        fechaCreacion: u.created_at || new Date().toISOString(),
      }));
      
      setUsuarios(mappedUsuarios);
    } catch (err: any) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      setCreating(true);
      setError('');
      setSuccess('');
      setCreateError('');

      // Validar contraseña
      if (formData.password.length > 0) {
        const strength = validatePasswordStrength(formData.password);
        if (strength.score < 40) {
          setCreateError(strength.error || 'La contraseña es demasiado débil');
          return;
        }
      }

      await usersAPI.create({
        email: formData.email,
        password: formData.password,
        role: mapFrontendRoleToBackend(formData.rol),
        nombre: formData.nombre,
      });

      setSuccess('Usuario creado exitosamente');
      setIsDialogOpen(false);
      setFormData({ nombre: '', email: '', password: '', rol: 'comprador' });
      setCreatePasswordStrength(null);
      await loadUsuarios();
    } catch (err: any) {
      const errorMsg = err.message || 'Error al crear usuario';
      setError(errorMsg);
      setCreateError(errorMsg);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (usuario: Usuario) => {
    setEditingUser(usuario);
    setEditFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '', // No prellenar password por seguridad
      rol: usuario.rol,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      setUpdating(true);
      setError('');
      setSuccess('');
      setEditError('');

      // Validar contraseña si se está cambiando
      if (editFormData.password && editFormData.password.length > 0) {
        const strength = validatePasswordStrength(editFormData.password);
        if (strength.score < 40) {
          setEditError(strength.error || 'La contraseña es demasiado débil');
          return;
        }
      }

      const updateData: any = {
        nombre: editFormData.nombre,
        email: editFormData.email,
        role: mapFrontendRoleToBackend(editFormData.rol),
      };

      // Solo actualizar password si se proporciona uno nuevo
      if (editFormData.password && editFormData.password.length > 0) {
        updateData.password = editFormData.password;
      }

      await usersAPI.update(parseInt(editingUser.id), updateData);

      setEditSuccess('Usuario actualizado exitosamente');
      setTimeout(() => {
        setIsEditDialogOpen(false);
        setEditingUser(null);
        setEditFormData({ nombre: '', email: '', password: '', rol: 'comprador' });
        setEditPasswordStrength(null);
        setEditSuccess('');
        loadUsuarios();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al actualizar usuario';
      setError(errorMsg);
      setEditError(errorMsg);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleActivo = async (usuario: Usuario) => {
    try {
      if (usuario.activo) {
        await usersAPI.inactivate(parseInt(usuario.id));
      } else {
        await usersAPI.activate(parseInt(usuario.id));
      }
      await loadUsuarios();
      setSuccess(`Usuario ${usuario.activo ? 'inactivado' : 'activado'} exitosamente`);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar usuario');
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    const matchesSearch = u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterRol === 'todos' || u.rol === filterRol;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

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
                <Input 
                  id="nombre" 
                  placeholder="Ej: Juan Pérez" 
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="usuario@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña Temporal</Label>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setFormData({ ...formData, password: newPassword });
                    if (newPassword.length > 0) {
                      setCreatePasswordStrength(validatePasswordStrength(newPassword));
                    } else {
                      setCreatePasswordStrength(null);
                    }
                    setCreateError('');
                  }}
                />
                {createPasswordStrength && (
                  <div className="space-y-1">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full transition-all ${
                          createPasswordStrength.color === 'red' ? 'bg-red-500' :
                          createPasswordStrength.color === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${createPasswordStrength.score}%` }}
                      />
                    </div>
                    {createPasswordStrength.error && (
                      <p className="text-xs text-red-600">{createPasswordStrength.error}</p>
                    )}
                  </div>
                )}
                {createError && (
                  <p className="text-xs text-red-600">{createError}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="rol">Rol del Usuario</Label>
                <Select value={formData.rol} onValueChange={(value) => setFormData({ ...formData, rol: value })}>
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
            {createError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{createError}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsDialogOpen(false);
                setCreateError('');
                setCreatePasswordStrength(null);
              }} disabled={creating}>
                Cancelar
              </Button>
              <Button onClick={handleCreateUser} disabled={creating || (formData.password.length > 0 && createPasswordStrength && createPasswordStrength.score < 40)}>
                {creating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creando...
                  </>
                ) : (
                  'Crear Usuario'
                )}
              </Button>
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
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
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
                {filteredUsuarios.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No hay usuarios disponibles
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsuarios.map((usuario) => {
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
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEdit(usuario)}
                          title="Editar usuario"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={usuario.activo ? 'text-red-600' : 'text-green-600'}
                          onClick={() => handleToggleActivo(usuario)}
                          title={usuario.activo ? 'Inactivar usuario' : 'Activar usuario'}
                        >
                          {usuario.activo ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Edición */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario {editingUser?.nombre}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-nombre">Nombre Completo</Label>
              <Input 
                id="edit-nombre" 
                placeholder="Ej: Juan Pérez" 
                value={editFormData.nombre}
                onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Correo Electrónico</Label>
              <Input 
                id="edit-email" 
                type="email" 
                placeholder="usuario@empresa.com"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nueva Contraseña (opcional)</Label>
              <Input 
                id="edit-password" 
                type="password" 
                placeholder="Dejar vacío para mantener la actual"
                value={editFormData.password}
                onChange={(e) => {
                  const newPassword = e.target.value;
                  setEditFormData({ ...editFormData, password: newPassword });
                  if (newPassword.length > 0) {
                    setEditPasswordStrength(validatePasswordStrength(newPassword));
                  } else {
                    setEditPasswordStrength(null);
                  }
                  setEditError('');
                }}
              />
              {editPasswordStrength && (
                <div className="space-y-1">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all ${
                        editPasswordStrength.color === 'red' ? 'bg-red-500' :
                        editPasswordStrength.color === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${editPasswordStrength.score}%` }}
                    />
                  </div>
                  {editPasswordStrength.error && (
                    <p className="text-xs text-red-600">{editPasswordStrength.error}</p>
                  )}
                </div>
              )}
              {editError && (
                <p className="text-xs text-red-600">{editError}</p>
              )}
              {!editPasswordStrength && (
                <p className="text-xs text-muted-foreground">
                  Solo completa este campo si deseas cambiar la contraseña
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-rol">Rol del Usuario</Label>
              <Select value={editFormData.rol} onValueChange={(value) => setEditFormData({ ...editFormData, rol: value })}>
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
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{editError}</span>
              </div>
            </div>
          )}
          {editSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{editSuccess}</span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setEditError('');
              setEditSuccess('');
              setEditPasswordStrength(null);
            }} disabled={updating}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={updating || (editFormData.password.length > 0 && editPasswordStrength && editPasswordStrength.score < 40)}>
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Actualizando...
                </>
              ) : (
                'Actualizar Usuario'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}