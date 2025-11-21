import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { FileDown, FileSpreadsheet, Filter, BarChart3, TrendingUp, DollarSign, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { UserRole } from '../App';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ReportesProps {
  userRole: UserRole;
}

const reporteData = [
  { id: '1', numero: 'SOL-2024-045', usuario: 'Juan Pérez', monto: '$5,200', fecha: '2024-06-15', estado: 'pendiente', categoria: 'Equipamiento' },
  { id: '2', numero: 'SOL-2024-044', usuario: 'Ana González', monto: '$12,800', fecha: '2024-06-14', estado: 'aprobada', categoria: 'Software' },
  { id: '3', numero: 'SOL-2024-043', usuario: 'Carlos Ruiz', monto: '$8,450', fecha: '2024-06-14', estado: 'aprobada', categoria: 'Materiales' },
  { id: '4', numero: 'SOL-2024-042', usuario: 'María López', monto: '$6,900', fecha: '2024-06-13', estado: 'rechazada', categoria: 'Mobiliario' },
  { id: '5', numero: 'SOL-2024-041', usuario: 'Luis Martín', monto: '$15,200', fecha: '2024-06-13', estado: 'aprobada', categoria: 'Tecnología' },
  { id: '6', numero: 'SOL-2024-040', usuario: 'Juan Pérez', monto: '$1,200', fecha: '2024-06-12', estado: 'aprobada', categoria: 'Servicios' },
  { id: '7', numero: 'SOL-2024-039', usuario: 'Ana González', monto: '$3,450', fecha: '2024-06-11', estado: 'anulada', categoria: 'Herramientas' },
];

const montosPorMes = [
  { mes: 'Ene', aprobado: 45000, rechazado: 8000 },
  { mes: 'Feb', aprobado: 52000, rechazado: 12000 },
  { mes: 'Mar', aprobado: 48000, rechazado: 9000 },
  { mes: 'Abr', aprobado: 61000, rechazado: 11000 },
  { mes: 'May', aprobado: 58000, rechazado: 14000 },
  { mes: 'Jun', aprobado: 53550, rechazado: 6900 },
];

const montoPorCategoria = [
  { categoria: 'Tecnología', monto: 37200 },
  { categoria: 'Software', monto: 12800 },
  { categoria: 'Materiales', monto: 8450 },
  { categoria: 'Mobiliario', monto: 6900 },
  { categoria: 'Equipamiento', monto: 5200 },
  { categoria: 'Herramientas', monto: 3450 },
  { categoria: 'Servicios', monto: 1200 },
];

const estadoConfig = {
  pendiente: { className: 'bg-orange-100 text-orange-800' },
  aprobada: { className: 'bg-green-100 text-green-800' },
  rechazada: { className: 'bg-red-100 text-red-800' },
  anulada: { className: 'bg-gray-100 text-gray-800' },
};

export function Reportes({ userRole }: ReportesProps) {
  const [filterEstado, setFilterEstado] = useState('todos');
  const [fechaInicio, setFechaInicio] = useState('2024-06-01');
  const [fechaFin, setFechaFin] = useState('2024-06-30');

  const filteredData = reporteData.filter(item => {
    const matchesEstado = filterEstado === 'todos' || item.estado === filterEstado;
    return matchesEstado;
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1>Reportes</h1>
          <p className="text-gray-600 mt-2">Análisis y reportes del sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Button variant="outline">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Total Solicitudes</p>
                <h3 className="mt-1">156</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Tasa Aprobación</p>
                <h3 className="mt-1">62.8%</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Monto Aprobado</p>
                <h3 className="mt-1">$315,550</h3>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-foreground" strokeWidth={1.5} />
              <div>
                <p className="text-muted-foreground">Promedio Días</p>
                <h3 className="mt-1">3.2</h3>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Montos por Mes</CardTitle>
            <CardDescription>Comparativa de montos aprobados vs rechazados</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={montosPorMes}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="aprobado" stroke="#10b981" strokeWidth={2} name="Aprobado" />
                <Line type="monotone" dataKey="rechazado" stroke="#ef4444" strokeWidth={2} name="Rechazado" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Montos por Categoría</CardTitle>
            <CardDescription>Distribución del gasto por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={montoPorCategoria}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="categoria" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="monto" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros de Reporte</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha-inicio">Fecha Inicio</Label>
              <Input
                id="fecha-inicio"
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fecha-fin">Fecha Fin</Label>
              <Input
                id="fecha-fin"
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="estado-filter">Estado</Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="aprobada">Aprobada</SelectItem>
                  <SelectItem value="rechazada">Rechazada</SelectItem>
                  <SelectItem value="anulada">Anulada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resultados del Reporte</CardTitle>
          <CardDescription>Solicitudes que coinciden con los filtros aplicados</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Solicitud</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.numero}</TableCell>
                  <TableCell>{item.usuario}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.categoria}</Badge>
                  </TableCell>
                  <TableCell>{item.monto}</TableCell>
                  <TableCell>{new Date(item.fecha).toLocaleDateString('es-ES')}</TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={estadoConfig[item.estado as keyof typeof estadoConfig].className}
                    >
                      {item.estado}
                    </Badge>
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