import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Users, ShoppingCart, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const statsCards = [
  {
    title: 'Total Proveedores',
    value: '156',
    change: '+12%',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Órdenes Activas',
    value: '43',
    change: '+8%',
    icon: ShoppingCart,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Productos',
    value: '892',
    change: '+23%',
    icon: Package,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Compras del Mes',
    value: '$45,231',
    change: '+15%',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const comprasData = [
  { mes: 'Ene', monto: 25000 },
  { mes: 'Feb', monto: 32000 },
  { mes: 'Mar', monto: 28000 },
  { mes: 'Abr', monto: 38000 },
  { mes: 'May', monto: 42000 },
  { mes: 'Jun', monto: 45231 },
];

const categoriesData = [
  { name: 'Materiales', value: 35 },
  { name: 'Servicios', value: 25 },
  { name: 'Equipos', value: 20 },
  { name: 'Insumos', value: 15 },
  { name: 'Otros', value: 5 },
];

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'];

const topProveedores = [
  { nombre: 'Distribuidora ABC S.A.', ordenes: 28, monto: '$12,450' },
  { nombre: 'Suministros XYZ Ltda.', ordenes: 23, monto: '$10,320' },
  { nombre: 'Proveeduría Global', ordenes: 19, monto: '$8,900' },
  { nombre: 'Materiales del Norte', ordenes: 15, monto: '$7,200' },
  { nombre: 'Importadora Sur', ordenes: 12, monto: '$6,361' },
];

export function Dashboard() {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h1>Dashboard</h1>
        <p className="text-gray-600 mt-2">Resumen general del sistema de proveeduría</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600">{stat.title}</p>
                    <h2 className="mt-2">{stat.value}</h2>
                    <p className="text-green-600 mt-1">{stat.change} vs mes anterior</p>
                  </div>
                  <div className={`${stat.bgColor} ${stat.color} p-4 rounded-lg`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compras Mensuales</CardTitle>
            <CardDescription>Evolución de compras en los últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={comprasData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="monto" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por Categoría</CardTitle>
            <CardDescription>Porcentaje de órdenes por categoría</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoriesData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoriesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Top 5 Proveedores</CardTitle>
          <CardDescription>Proveedores con mayor actividad este mes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topProveedores.map((proveedor, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-100 text-blue-600 rounded-full w-10 h-10 flex items-center justify-center">
                    {index + 1}
                  </div>
                  <div>
                    <p>{proveedor.nombre}</p>
                    <p className="text-gray-600">{proveedor.ordenes} órdenes</p>
                  </div>
                </div>
                <div>
                  <p>{proveedor.monto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
